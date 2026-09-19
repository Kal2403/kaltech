import assert from "node:assert/strict";
import { once } from "node:events";
import type { Server } from "node:http";
import { after, before, test } from "node:test";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { MongoMemoryReplSet } from "mongodb-memory-server";

import app from "../app.js";
import { Category } from "../models/Category.model.js";
import { Product } from "../models/Product.model.js";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { createProduct, updateProduct } from "./product.service.js";

let database: MongoMemoryReplSet | undefined;
let server: Server | undefined;
let baseUrl: string;
let adminToken: string;
let customerToken: string;
const previousSecret = process.env.JWT_SECRET;

before(async () => {
    process.env.JWT_SECRET = "product-contract-isolated-test-secret";
    database = await MongoMemoryReplSet.create({
        binary: { version: "8.2.6" },
        replSet: { count: 1, storageEngine: "wiredTiger", ip: "127.0.0.1" },
    });
    await mongoose.connect(database.getUri(), { dbName: "product_contract_tests" });
    await Promise.all([Category.init(), Product.init(), User.init()]);
    const password = await bcrypt.hash("unused-test-only", 4);
    const users = await User.create([
        { name: "Contract Admin", email: "admin@example.com", password, role: "admin" },
        { name: "Contract Customer", email: "customer@example.com", password, role: "customer" },
    ]);
    adminToken = jwt.sign({ userId: users[0]._id.toString() }, process.env.JWT_SECRET);
    customerToken = jwt.sign({ userId: users[1]._id.toString() }, process.env.JWT_SECRET);
    server = app.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    baseUrl = `http://127.0.0.1:${address.port}/api/products`;
}, { timeout: 180_000 });

after(async () => {
    if (previousSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousSecret;
    try {
        if (server) await new Promise<void>((resolve, reject) => server!.close((error) => error ? reject(error) : resolve()));
    } finally {
        try { await mongoose.disconnect(); }
        finally { await database?.stop(); }
    }
});

const request = (path: string, method = "GET", body?: unknown, token: string | null = adminToken) =>
    fetch(`${baseUrl}${path}`, {
        method,
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });

const fixture = async (overrides: Record<string, unknown> = {}) => {
    const slug = new mongoose.Types.ObjectId().toString();
    const category = await Category.create({ name: `Category ${slug}`, slug });
    return { name: "Portable Computer", description: "Contract test computer", price: 100, stock: 5, category: category._id.toString(), ...overrides };
};

const create = async (input: Record<string, unknown>) => {
    const response = await request("", "POST", input);
    const body = await response.json();
    assert.equal(response.status, 201, JSON.stringify(body));
    assert.equal(body.success, true);
    return body.data.product as { _id: string; slug: string };
};

test("creates without a slug, preserves it on rename, and permits explicit unique slugs", async () => {
    const input = await fixture();
    const product = await create(input);
    assert.ok(product.slug.includes(product._id));
    assert.ok(product.slug.includes("portable-computer"));
    const renamed = await request(`/${product._id}`, "PATCH", { name: "Renamed Computer" });
    assert.equal(renamed.status, 200);
    assert.equal((await Product.findById(product._id).orFail()).slug, product.slug);
    const slug = `explicit-${new mongoose.Types.ObjectId()}`;
    assert.equal((await create({ ...input, slug })).slug, slug);
    const duplicate = await request("", "POST", { ...input, slug });
    assert.equal(duplicate.status, 409);
    const conflictingUpdate = await request(`/${product._id}`, "PATCH", { slug });
    assert.equal(conflictingUpdate.status, 409);
    assert.equal((await Product.findById(product._id).orFail()).slug, product.slug);
});

test("concurrent creates resolve slug collisions as one success and one conflict", async () => {
    const input = await fixture({ slug: `race-${new mongoose.Types.ObjectId()}` });
    const results = await Promise.all([request("", "POST", input), request("", "POST", input)]);
    assert.deepEqual(results.map((result) => result.status).sort(), [201, 409]);
    assert.equal(await Product.countDocuments({ slug: input.slug }), 1);
});

test("PUT remains compatible with the PATCH contract used by the admin client", async () => {
    const product = await create(await fixture({ discountPrice: 80 }));
    const response = await request(`/${product._id}`, "PUT", { name: "Legacy PUT client", discountPrice: null });
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.success, true);
    assert.equal(body.data.product.name, "Legacy PUT client");
    const stored = await Product.findById(product._id).orFail();
    assert.equal(stored.name, "Legacy PUT client");
    assert.equal(stored.discountPrice, undefined);
    assert.equal(stored.slug, product.slug);
});

test("omitted optional fields persist while null, empty brand and empty specs clear persisted values", async () => {
    const product = await create(await fixture({ brand: "KalTech", discountPrice: 80, specs: { memory: "16 GB" } }));
    assert.equal((await request(`/${product._id}`, "PATCH", { name: "New name" })).status, 200);
    const preserved = await Product.findById(product._id).orFail();
    assert.equal(preserved.brand, "KalTech");
    assert.equal(preserved.discountPrice, 80);
    assert.deepEqual(preserved.toObject({ flattenMaps: true }).specs, { memory: "16 GB" });
    assert.equal((await request(`/${product._id}`, "PATCH", { brand: null, discountPrice: null, specs: {} })).status, 200);
    const cleared = await Product.findById(product._id).orFail();
    assert.equal(cleared.brand, undefined);
    assert.equal(cleared.discountPrice, undefined);
    assert.deepEqual(cleared.toObject({ flattenMaps: true }).specs, {});
    assert.equal((await request(`/${product._id}`, "PATCH", { brand: "Again" })).status, 200);
    assert.equal((await request(`/${product._id}`, "PATCH", { brand: "" })).status, 200);
    assert.equal((await Product.findById(product._id).orFail()).brand, undefined);
});

test("invalid values and Mongo operators are rejected without mutating a product", async () => {
    const product = await create(await fixture({ discountPrice: 80 }));
    const beforeState = (await Product.findById(product._id).orFail()).toObject();
    const invalidInputs = [
        { price: -1 }, { price: "100" }, { price: null }, { stock: 1.5 }, { stock: -1 },
        { stock: "5" }, { isActive: "false" }, { isFeatured: 1 }, { discountPrice: 100 },
        { discountPrice: -1 }, { discountPrice: "50" }, { price: 70 }, { name: " " },
        { category: { $ne: null } }, { specs: { memory: 16 } }, { images: "not-an-array" },
        { $inc: { stock: 50 } }, { $set: { price: 0 } }, { unexpectedField: true },
    ];
    for (const input of invalidInputs) {
        const response = await request(`/${product._id}`, "PATCH", input);
        assert.equal(response.status, 400, `Expected rejection: ${JSON.stringify(input)}`);
        assert.deepEqual((await Product.findById(product._id).orFail()).toObject(), beforeState);
    }
});

test("invalid creates do not persist documents", async () => {
    const input = await fixture();
    const count = await Product.countDocuments();
    for (const invalid of [{ ...input, stock: 0.5 }, { ...input, discountPrice: 101 }, { ...input, isFeatured: "true" }, { ...input, price: null }]) {
        assert.equal((await request("", "POST", invalid)).status, 400);
    }
    assert.equal(await Product.countDocuments(), count);
});

test("service rejects non-finite amounts and unsafe quantities without persistence", async () => {
    const input = await fixture();
    const product = await create(input);
    const initial = (await Product.findById(product._id).orFail()).toObject();
    const count = await Product.countDocuments();
    for (const invalid of [{ price: NaN }, { price: Infinity }, { discountPrice: Infinity }, { stock: Number.MAX_SAFE_INTEGER + 1 }]) {
        const badRequest = (error: unknown) => error instanceof ApiError && error.statusCode === 400;
        await assert.rejects(createProduct({ ...input, ...invalid }), badRequest);
        await assert.rejects(updateProduct(product._id, invalid), badRequest);
    }
    assert.equal(await Product.countDocuments(), count);
    assert.deepEqual((await Product.findById(product._id).orFail()).toObject(), initial);
});

test("missing and inactive categories cannot be assigned or used for reactivation", async () => {
    const input = await fixture();
    const inactive = await Category.create({ name: `Inactive ${new mongoose.Types.ObjectId()}`, slug: new mongoose.Types.ObjectId().toString(), isActive: false });
    const product = await create(input);
    for (const [category, status] of [[new mongoose.Types.ObjectId().toString(), 404], [inactive._id.toString(), 409]] as const) {
        const creation = await request("", "POST", { ...input, category });
        assert.equal(creation.status, status);
        const update = await request(`/${product._id}`, "PATCH", { category });
        assert.equal(update.status, status);
        assert.equal((await Product.findById(product._id).orFail()).category.toString(), input.category);
    }
    assert.equal((await request(`/${product._id}`, "DELETE")).status, 200);
    await Category.updateOne({ _id: input.category }, { $set: { isActive: false } });
    assert.equal((await request(`/${product._id}`, "PATCH", { isActive: true })).status, 409);
    assert.equal((await Product.findById(product._id).orFail()).isActive, false);
});

test("administrative reads require admin and expose inactive products only to admin", async () => {
    const product = await create(await fixture());
    assert.equal((await request(`/${product._id}`, "DELETE")).status, 200);
    for (const path of ["/admin", `/admin/${product._id}`]) {
        assert.equal((await request(path, "GET", undefined, null)).status, 401);
        assert.equal((await request(path, "GET", undefined, customerToken)).status, 403);
        assert.equal((await request(path)).status, 200);
    }
    const adminResult = await (await request(`/admin/${product._id}`)).json();
    assert.equal(adminResult.data.product.isActive, false);
    const adminList = await (await request("/admin")).json();
    assert.ok(adminList.data.products.some((item: { _id: string }) => item._id === product._id));
    assert.equal((await request(`/${product._id}`, "GET", undefined, null)).status, 404);
    const publicList = await (await request("", "GET", undefined, null)).json();
    assert.equal(publicList.success, true);
    assert.equal(publicList.data.products.some((item: { _id: string }) => item._id === product._id), false);
});

test("product mutations reject visitors and customers", async () => {
    const input = await fixture();
    const product = await create(input);
    for (const [token, status] of [[null, 401], [customerToken, 403]] as const) {
        assert.equal((await request("", "POST", input, token)).status, status);
        assert.equal((await request(`/${product._id}`, "PATCH", { price: 1 }, token)).status, status);
        assert.equal((await request(`/${product._id}`, "PUT", { price: 1 }, token)).status, status);
        assert.equal((await request(`/${product._id}`, "DELETE", undefined, token)).status, status);
    }
    const unchanged = await Product.findById(product._id).orFail();
    assert.equal(unchanged.price, 100);
    assert.equal(unchanged.isActive, true);
});

test("category PATCH and DELETE both protect active products and reject bypass inputs", async () => {
    const input = await fixture();
    const product = await create(input);
    const categoryRequest = (method: string, body?: unknown) => fetch(
        `${baseUrl.replace(/products$/, "categories")}/${input.category}`,
        { method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
            ...(body === undefined ? {} : { body: JSON.stringify(body) }) }
    );
    assert.equal((await categoryRequest("PATCH", { isActive: false })).status, 409);
    assert.equal((await categoryRequest("DELETE")).status, 409);
    for (const body of [{ $set: { isActive: false } }, { isActive: "false" }, { isActive: 0 }]) {
        assert.equal((await categoryRequest("PATCH", body)).status, 400);
    }
    assert.equal((await Category.findById(input.category).orFail()).isActive, true);
    assert.equal((await request(`/${product._id}`, "DELETE")).status, 200);
    assert.equal((await categoryRequest("PATCH", { isActive: false })).status, 200);
    assert.equal((await Category.findById(input.category).orFail()).isActive, false);
});

test("create accepts cleared optional fields from the admin form", async () => {
    const product = await create(await fixture({ discountPrice: null, brand: "", specs: {} }));
    const stored = await Product.findById(product._id).orFail();
    assert.equal(stored.discountPrice, undefined);
    assert.equal(stored.brand, undefined);
    assert.deepEqual(stored.toObject({ flattenMaps: true }).specs, {});
});
