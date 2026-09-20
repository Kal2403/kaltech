import assert from "node:assert/strict";
import { once } from "node:events";
import type { Server } from "node:http";
import { after, before, beforeEach, test } from "node:test";
import mongoose, { Types } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { MongoMemoryReplSet } from "mongodb-memory-server";

import app from "../app.js";
import { Category } from "../models/Category.model.js";
import { Product } from "../models/Product.model.js";
import { User } from "../models/User.model.js";
import {
    generateProductSlug,
    mapDummyToProductData,
    syncDummyTechProducts,
    type DummyProductItem,
} from "./dummy-product.service.js";

let database: MongoMemoryReplSet | undefined;
let server: Server | undefined;
let baseUrl: string;
let adminToken: string;
let customerToken: string;
const previousSecret = process.env.JWT_SECRET;

const sampleDummyProduct: DummyProductItem = {
    id: 999,
    title: "Super Laptop Pro 16",
    description: "High-performance laptop for developers and creators",
    category: "laptops",
    price: 1999.99,
    discountPercentage: 10,
    rating: 4.85,
    stock: 15,
    brand: "TechBrand",
    thumbnail: "https://example.com/laptop-thumb.jpg",
    images: [
        "https://example.com/laptop-thumb.jpg",
        "https://example.com/laptop-1.jpg",
    ],
    warrantyInformation: "2 years manufacturer warranty",
    shippingInformation: "Free expedited shipping",
    availabilityStatus: "In Stock",
    returnPolicy: "30 days return",
    weight: 2.1,
    reviews: [
        {
            rating: 5,
            comment: "Increíble laptop para programar",
            date: "2025-05-01T10:00:00.000Z",
            reviewerName: "Alex Dev",
            reviewerEmail: "alex@example.com",
        },
    ],
};

before(async () => {
    process.env.JWT_SECRET = "dummy-sync-test-secret";
    database = await MongoMemoryReplSet.create({
        binary: { version: "8.2.6" },
        replSet: { count: 1, storageEngine: "wiredTiger", ip: "127.0.0.1" },
    });
    await mongoose.connect(database.getUri(), { dbName: "dummy_sync_tests" });
    await Promise.all([Category.init(), Product.init(), User.init()]);

    const password = await bcrypt.hash("test-pass", 4);
    const users = await User.create([
        { name: "Sync Admin", email: "admin@test.com", password, role: "admin" },
        { name: "Sync Customer", email: "customer@test.com", password, role: "customer" },
    ]);

    adminToken = jwt.sign({ userId: users[0]._id.toString() }, process.env.JWT_SECRET);
    customerToken = jwt.sign({ userId: users[1]._id.toString() }, process.env.JWT_SECRET);

    server = app.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    baseUrl = `http://127.0.0.1:${address.port}`;
}, { timeout: 180_000 });

after(async () => {
    if (previousSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousSecret;

    try {
        if (server) {
            await new Promise<void>((resolve, reject) =>
                server!.close((err) => (err ? reject(err) : resolve()))
            );
        }
    } finally {
        try {
            await mongoose.disconnect();
        } finally {
            await database?.stop();
        }
    }
});

beforeEach(async () => {
    await Product.deleteMany({});
    await Category.deleteMany({});
});

test("generateProductSlug normalizes accents and appends ID", () => {
    assert.equal(
        generateProductSlug("Teléfono Móvil Pro", 101),
        "telefono-movil-pro-101"
    );
    assert.equal(
        generateProductSlug("MacBook Pro M3 Max", 55),
        "macbook-pro-m3-max-55"
    );
});

test("mapDummyToProductData correctly maps discount, specs and images", () => {
    const fakeCategoryId = new Types.ObjectId();
    const mapped = mapDummyToProductData(sampleDummyProduct, fakeCategoryId);

    assert.equal(mapped.name, "Super Laptop Pro 16");
    assert.equal(mapped.slug, "super-laptop-pro-16-999");
    assert.equal(mapped.price, 1999.99);
    assert.equal(mapped.discountPrice, 1799.99);
    assert.equal(mapped.stock, 15);
    assert.equal(mapped.brand, "TechBrand");
    assert.equal(mapped.category, fakeCategoryId);
    assert.equal(mapped.isFeatured, true);
    assert.equal(mapped.images.length, 2);
    assert.equal(mapped.specs.dummyId, "999");
    assert.equal(mapped.specs.garantia, "2 years manufacturer warranty");
    assert.equal(mapped.rating, 4.85);
    assert.equal(mapped.reviewsCount, 1);
    assert.equal(mapped.reviews.length, 1);
    assert.equal(mapped.reviews[0].comment, "Increíble laptop para programar");
    assert.equal(mapped.reviews[0].reviewerName, "Alex Dev");
});

test("syncDummyTechProducts upserts categories and products without duplication", async (t) => {
    // Mock global fetch to return controlled products only for dummyjson.com
    const originalFetch = globalThis.fetch;
    t.after(() => {
        globalThis.fetch = originalFetch;
    });

    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const urlStr = String(input);
        if (urlStr.includes("dummyjson.com")) {
            const products = urlStr.includes("laptops")
                ? [sampleDummyProduct]
                : [];
            return new Response(JSON.stringify({ products }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }
        return originalFetch(input, init);
    };

    // First sync: should insert
    const result1 = await syncDummyTechProducts();
    assert.equal(result1.success, true);
    assert.equal(result1.categoriesSynced, 4);
    assert.equal(result1.productsInserted, 1);
    assert.equal(result1.productsUpdated, 0);

    const countAfterFirst = await Product.countDocuments();
    assert.equal(countAfterFirst, 1);

    const saved = await Product.findOne({ slug: "super-laptop-pro-16-999" });
    assert.ok(saved);
    assert.equal(saved.rating, 4.85);
    assert.equal(saved.reviewsCount, 1);
    assert.equal(saved.reviews?.length, 1);
    assert.equal(saved.reviews?.[0]?.comment, "Increíble laptop para programar");

    // Second sync: should update without inserting duplicate
    const result2 = await syncDummyTechProducts();
    assert.equal(result2.success, true);
    assert.equal(result2.productsInserted, 0);
    assert.equal(result2.productsUpdated, 1);

    const countAfterSecond = await Product.countDocuments();
    assert.equal(countAfterSecond, 1);
});

test("POST /api/products/sync-dummy requires admin authentication", async (t) => {
    const originalFetch = globalThis.fetch;
    t.after(() => {
        globalThis.fetch = originalFetch;
    });

    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const urlStr = String(input);
        if (urlStr.includes("dummyjson.com")) {
            return new Response(JSON.stringify({ products: [] }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }
        return originalFetch(input, init);
    };

    // 1. Unauthenticated -> 401
    const resNoAuth = await fetch(`${baseUrl}/api/products/sync-dummy`, {
        method: "POST",
    });
    assert.equal(resNoAuth.status, 401);

    // 2. Customer -> 403
    const resCustomer = await fetch(`${baseUrl}/api/products/sync-dummy`, {
        method: "POST",
        headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert.equal(resCustomer.status, 403);

    // 3. Admin -> 200
    const resAdmin = await fetch(`${baseUrl}/api/products/sync-dummy`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(resAdmin.status, 200);
    const body = (await resAdmin.json()) as { success: boolean; message: string; data: unknown };
    assert.equal(body.success, true);
    assert.match(body.message, /synchronized successfully/i);
});
