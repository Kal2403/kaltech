import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";

import { Category } from "../models/Category.model.js";
import { Product } from "../models/Product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { updateProduct } from "./product.service.js";

let database: MongoMemoryReplSet | undefined;

before(async () => {
    database = await MongoMemoryReplSet.create({
        binary: { version: "8.2.6" },
        replSet: { count: 1, storageEngine: "wiredTiger", ip: "127.0.0.1" },
    });
    await mongoose.connect(database.getUri(), { dbName: "product_concurrency_tests" });
    await Promise.all([Category.init(), Product.init()]);
}, { timeout: 180_000 });

after(async () => {
    try {
        await mongoose.disconnect();
    } finally {
        await database?.stop();
    }
});

const makeProduct = async () => {
    const slug = new mongoose.Types.ObjectId().toString();
    const category = await Category.create({ name: slug, slug });
    return Product.create({
        name: "Concurrent Product", slug, description: "Isolated fixture",
        category: category._id, price: 100, discountPrice: 50, stock: 5,
    });
};

test("concurrent price and discount edits cannot commit an invalid combination", async (t) => {
    const product = await makeProduct();
    const original = mongoose.Query.prototype.exec;
    let arrivals = 0;
    let release!: () => void;
    const barrier = new Promise<void>((resolve) => { release = resolve; });
    const timer = setTimeout(release, 10_000);
    t.after(() => clearTimeout(timer));
    t.mock.method(mongoose.Query.prototype, "exec", async function (this: mongoose.Query<unknown, unknown>) {
        const result = await original.call(this);
        if (this.model.modelName === "Product" && this.op === "findOne" && arrivals < 2) {
            arrivals++;
            if (arrivals === 2) release();
            await barrier;
            assert.equal(arrivals, 2, "Both updates must read the same initial state");
        }
        return result;
    });
    const results = await Promise.allSettled([
        updateProduct(product.id, { price: 60 }),
        updateProduct(product.id, { discountPrice: 80 }),
    ]);
    assert.equal(arrivals, 2);
    assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
    const rejected = results.find((result) => result.status === "rejected");
    assert.ok(rejected?.reason instanceof ApiError);
    assert.equal(rejected.reason.statusCode, 409);
    const persisted = await Product.findById(product._id).orFail();
    assert.ok(persisted.discountPrice! < persisted.price);
    assert.ok((persisted.price === 60 && persisted.discountPrice === 50) ||
        (persisted.price === 100 && persisted.discountPrice === 80));
});

for (const explicitStock of [false, true]) {
    test(explicitStock
        ? "an explicit stock edit conflicts with a decrement after its read"
        : "an edit omitting stock preserves a decrement after its read", async (t) => {
        const product = await makeProduct();
        const original = mongoose.Query.prototype.exec;
        let decremented = false;
        t.mock.method(mongoose.Query.prototype, "exec", async function (this: mongoose.Query<unknown, unknown>) {
            const result = await original.call(this);
            if (!decremented && this.model.modelName === "Product" && this.op === "findOne") {
                decremented = true;
                // Real inventory write strictly between the service read and its CAS update.
                const write = await Product.updateOne({ _id: product._id, stock: { $gte: 1 } }, { $inc: { stock: -1 } });
                assert.equal(write.modifiedCount, 1);
            }
            return result;
        });
        const updating = updateProduct(product.id, {
            name: "Updated Product", ...(explicitStock ? { stock: 10 } : {}),
        });
        if (explicitStock) {
            await assert.rejects(updating, (error: unknown) => error instanceof ApiError && error.statusCode === 409);
        } else {
            await updating;
        }
        assert.equal(decremented, true);
        const persisted = await Product.findById(product._id).orFail();
        assert.equal(persisted.stock, 4);
        assert.equal(persisted.name, explicitStock ? product.name : "Updated Product");
    });
}
