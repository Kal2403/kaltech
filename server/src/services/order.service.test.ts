import assert from "node:assert/strict";
import { after, before, test, type TestContext } from "node:test";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";

import { Cart } from "../models/Cart.model.js";
import { Order } from "../models/Order.model.js";
import { Product } from "../models/Product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { createOrder } from "./order.service.js";

let database: MongoMemoryReplSet | undefined;

before(async () => {
    database = await MongoMemoryReplSet.create({
        binary: { version: "8.2.6" },
        replSet: { count: 1, storageEngine: "wiredTiger", ip: "127.0.0.1" },
    });
    await mongoose.connect(database.getUri(), { dbName: "order_service_tests" });
    await Promise.all([Cart.init(), Order.init(), Product.init()]);
}, { timeout: 180_000 });

after(async () => {
    try {
        await mongoose.disconnect();
    } finally {
        await database?.stop();
    }
});

const input = {
    shippingAddress: {
        fullName: "Test Customer", address: "Test Street 1", city: "Madrid",
        postalCode: "28001", country: "Spain", phone: "600000000",
    },
    paymentMethod: "cash",
};

const makeProduct = async (stock = 5, price = 100, discountPrice?: number) =>
    Product.create({
        name: "Test Product", slug: new mongoose.Types.ObjectId().toString(),
        description: "Isolated checkout fixture", category: new mongoose.Types.ObjectId(),
        stock, price, discountPrice, images: ["https://example.com/product.png"],
    });

const makeCart = async (items: Array<{ product: mongoose.Types.ObjectId; quantity: number }>) =>
    Cart.create({ user: new mongoose.Types.ObjectId(), items });

const assertUnchanged = async (
    cart: Awaited<ReturnType<typeof makeCart>>,
    products: Array<{ _id: mongoose.Types.ObjectId; stock: number }>
) => {
    const persisted = await Cart.findById(cart._id).orFail();
    assert.deepEqual(persisted.items.map((item) => ({
        product: item.product.toString(), quantity: item.quantity,
    })), cart.items.map((item) => ({
        product: item.product.toString(), quantity: item.quantity,
    })));
    for (const product of products) {
        assert.equal((await Product.findById(product._id).orFail()).stock, product.stock);
    }
    assert.equal(await Order.countDocuments({ user: cart.user }), 0);
};

// Both transactions finish their first real product read before either can write.
// Later reads (including driver transaction retries) pass without waiting.
const overlapProductReads = (t: TestContext) => {
    const original = mongoose.Query.prototype.exec;
    let arrivals = 0;
    let release!: () => void;
    const barrier = new Promise<void>((resolve) => { release = resolve; });
    const timer = setTimeout(release, 10_000);
    t.after(() => clearTimeout(timer));
    t.mock.method(mongoose.Query.prototype, "exec", async function (this: mongoose.Query<unknown, unknown>) {
        const result = await original.call(this);
        if (this.model.modelName === "Product" && this.getOptions().session && arrivals < 2) {
            arrivals++;
            if (arrivals === 2) release();
            await barrier;
            assert.equal(arrivals, 2, "Both checkouts must overlap before their first write");
        }
        return result;
    });
    return () => assert.equal(arrivals, 2);
};

test("checkout commits stock, price snapshots, totals and an empty cart", async () => {
    const product = await makeProduct(5, 100, 80);
    const cart = await makeCart([{ product: product._id, quantity: 2 }]);
    const order = await createOrder(cart.user.toString(), input);
    const persisted = await Order.findById(order._id).orFail();
    assert.equal(persisted.items[0]!.price, 80);
    assert.equal(persisted.items[0]!.quantity, 2);
    assert.equal(persisted.items[0]!.name, product.name);
    assert.equal(persisted.items[0]!.image, product.images[0]);
    assert.equal(persisted.subtotal, 160);
    assert.equal(persisted.tax, 28.8);
    assert.equal(persisted.shippingCost, 25);
    assert.equal(persisted.total, 213.8);
    assert.equal((await Product.findById(product._id).orFail()).stock, 3);
    assert.equal((await Cart.findById(cart._id).orFail()).items.length, 0);
});

test("invalid checkout input performs no database writes", async (t) => {
    const product = await makeProduct();
    const cart = await makeCart([{ product: product._id, quantity: 1 }]);
    const transaction = t.mock.method(mongoose.connection, "transaction", async () => {
        assert.fail("Invalid input must be rejected before opening a transaction");
    });
    await assert.rejects(createOrder(cart.user.toString(), {}), (error: unknown) =>
        error instanceof ApiError && error.statusCode === 400);
    assert.equal(transaction.mock.callCount(), 0);
    await assertUnchanged(cart, [product]);
});

test("insufficient stock on a second product leaves the entire checkout unchanged", async () => {
    const first = await makeProduct();
    const second = await makeProduct(0);
    const cart = await makeCart([
        { product: first._id, quantity: 1 }, { product: second._id, quantity: 1 },
    ]);
    await assert.rejects(createOrder(cart.user.toString(), input), (error: unknown) =>
        error instanceof ApiError && error.statusCode === 400);
    await assertUnchanged(cart, [first, second]);
});

test("fractional cart quantities are rejected without changing persisted data", async () => {
    const product = await makeProduct();
    const cart = await makeCart([{ product: product._id, quantity: 1.5 }]);
    await assert.rejects(createOrder(cart.user.toString(), input), (error: unknown) =>
        error instanceof ApiError && error.statusCode === 400);
    await assertUnchanged(cart, [product]);
});

test("duplicate product lines roll back the first stock write when the second cannot reserve stock", async () => {
    const product = await makeProduct(1);
    const cart = await makeCart([
        { product: product._id, quantity: 1 },
        { product: product._id, quantity: 1 },
    ]);
    await assert.rejects(createOrder(cart.user.toString(), input), (error: unknown) =>
        error instanceof ApiError && error.statusCode === 409 &&
        error.message === "Product availability changed; please retry checkout");
    await assertUnchanged(cart, [product]);
});

test("an inactive product prevents checkout without writes", async () => {
    const product = await makeProduct();
    product.isActive = false;
    await product.save();
    const cart = await makeCart([{ product: product._id, quantity: 1 }]);
    await assert.rejects(createOrder(cart.user.toString(), input), (error: unknown) =>
        error instanceof ApiError && error.statusCode === 400);
    await assertUnchanged(cart, [product]);
});

test("a cart reference to a missing product prevents checkout without writes", async () => {
    const cart = await makeCart([{ product: new mongoose.Types.ObjectId(), quantity: 1 }]);
    await assert.rejects(createOrder(cart.user.toString(), input), (error: unknown) =>
        error instanceof ApiError && error.statusCode === 400);
    await assertUnchanged(cart, []);
});

for (const failureAt of ["order", "cart"] as const) {
    test(`failure after a real ${failureAt} save rolls back every checkout write`, async (t) => {
        const product = await makeProduct();
        const cart = await makeCart([{ product: product._id, quantity: 2 }]);
        const failure = new Error(`Injected failure after ${failureAt} persistence`);
        let injected = false;
        if (failureAt === "order") {
            const original = Order.prototype.save;
            t.mock.method(Order.prototype, "save", async function (this: InstanceType<typeof Order>, options) {
                await original.call(this, options);
                assert.equal(await Order.countDocuments({ _id: this._id }).session(this.$session()!), 1);
                injected = true;
                throw failure;
            });
        } else {
            const original = Cart.prototype.save;
            t.mock.method(Cart.prototype, "save", async function (this: InstanceType<typeof Cart>, options) {
                await original.call(this, options);
                const saved = await Cart.findById(this._id).session(this.$session()!).orFail();
                assert.equal(saved.items.length, 0);
                assert.equal(await Order.countDocuments({ user: this.user }).session(this.$session()!), 1);
                injected = true;
                throw failure;
            });
        }
        await assert.rejects(createOrder(cart.user.toString(), input), (error: unknown) => error === failure);
        assert.equal(injected, true);
        await assertUnchanged(cart, [product]);
    });
}

test("simultaneous customers cannot both buy the last unit", async (t) => {
    const product = await makeProduct(1);
    const first = await makeCart([{ product: product._id, quantity: 1 }]);
    const second = await makeCart([{ product: product._id, quantity: 1 }]);
    const assertOverlapped = overlapProductReads(t);
    const results = await Promise.allSettled([
        createOrder(first.user.toString(), input), createOrder(second.user.toString(), input),
    ]);
    assertOverlapped();
    assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
    assert.equal(results.filter((result) => result.status === "rejected").length, 1);
    assert.equal(await Order.countDocuments({ user: { $in: [first.user, second.user] } }), 1);
    assert.equal((await Product.findById(product._id).orFail()).stock, 0);
    for (const [index, cart] of [first, second].entries()) {
        const persisted = await Cart.findById(cart._id).orFail();
        assert.equal(persisted.items.length, results[index]!.status === "fulfilled" ? 0 : 1);
    }
});

test("simultaneous checkout of one cart creates only one order", async (t) => {
    const product = await makeProduct(5);
    const cart = await makeCart([{ product: product._id, quantity: 1 }]);
    const assertOverlapped = overlapProductReads(t);
    const results = await Promise.allSettled([
        createOrder(cart.user.toString(), input), createOrder(cart.user.toString(), input),
    ]);
    assertOverlapped();
    assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
    assert.equal(await Order.countDocuments({ user: cart.user }), 1);
    assert.equal((await Product.findById(product._id).orFail()).stock, 4);
    assert.equal((await Cart.findById(cart._id).orFail()).items.length, 0);
});

test("retrying an already checked-out cart cannot create another order", async () => {
    const product = await makeProduct();
    const cart = await makeCart([{ product: product._id, quantity: 1 }]);
    await createOrder(cart.user.toString(), input);
    await assert.rejects(createOrder(cart.user.toString(), input), (error: unknown) =>
        error instanceof ApiError && error.statusCode === 400 && error.message === "Cart is empty");
    assert.equal(await Order.countDocuments({ user: cart.user }), 1);
    assert.equal((await Product.findById(product._id).orFail()).stock, 4);
});

test("a stale cart document cannot resurrect items after checkout", async () => {
    const product = await makeProduct();
    const cart = await makeCart([{ product: product._id, quantity: 1 }]);
    const stale = await Cart.findById(cart._id).orFail();
    await createOrder(cart.user.toString(), input);
    stale.items[0]!.quantity = 2;
    await assert.rejects(stale.save(), mongoose.Error.VersionError);
    assert.equal((await Cart.findById(cart._id).orFail()).items.length, 0);
    assert.equal((await Product.findById(product._id).orFail()).stock, 4);
    assert.equal(await Order.countDocuments({ user: cart.user }), 1);
});
