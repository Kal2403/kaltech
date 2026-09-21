import assert from "node:assert/strict";
import { once } from "node:events";
import type { Server } from "node:http";
import { after, before, beforeEach, test } from "node:test";
import mongoose, { Types } from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import jwt from "jsonwebtoken";

import app from "../app.js";
import { Category } from "../models/Category.model.js";
import { Product } from "../models/Product.model.js";
import { User } from "../models/User.model.js";
import { Wishlist } from "../models/Wishlist.model.js";
import {
    addToWishlist,
    clearWishlist,
    getUserWishlist,
    removeFromWishlist,
} from "./wishlist.service.js";

let database: MongoMemoryReplSet | undefined;
let server: Server | undefined;
let baseUrl: string;
let testUserId: Types.ObjectId;
let activeProductId: Types.ObjectId;
let secondProductId: Types.ObjectId;
const jwtSecret = "wishlist-test-secret-key-1234567890";
const originalSecret = process.env.JWT_SECRET;

before(async () => {
    process.env.JWT_SECRET = jwtSecret;

    database = await MongoMemoryReplSet.create({
        binary: { version: "8.2.6" },
        replSet: { count: 1, storageEngine: "wiredTiger", ip: "127.0.0.1" },
    });
    await mongoose.connect(database.getUri(), { dbName: "wishlist_tests" });
    await Promise.all([Category.init(), Product.init(), User.init(), Wishlist.init()]);

    server = app.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    baseUrl = `http://127.0.0.1:${address.port}`;
}, { timeout: 180_000 });

after(async () => {
    if (originalSecret === undefined) {
        delete process.env.JWT_SECRET;
    } else {
        process.env.JWT_SECRET = originalSecret;
    }

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
    await Wishlist.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({});

    const user = await User.create({
        name: "Test User",
        email: "test@kaltech.com",
        password: "Password123!",
        role: "customer",
    });
    testUserId = user._id as Types.ObjectId;

    const category = await Category.create({
        name: "Smartphones",
        slug: "smartphones",
        description: "Mobile phones",
        isActive: true,
    });

    const product1 = await Product.create({
        name: "iPhone 15 Pro",
        slug: "iphone-15-pro",
        description: "Titanium iPhone",
        price: 999,
        category: category._id,
        brand: "Apple",
        stock: 10,
        images: ["https://example.com/iphone.jpg"],
        isActive: true,
    });
    activeProductId = product1._id as Types.ObjectId;

    const product2 = await Product.create({
        name: "Galaxy S24",
        slug: "galaxy-s24",
        description: "AI Smartphone",
        price: 899,
        category: category._id,
        brand: "Samsung",
        stock: 5,
        images: ["https://example.com/s24.jpg"],
        isActive: true,
    });
    secondProductId = product2._id as Types.ObjectId;
});

const generateToken = (userId: string) =>
    jwt.sign({ userId, role: "customer" }, jwtSecret, { expiresIn: "1h" });

test("getUserWishlist returns empty products array for new user", async () => {
    const wishlist = await getUserWishlist(testUserId.toString());
    assert.ok(wishlist);
    assert.equal(wishlist.user.toString(), testUserId.toString());
    assert.equal(wishlist.products.length, 0);
});

test("addToWishlist adds a product and populates product details", async () => {
    const wishlist = await addToWishlist(
        testUserId.toString(),
        activeProductId.toString()
    );

    assert.ok(wishlist);
    assert.equal(wishlist.products.length, 1);
    const addedProduct = wishlist.products[0] as any;
    assert.equal(addedProduct.name, "iPhone 15 Pro");
    assert.equal(addedProduct.brand, "Apple");
});

test("addToWishlist prevents duplicate entries for the same product", async () => {
    await addToWishlist(testUserId.toString(), activeProductId.toString());
    const wishlist = await addToWishlist(
        testUserId.toString(),
        activeProductId.toString()
    );

    assert.equal(wishlist.products.length, 1);
});

test("addToWishlist rejects non-existent product with 404", async () => {
    const fakeId = new Types.ObjectId().toString();
    await assert.rejects(
        async () => {
            await addToWishlist(testUserId.toString(), fakeId);
        },
        {
            statusCode: 404,
            message: "Product not found",
        }
    );
});

test("removeFromWishlist removes product from wishlist", async () => {
    await addToWishlist(testUserId.toString(), activeProductId.toString());
    await addToWishlist(testUserId.toString(), secondProductId.toString());

    const wishlist = await removeFromWishlist(
        testUserId.toString(),
        activeProductId.toString()
    );

    assert.equal(wishlist.products.length, 1);
    const remaining = wishlist.products[0] as any;
    assert.equal(remaining._id.toString(), secondProductId.toString());
});

test("clearWishlist removes all products from wishlist", async () => {
    await addToWishlist(testUserId.toString(), activeProductId.toString());
    await addToWishlist(testUserId.toString(), secondProductId.toString());

    const cleared = await clearWishlist(testUserId.toString());
    assert.equal(cleared.products.length, 0);
});

test("HTTP endpoints: full wishlist lifecycle and auth protection", async () => {
    const token = generateToken(testUserId.toString());

    // 1. Unauthenticated GET /api/wishlist returns 401
    const unauthRes = await fetch(`${baseUrl}/api/wishlist`);
    assert.equal(unauthRes.status, 401);

    // 2. Authenticated GET /api/wishlist returns empty wishlist
    const getRes = await fetch(`${baseUrl}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(getRes.status, 200);
    const getBody = (await getRes.json()) as any;
    assert.equal(getBody.success, true);
    assert.equal(getBody.data.products.length, 0);

    // 3. POST /api/wishlist/:productId adds product
    const addRes = await fetch(
        `${baseUrl}/api/wishlist/${activeProductId.toString()}`,
        {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    assert.equal(addRes.status, 200);
    const addBody = (await addRes.json()) as any;
    assert.equal(addBody.success, true);
    assert.equal(addBody.message, "Product added to wishlist");
    assert.equal(addBody.data.products.length, 1);

    // 4. DELETE /api/wishlist/:productId removes product
    const removeRes = await fetch(
        `${baseUrl}/api/wishlist/${activeProductId.toString()}`,
        {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    assert.equal(removeRes.status, 200);
    const removeBody = (await removeRes.json()) as any;
    assert.equal(removeBody.success, true);
    assert.equal(removeBody.message, "Product removed from wishlist");
    assert.equal(removeBody.data.products.length, 0);

    // 5. DELETE /api/wishlist clears wishlist
    await addToWishlist(testUserId.toString(), secondProductId.toString());
    const clearRes = await fetch(`${baseUrl}/api/wishlist`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(clearRes.status, 200);
    const clearBody = (await clearRes.json()) as any;
    assert.equal(clearBody.success, true);
    assert.equal(clearBody.message, "Wishlist cleared");
    assert.equal(clearBody.data.products.length, 0);
});
