import assert from "node:assert/strict";
import { once } from "node:events";
import type { Server } from "node:http";
import { after, before, beforeEach, test } from "node:test";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";

import app from "../app.js";
import { Category } from "../models/Category.model.js";
import { Product } from "../models/Product.model.js";
import { getProducts } from "./product.service.js";
import { getCategories } from "./category.service.js";

let database: MongoMemoryReplSet | undefined;
let server: Server | undefined;
let baseUrl: string;

before(async () => {
    process.env.JWT_SECRET = "categories-offers-test-secret";
    database = await MongoMemoryReplSet.create({
        binary: { version: "8.2.6" },
        replSet: { count: 1, storageEngine: "wiredTiger", ip: "127.0.0.1" },
    });
    await mongoose.connect(database.getUri(), { dbName: "categories_offers_tests" });
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
});

test("getProducts with hasDiscount: true returns only discounted products", async () => {
    const category = await Category.create({
        name: "Laptops",
        slug: "laptops",
        description: "Laptops and portables",
        isActive: true,
    });

    await Product.create([
        {
            name: "MacBook Pro Regular",
            slug: "macbook-pro-regular",
            description: "No discount laptop",
            price: 2000,
            stock: 10,
            images: ["https://example.com/img1.jpg"],
            category: category._id,
            isActive: true,
        },
        {
            name: "MacBook Pro Sale",
            slug: "macbook-pro-sale",
            description: "Discounted laptop",
            price: 2500,
            discountPrice: 2199,
            stock: 5,
            images: ["https://example.com/img2.jpg"],
            category: category._id,
            isActive: true,
        },
        {
            name: "Dell XPS Sale",
            slug: "dell-xps-sale",
            description: "Great deal laptop",
            price: 1800,
            discountPrice: 1499,
            stock: 8,
            images: ["https://example.com/img3.jpg"],
            category: category._id,
            isActive: true,
        },
    ]);

    const allProducts = await getProducts();
    assert.equal(allProducts.length, 3);

    const discountedProducts = await getProducts({ hasDiscount: true });
    assert.equal(discountedProducts.length, 2);
    assert.ok(discountedProducts.every((p) => p.discountPrice != null && p.discountPrice < p.price));
    assert.ok(discountedProducts.some((p) => p.slug === "macbook-pro-sale"));
    assert.ok(discountedProducts.some((p) => p.slug === "dell-xps-sale"));
});

test("getCategories enriches categories with active productCount", async () => {
    const catLaptops = await Category.create({
        name: "Laptops",
        slug: "laptops",
        description: "Portátiles",
        isActive: true,
    });

    const catSmartphones = await Category.create({
        name: "Smartphones",
        slug: "smartphones",
        description: "Teléfonos",
        isActive: true,
    });

    const catEmpty = await Category.create({
        name: "Tablets",
        slug: "tablets",
        description: "Tablets",
        isActive: true,
    });

    await Product.create([
        {
            name: "Laptop 1",
            slug: "laptop-1",
            description: "Laptop 1",
            price: 1000,
            stock: 5,
            images: ["https://example.com/img.jpg"],
            category: catLaptops._id,
            isActive: true,
        },
        {
            name: "Laptop 2",
            slug: "laptop-2",
            description: "Laptop 2",
            price: 1200,
            stock: 3,
            images: ["https://example.com/img.jpg"],
            category: catLaptops._id,
            isActive: true,
        },
        {
            name: "Inactive Laptop",
            slug: "inactive-laptop",
            description: "Inactive Laptop",
            price: 900,
            stock: 0,
            images: ["https://example.com/img.jpg"],
            category: catLaptops._id,
            isActive: false,
        },
        {
            name: "Phone 1",
            slug: "phone-1",
            description: "Phone 1",
            price: 800,
            stock: 12,
            images: ["https://example.com/img.jpg"],
            category: catSmartphones._id,
            isActive: true,
        },
    ]);

    const categories = await getCategories();
    assert.equal(categories.length, 3);

    const laptopsEntry = categories.find((c) => c.slug === "laptops");
    const phonesEntry = categories.find((c) => c.slug === "smartphones");
    const tabletsEntry = categories.find((c) => c.slug === "tablets");

    assert.ok(laptopsEntry);
    assert.equal(laptopsEntry.productCount, 2);

    assert.ok(phonesEntry);
    assert.equal(phonesEntry.productCount, 1);

    assert.ok(tabletsEntry);
    assert.equal(tabletsEntry.productCount, 0);
});

test("HTTP endpoints: GET /api/products?hasDiscount=true and GET /api/categories", async () => {
    const category = await Category.create({
        name: "Audio",
        slug: "audio",
        description: "Auriculares y sonido",
        isActive: true,
    });

    await Product.create([
        {
            name: "AirPods Max",
            slug: "airpods-max",
            description: "Premium headphones",
            price: 600,
            discountPrice: 499,
            stock: 10,
            images: ["https://example.com/audio1.jpg"],
            category: category._id,
            isActive: true,
        },
        {
            name: "Basic Earbuds",
            slug: "basic-earbuds",
            description: "Standard earbuds",
            price: 30,
            stock: 50,
            images: ["https://example.com/audio2.jpg"],
            category: category._id,
            isActive: true,
        },
    ]);

    const productsRes = await fetch(`${baseUrl}/api/products?hasDiscount=true`);
    assert.equal(productsRes.status, 200);
    const productsBody = await productsRes.json() as {
        success: boolean;
        data: { products: Array<{ name: string; discountPrice?: number }> };
    };
    assert.equal(productsBody.success, true);
    assert.equal(productsBody.data.products.length, 1);
    assert.equal(productsBody.data.products[0].name, "AirPods Max");
    assert.equal(productsBody.data.products[0].discountPrice, 499);

    const categoriesRes = await fetch(`${baseUrl}/api/categories`);
    assert.equal(categoriesRes.status, 200);
    const categoriesBody = await categoriesRes.json() as {
        success: boolean;
        data: { categories: Array<{ slug: string; productCount: number }> };
    };
    assert.equal(categoriesBody.success, true);
    assert.ok(categoriesBody.data.categories.length >= 1);
    const audioCat = categoriesBody.data.categories.find((c) => c.slug === "audio");
    assert.ok(audioCat);
    assert.equal(audioCat.productCount, 2);
});
