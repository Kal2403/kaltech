import assert from "node:assert/strict";
import { after, before, test, type TestContext } from "node:test";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { MongoMemoryReplSet } from "mongodb-memory-server";

import { Order, type OrderStatus } from "../models/Order.model.js";
import { Product } from "../models/Product.model.js";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { updateOrderStatus } from "./order.service.js";

let database: MongoMemoryReplSet | undefined;

before(async () => {
    database = await MongoMemoryReplSet.create({
        binary: { version: "8.2.6" },
        replSet: { count: 1, storageEngine: "wiredTiger", ip: "127.0.0.1" },
    });
    await mongoose.connect(database.getUri(), { dbName: "order_cancellation_tests" });
    await Promise.all([Order.init(), Product.init(), User.init()]);
}, { timeout: 180_000 });

after(async () => {
    try {
        await mongoose.disconnect();
    } finally {
        await database?.stop();
    }
});

const makeProduct = async (stock = 3, isActive = true) => Product.create({
    name: "Cancellation Product", slug: new mongoose.Types.ObjectId().toString(),
    description: "Isolated cancellation fixture", category: new mongoose.Types.ObjectId(),
    price: 100, stock, isActive,
});

const makeOrder = async (
    items: Array<{ product: mongoose.Types.ObjectId; quantity: number }>,
    orderStatus: OrderStatus = "pending"
) => {
    const user = await User.create({
        name: "Cancellation Customer",
        email: `${new mongoose.Types.ObjectId()}@example.com`,
        password: await bcrypt.hash("test-only-password", 4),
    });
    return Order.create({
        user: user._id, orderStatus,
        items: items.map((item) => ({ ...item, name: "Product snapshot", price: 100 })),
        shippingAddress: {
            fullName: "Test Customer", address: "Test Street 1", city: "Madrid",
            postalCode: "28001", country: "Spain", phone: "600000000",
        },
        paymentMethod: "cash", subtotal: 100, tax: 18, shippingCost: 25, total: 143,
    });
};

const conflict = (error: unknown) => error instanceof ApiError && error.statusCode === 409;

const assertState = async (
    orderId: mongoose.Types.ObjectId,
    status: OrderStatus,
    products: Array<{ _id: mongoose.Types.ObjectId; stock: number }>
) => {
    assert.equal((await Order.findById(orderId).orFail()).orderStatus, status);
    for (const product of products) {
        assert.equal((await Product.findById(product._id).orFail()).stock, product.stock);
    }
};

const overlapOrderReads = (t: TestContext) => {
    const original = mongoose.Query.prototype.exec;
    let arrivals = 0;
    let release!: () => void;
    const barrier = new Promise<void>((resolve) => { release = resolve; });
    const timer = setTimeout(release, 10_000);
    t.after(() => clearTimeout(timer));
    t.mock.method(mongoose.Query.prototype, "exec", async function (this: mongoose.Query<unknown, unknown>) {
        const result = await original.call(this);
        if (this.model.modelName === "Order" && this.op === "findOne" &&
            this.getOptions().session && arrivals < 2) {
            arrivals++;
            if (arrivals === 2) release();
            await barrier;
            assert.equal(arrivals, 2, "Both transactions must read the original order before writing");
        }
        return result;
    });
    return () => assert.equal(arrivals, 2);
};

test("cancelling a pending multi-item order restores every quantity and preserves the response contract", async () => {
    const first = await makeProduct(3);
    const second = await makeProduct(0);
    const order = await makeOrder([
        { product: first._id, quantity: 2 }, { product: second._id, quantity: 4 },
    ]);
    const result = await updateOrderStatus(order._id.toString(), "cancelled");
    await assertState(order._id, "cancelled", [{ _id: first._id, stock: 5 }, { _id: second._id, stock: 4 }]);
    const user = result.user as unknown as { name: string; email: string; password?: string };
    assert.equal(user.name, "Cancellation Customer");
    assert.match(user.email, /@example\.com$/);
    assert.equal(user.password, undefined);
    assert.equal(result.total, order.total);
    assert.equal(result.paymentStatus, order.paymentStatus);
    assert.equal(result.items[0]!.name, "Product snapshot");
    assert.equal(result.items[0]!.product.toString(), first._id.toString());
});

test("processing orders can be cancelled and cancellation retries do not restock twice", async () => {
    const product = await makeProduct();
    const order = await makeOrder([{ product: product._id, quantity: 2 }], "processing");
    await updateOrderStatus(order._id.toString(), "cancelled");
    const retry = await updateOrderStatus(order._id.toString(), "cancelled");
    assert.equal(retry.orderStatus, "cancelled");
    await assertState(order._id, "cancelled", [{ _id: product._id, stock: 5 }]);
});

test("legacy cancelled orders remain unchanged when cancellation is retried", async () => {
    const product = await makeProduct();
    const order = await makeOrder([{ product: product._id, quantity: 2 }], "cancelled");
    await updateOrderStatus(order._id.toString(), "cancelled");
    await assertState(order._id, "cancelled", [product]);
});

for (const status of ["shipped", "delivered"] as const) {
    test(`${status} orders cannot be cancelled`, async () => {
        const product = await makeProduct();
        const order = await makeOrder([{ product: product._id, quantity: 2 }], status);
        await assert.rejects(updateOrderStatus(order._id.toString(), "cancelled"), conflict);
        await assertState(order._id, status, [product]);
    });
}

test("inactive products receive returned stock without being reactivated", async () => {
    const product = await makeProduct(3, false);
    const order = await makeOrder([{ product: product._id, quantity: 2 }]);
    await updateOrderStatus(order._id.toString(), "cancelled");
    await assertState(order._id, "cancelled", [{ _id: product._id, stock: 5 }]);
    assert.equal((await Product.findById(product._id).orFail()).isActive, false);
});

test("a missing second product aborts cancellation and rolls back earlier restocking", async () => {
    const product = await makeProduct();
    const order = await makeOrder([
        { product: product._id, quantity: 2 },
        { product: new mongoose.Types.ObjectId(), quantity: 1 },
    ]);
    await assert.rejects(updateOrderStatus(order._id.toString(), "cancelled"), conflict);
    await assertState(order._id, "pending", [product]);
});

for (const quantity of [0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1]) {
    test(`invalid legacy quantity ${quantity} aborts cancellation without changes`, async () => {
        const product = await makeProduct();
        const order = await makeOrder([{ product: product._id, quantity: 1 }]);
        // Simulate historic corrupt data without relaxing the application schema.
        await Order.collection.updateOne({ _id: order._id }, { $set: { "items.0.quantity": quantity } });
        await assert.rejects(updateOrderStatus(order._id.toString(), "cancelled"), conflict);
        await assertState(order._id, "pending", [product]);
    });
}

test("concurrent cancellations restore stock exactly once", async (t) => {
    const product = await makeProduct();
    const order = await makeOrder([{ product: product._id, quantity: 2 }]);
    const assertOverlapped = overlapOrderReads(t);
    const results = await Promise.allSettled([
        updateOrderStatus(order._id.toString(), "cancelled"),
        updateOrderStatus(order._id.toString(), "cancelled"),
    ]);
    assertOverlapped();
    assert.equal(results.filter((result) => result.status === "fulfilled").length, 2);
    await assertState(order._id, "cancelled", [{ _id: product._id, stock: 5 }]);
});

for (const stock of [-1, 1.5, Number.MAX_SAFE_INTEGER]) {
    test(`unsafe resulting stock from ${stock} aborts cancellation`, async () => {
        const product = await makeProduct();
        const order = await makeOrder([{ product: product._id, quantity: 2 }]);
        await Product.collection.updateOne({ _id: product._id }, { $set: { stock } });
        await assert.rejects(updateOrderStatus(order._id.toString(), "cancelled"), conflict);
        await assertState(order._id, "pending", [{ _id: product._id, stock }]);
    });
}

test("shipping and cancellation racing from processing commit only one valid outcome", async (t) => {
    const product = await makeProduct();
    const order = await makeOrder([{ product: product._id, quantity: 2 }], "processing");
    const assertOverlapped = overlapOrderReads(t);
    const results = await Promise.allSettled([
        updateOrderStatus(order._id.toString(), "shipped"),
        updateOrderStatus(order._id.toString(), "cancelled"),
    ]);
    assertOverlapped();
    assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
    const rejected = results.find((result) => result.status === "rejected");
    assert.ok(rejected && conflict(rejected.reason));
    const final = await Order.findById(order._id).orFail();
    assert.ok(final.orderStatus === "shipped" || final.orderStatus === "cancelled");
    await assertState(order._id, final.orderStatus, [{
        _id: product._id, stock: final.orderStatus === "cancelled" ? 5 : 3,
    }]);
});

for (const failureAt of ["Product", "Order"] as const) {
    test(`failure after a real ${failureAt} update rolls back stock and order status`, async (t) => {
        const product = await makeProduct();
        const order = await makeOrder([{ product: product._id, quantity: 2 }]);
        const original = mongoose.Query.prototype.exec;
        const failure = new Error(`Injected failure after ${failureAt} write`);
        let injected = false;
        t.mock.method(mongoose.Query.prototype, "exec", async function (this: mongoose.Query<unknown, unknown>) {
            const result = await original.call(this);
            const operation = failureAt === "Product" ? "updateOne" : "findOneAndUpdate";
            if (this.model.modelName === failureAt && this.op === operation && this.getOptions().session) {
                const session = this.getOptions().session!;
                if (failureAt === "Product") {
                    assert.equal((await Product.findById(product._id).session(session).orFail()).stock, 5);
                } else {
                    assert.equal((await Order.findById(order._id).session(session).orFail()).orderStatus, "cancelled");
                }
                injected = true;
                throw failure;
            }
            return result;
        });
        await assert.rejects(updateOrderStatus(order._id.toString(), "cancelled"), (error: unknown) => error === failure);
        assert.equal(injected, true);
        await assertState(order._id, "pending", [product]);
    });
}

test("non-cancellation transitions and same-status updates never change stock", async () => {
    const product = await makeProduct();
    const order = await makeOrder([{ product: product._id, quantity: 2 }]);
    for (const status of ["pending", "processing", "processing", "shipped", "delivered", "delivered"] as const) {
        const result = await updateOrderStatus(order._id.toString(), status);
        assert.equal(result.orderStatus, status);
        const user = result.user as unknown as { name: string; email: string };
        assert.equal(user.name, "Cancellation Customer");
        assert.match(user.email, /@example\.com$/);
        await assertState(order._id, status, [product]);
    }
});
