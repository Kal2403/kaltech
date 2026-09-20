import assert from "node:assert/strict";
import { once } from "node:events";
import type { Server } from "node:http";
import { after, before, beforeEach, test } from "node:test";
import mongoose, { Types } from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";

import app from "../app.js";
import { Category } from "../models/Category.model.js";
import { Product } from "../models/Product.model.js";
import { getProducts } from "./product.service.js";

let database: MongoMemoryReplSet | undefined;
let server: Server | undefined;
let baseUrl: string;
let phoneCategoryId: Types.ObjectId;
let laptopCategoryId: Types.ObjectId;

before(async () => {
    database = await MongoMemoryReplSet.create({
        binary: { version: "8.2.6" },
        replSet: { count: 1, storageEngine: "wiredTiger", ip: "127.0.0.1" },
    });
    await mongoose.connect(database.getUri(), { dbName: "product_filter_tests" });
    await Promise.all([Category.init(), Product.init()]);

    server = app.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    baseUrl = `http://127.0.0.1:${address.port}`;
}, { timeout: 180_000 });

after(async () => {
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

    const phoneCat = await Category.create({
        name: "Smartphones",
        slug: "smartphones",
        description: "Teléfonos móviles",
        isActive: true,
    });
    phoneCategoryId = phoneCat._id as Types.ObjectId;

    const laptopCat = await Category.create({
        name: "Laptops",
        slug: "laptops",
        description: "Computadoras portátiles",
        isActive: true,
    });
    laptopCategoryId = laptopCat._id as Types.ObjectId;

    await Product.create([
        {
            name: "iPhone 15 Pro",
            slug: "iphone-15-pro",
            description: "Apple smartphone con chip A17",
            price: 1000,
            stock: 10,
            brand: "Apple",
            category: phoneCategoryId,
            rating: 4.9,
            isFeatured: true,
            isActive: true,
        },
        {
            name: "Galaxy S24 Ultra",
            slug: "galaxy-s24-ultra",
            description: "Samsung flagship con pantalla AMOLED",
            price: 900,
            stock: 5,
            brand: "Samsung",
            category: phoneCategoryId,
            rating: 4.7,
            isFeatured: true,
            isActive: true,
        },
        {
            name: "ROG Zephyrus G16",
            slug: "rog-zephyrus-g16",
            description: "Asus laptop gamer de alto rendimiento",
            price: 2000,
            stock: 0, // Out of stock
            brand: "Asus",
            category: laptopCategoryId,
            rating: 4.8,
            isFeatured: false,
            isActive: true,
        },
        {
            name: "Redmi Note 13",
            slug: "redmi-note-13",
            description: "Xiaomi smartphone económico y potente",
            price: 300,
            stock: 20,
            brand: "Xiaomi",
            category: phoneCategoryId,
            rating: 3.5,
            isFeatured: false,
            isActive: true,
        },
    ]);
});

test("filters products by category slug", async () => {
    const laptops = await getProducts({ category: "laptops" });
    assert.equal(laptops.length, 1);
    assert.equal(laptops[0].name, "ROG Zephyrus G16");

    const phones = await getProducts({ category: "smartphones" });
    assert.equal(phones.length, 3);
});

test("filters products by single or multiple brands (case-insensitive)", async () => {
    const apple = await getProducts({ brand: "apple" });
    assert.equal(apple.length, 1);
    assert.equal(apple[0].name, "iPhone 15 Pro");

    const multi = await getProducts({ brand: "Apple, Samsung" });
    assert.equal(multi.length, 2);
});

test("filters products by price range (minPrice and maxPrice)", async () => {
    const midRange = await getProducts({ minPrice: 500, maxPrice: 1500 });
    assert.equal(midRange.length, 2);
    const names = midRange.map((p) => p.name).sort();
    assert.deepEqual(names, ["Galaxy S24 Ultra", "iPhone 15 Pro"]);
});

test("filters products by minimum rating", async () => {
    const topRated = await getProducts({ minRating: 4.8 });
    assert.equal(topRated.length, 2);
    const names = topRated.map((p) => p.name).sort();
    assert.deepEqual(names, ["ROG Zephyrus G16", "iPhone 15 Pro"]);
});

test("filters products by inStock flag", async () => {
    const available = await getProducts({ inStock: true });
    assert.equal(available.length, 3);
    assert.ok(available.every((p) => p.stock > 0));
});

test("sorts products by price-asc and rating-desc", async () => {
    const sortedPriceAsc = await getProducts({ sort: "price-asc" });
    const prices = sortedPriceAsc.map((p) => p.price);
    assert.deepEqual(prices, [300, 900, 1000, 2000]);

    const sortedRatingDesc = await getProducts({ sort: "rating-desc" });
    const ratings = sortedRatingDesc.map((p) => p.rating);
    assert.deepEqual(ratings, [4.9, 4.8, 4.7, 3.5]);
});

test("GET /api/products returns filtered results via HTTP query params", async () => {
    const res = await fetch(`${baseUrl}/api/products?brand=Apple&minPrice=500&inStock=true`);
    assert.equal(res.status, 200);
    const body = (await res.json()) as {
        success: boolean;
        data: { products: Array<{ name: string; brand: string }> };
    };
    assert.equal(body.success, true);
    assert.equal(body.data.products.length, 1);
    assert.equal(body.data.products[0].brand, "Apple");
});
