import assert from "node:assert/strict";
import { once } from "node:events";
import type { Server } from "node:http";
import { after, before, beforeEach, test } from "node:test";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";

import app from "../app.js";
import { Cart } from "../models/Cart.model.js";
import { Coupon } from "../models/Coupon.model.js";
import { Order } from "../models/Order.model.js";
import { Product } from "../models/Product.model.js";
import { User } from "../models/User.model.js";
import {
    createCoupon,
    deleteCoupon,
    getAdminCoupons,
    getCouponById,
    updateCoupon,
    validateCoupon,
} from "./coupon.service.js";
import { createOrder } from "./order.service.js";
import { ApiError } from "../utils/ApiError.js";

let database: MongoMemoryReplSet | undefined;
let server: Server | undefined;
let baseUrl: string;
const jwtSecret = "coupon-service-test-secret";

before(async () => {
    process.env.JWT_SECRET = jwtSecret;
    database = await MongoMemoryReplSet.create({
        binary: { version: "8.2.6" },
        replSet: { count: 1, storageEngine: "wiredTiger", ip: "127.0.0.1" },
    });
    await mongoose.connect(database.getUri(), { dbName: "coupon_service_tests" });
    await Promise.all([
        Cart.init(),
        Coupon.init(),
        Order.init(),
        Product.init(),
        User.init(),
    ]);

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
    await Cart.deleteMany({});
    await Coupon.deleteMany({});
    await Order.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});
});

const generateToken = (id: string, role: "customer" | "admin" = "customer") =>
    jwt.sign({ userId: id, role }, jwtSecret, { expiresIn: "1h" });

test("validateCoupon: calculates correct percentage discount and new subtotal", async () => {
    await Coupon.create({
        code: "SAVE10",
        discountPercent: 10,
        isActive: true,
    });

    const result = await validateCoupon("SAVE10", 200);

    assert.equal(result.valid, true);
    assert.equal(result.coupon.code, "SAVE10");
    assert.equal(result.coupon.discountPercent, 10);
    assert.equal(result.discountAmount, 20);
    assert.equal(result.newSubtotal, 180);
});

test("validateCoupon: caps discount when maxDiscountAmount is set", async () => {
    await Coupon.create({
        code: "MAXCAP",
        discountPercent: 50,
        maxDiscountAmount: 30,
        isActive: true,
    });

    const result = await validateCoupon("maxcap", 200);

    assert.equal(result.discountAmount, 30);
    assert.equal(result.newSubtotal, 170);
});

test("validateCoupon: throws 404 when coupon code does not exist", async () => {
    await assert.rejects(
        async () => validateCoupon("NOTEXIST", 100),
        (err: unknown) => {
            assert.ok(err instanceof ApiError);
            assert.equal(err.statusCode, 404);
            assert.match(err.message, /Coupon not found/i);
            return true;
        }
    );
});

test("validateCoupon: throws 400 when coupon is inactive", async () => {
    await Coupon.create({
        code: "DISABLED",
        discountPercent: 15,
        isActive: false,
    });

    await assert.rejects(
        async () => validateCoupon("DISABLED", 100),
        (err: unknown) => {
            assert.ok(err instanceof ApiError);
            assert.equal(err.statusCode, 400);
            assert.match(err.message, /Coupon is inactive/i);
            return true;
        }
    );
});

test("validateCoupon: throws 400 when coupon is not yet active", async () => {
    const futureDate = new Date(Date.now() + 86400000);
    await Coupon.create({
        code: "FUTURE",
        discountPercent: 10,
        validFrom: futureDate,
        isActive: true,
    });

    await assert.rejects(
        async () => validateCoupon("FUTURE", 100),
        (err: unknown) => {
            assert.ok(err instanceof ApiError);
            assert.equal(err.statusCode, 400);
            assert.match(err.message, /not yet active/i);
            return true;
        }
    );
});

test("validateCoupon: throws 400 when coupon has expired", async () => {
    const pastDate = new Date(Date.now() - 86400000);
    await Coupon.create({
        code: "EXPIRED",
        discountPercent: 10,
        validUntil: pastDate,
        isActive: true,
    });

    await assert.rejects(
        async () => validateCoupon("EXPIRED", 100),
        (err: unknown) => {
            assert.ok(err instanceof ApiError);
            assert.equal(err.statusCode, 400);
            assert.match(err.message, /expired/i);
            return true;
        }
    );
});

test("validateCoupon: throws 400 when maxUses limit has been reached", async () => {
    await Coupon.create({
        code: "LIMITED",
        discountPercent: 10,
        maxUses: 2,
        usedCount: 2,
        isActive: true,
    });

    await assert.rejects(
        async () => validateCoupon("LIMITED", 100),
        (err: unknown) => {
            assert.ok(err instanceof ApiError);
            assert.equal(err.statusCode, 400);
            assert.match(err.message, /limit reached/i);
            return true;
        }
    );
});

test("validateCoupon: throws 400 when subtotal is below minOrderAmount", async () => {
    await Coupon.create({
        code: "MIN100",
        discountPercent: 20,
        minOrderAmount: 100,
        isActive: true,
    });

    await assert.rejects(
        async () => validateCoupon("MIN100", 50),
        (err: unknown) => {
            assert.ok(err instanceof ApiError);
            assert.equal(err.statusCode, 400);
            assert.match(err.message, /Minimum order amount of \$100/i);
            return true;
        }
    );
});

test("Admin CRUD: creates, lists, reads, updates and deactivates coupons", async () => {
    // 1. Create
    const created = await createCoupon({
        code: "PROMO20",
        discountPercent: 20,
        description: "Special promotion 20%",
        minOrderAmount: 50,
        maxDiscountAmount: 40,
        maxUses: 100,
    });

    assert.equal(created.code, "PROMO20");
    assert.equal(created.discountPercent, 20);
    assert.equal(created.isActive, true);

    // Duplicate rejection
    await assert.rejects(
        async () => createCoupon({ code: "promo20", discountPercent: 10 }),
        (err: unknown) => {
            assert.ok(err instanceof ApiError);
            assert.equal(err.statusCode, 409);
            return true;
        }
    );

    // Invalid discountPercent rejection
    await assert.rejects(
        async () => createCoupon({ code: "INVALID", discountPercent: 150 }),
        (err: unknown) => {
            assert.ok(err instanceof ApiError);
            assert.equal(err.statusCode, 400);
            return true;
        }
    );

    // 2. List
    const all = await getAdminCoupons();
    assert.equal(all.length, 1);
    assert.equal(all[0].code, "PROMO20");

    // 3. Read by ID
    const found = await getCouponById(created._id.toString());
    assert.equal(found.code, "PROMO20");

    // 4. Update
    const updated = await updateCoupon(created._id.toString(), {
        discountPercent: 25,
        description: "Updated 25%",
        maxUses: 200,
    });
    assert.equal(updated.discountPercent, 25);
    assert.equal(updated.description, "Updated 25%");
    assert.equal(updated.maxUses, 200);

    // 5. Delete (soft-deactivate)
    const deactivated = await deleteCoupon(created._id.toString());
    assert.equal(deactivated.isActive, false);

    const reloaded = await Coupon.findById(created._id);
    assert.equal(reloaded?.isActive, false);
});

test("Checkout integration: applies coupon discount, records summary and increments usedCount", async () => {
    const user = await User.create({
        name: "Coupon Shopper",
        email: "shopper@test.com",
        password: "Password123!",
        role: "customer",
    });

    const product = await Product.create({
        name: "Test Laptop",
        slug: "test-laptop",
        description: "High end laptop",
        category: new mongoose.Types.ObjectId(),
        stock: 5,
        price: 500,
        images: ["https://example.com/laptop.png"],
        isActive: true,
    });

    await Cart.create({
        user: user._id,
        items: [{ product: product._id, quantity: 1 }],
    });

    const coupon = await Coupon.create({
        code: "WELCOME10",
        discountPercent: 10,
        maxUses: 5,
        usedCount: 0,
        isActive: true,
    });

    const orderInput = {
        shippingAddress: {
            fullName: "Shopper Doe",
            address: "123 Tech Blvd",
            city: "Lima",
            postalCode: "15001",
            country: "Peru",
            phone: "999888777",
        },
        paymentMethod: "cash",
        couponCode: "welcome10",
    };

    const order = await createOrder(user._id.toString(), orderInput);

    // Subtotal: 500
    // Discount: 500 * 10% = 50
    // Tax: 500 * 0.18 = 90
    // Shipping: subtotal <= 1000 -> 25
    // Total: 500 - 50 + 90 + 25 = 565
    assert.equal(order.subtotal, 500);
    assert.equal(order.discountAmount, 50);
    assert.equal(order.tax, 90);
    assert.equal(order.shippingCost, 25);
    assert.equal(order.total, 565);
    assert.equal(order.coupon?.code, "WELCOME10");
    assert.equal(order.coupon?.discountPercent, 10);
    assert.equal(order.coupon?.discountAmount, 50);

    // Check Coupon usedCount incremented
    const updatedCoupon = await Coupon.findById(coupon._id);
    assert.equal(updatedCoupon?.usedCount, 1);
});

test("Checkout integration: fails and rolls back when coupon usage limit is exceeded", async () => {
    const user = await User.create({
        name: "Shopper Exceeded",
        email: "exceeded@test.com",
        password: "Password123!",
        role: "customer",
    });

    const product = await Product.create({
        name: "Test Phone",
        slug: "test-phone",
        description: "Smartphone",
        category: new mongoose.Types.ObjectId(),
        stock: 5,
        price: 200,
        images: ["https://example.com/phone.png"],
        isActive: true,
    });

    await Cart.create({
        user: user._id,
        items: [{ product: product._id, quantity: 1 }],
    });

    await Coupon.create({
        code: "ONETIME",
        discountPercent: 15,
        maxUses: 1,
        usedCount: 1,
        isActive: true,
    });

    const orderInput = {
        shippingAddress: {
            fullName: "Shopper Doe",
            address: "123 Tech Blvd",
            city: "Lima",
            postalCode: "15001",
            country: "Peru",
            phone: "999888777",
        },
        paymentMethod: "cash",
        couponCode: "ONETIME",
    };

    await assert.rejects(
        async () => createOrder(user._id.toString(), orderInput),
        (err: unknown) => {
            assert.ok(err instanceof ApiError);
            assert.equal(err.statusCode, 400);
            assert.match(err.message, /usage limit reached/i);
            return true;
        }
    );

    // Ensure cart was not cleared
    const cart = await Cart.findOne({ user: user._id });
    assert.equal(cart?.items.length, 1);
});

test("HTTP endpoints: full coupon lifecycle and auth protection", async () => {
    const adminUser = await User.create({
        name: "Admin User",
        email: "admin@kaltech.com",
        password: "Password123!",
        role: "admin",
    });
    const adminToken = generateToken(adminUser._id.toString(), "admin");

    const customerUser = await User.create({
        name: "Normal User",
        email: "customer@kaltech.com",
        password: "Password123!",
        role: "customer",
    });
    const customerToken = generateToken(customerUser._id.toString(), "customer");

    // 1. POST /api/coupons - Unauthorized without token (401)
    const unauthorizedCreate = await fetch(`${baseUrl}/api/coupons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: "FAIL", discountPercent: 10 }),
    });
    assert.equal(unauthorizedCreate.status, 401);

    // 2. POST /api/coupons - Forbidden for customer (403)
    const forbiddenCreate = await fetch(`${baseUrl}/api/coupons`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({ code: "FAIL", discountPercent: 10 }),
    });
    assert.equal(forbiddenCreate.status, 403);

    // 3. POST /api/coupons - Successful as admin (201)
    const adminCreate = await fetch(`${baseUrl}/api/coupons`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
            code: "CYBER25",
            discountPercent: 25,
            description: "Cyber Monday 25%",
            minOrderAmount: 100,
        }),
    });
    assert.equal(adminCreate.status, 201);
    const createData = (await adminCreate.json()) as {
        success: boolean;
        data: { coupon: { _id: string; code: string } };
    };
    assert.equal(createData.success, true);
    assert.equal(createData.data.coupon.code, "CYBER25");
    const couponId = createData.data.coupon._id;

    // 4. POST /api/coupons/validate - Public / customer validation (200)
    const validateRes = await fetch(`${baseUrl}/api/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: "cyber25", subtotal: 200 }),
    });
    assert.equal(validateRes.status, 200);
    const validateData = (await validateRes.json()) as {
        success: boolean;
        data: { discountAmount: number; newSubtotal: number };
    };
    assert.equal(validateData.success, true);
    assert.equal(validateData.data.discountAmount, 50);
    assert.equal(validateData.data.newSubtotal, 150);

    // 5. GET /api/coupons/admin - List as admin (200)
    const listRes = await fetch(`${baseUrl}/api/coupons/admin`, {
        headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(listRes.status, 200);
    const listData = (await listRes.json()) as {
        success: boolean;
        data: { coupons: unknown[] };
    };
    assert.equal(listData.data.coupons.length, 1);

    // 6. GET /api/coupons/:id - Get by ID as admin (200)
    const getRes = await fetch(`${baseUrl}/api/coupons/${couponId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(getRes.status, 200);

    // 7. PATCH /api/coupons/:id - Update as admin (200)
    const updateRes = await fetch(`${baseUrl}/api/coupons/${couponId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ discountPercent: 30 }),
    });
    assert.equal(updateRes.status, 200);
    const updateData = (await updateRes.json()) as {
        data: { coupon: { discountPercent: number } };
    };
    assert.equal(updateData.data.coupon.discountPercent, 30);

    // 8. DELETE /api/coupons/:id - Deactivate as admin (200)
    const deleteRes = await fetch(`${baseUrl}/api/coupons/${couponId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(deleteRes.status, 200);
    const deleteData = (await deleteRes.json()) as {
        data: { coupon: { isActive: boolean } };
    };
    assert.equal(deleteData.data.coupon.isActive, false);
});
