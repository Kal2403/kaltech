import assert from "node:assert/strict";
import { once } from "node:events";
import type { Server } from "node:http";
import { after, before, beforeEach, test } from "node:test";
import mongoose, { Types } from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import jwt from "jsonwebtoken";

import app from "../app.js";
import { Order } from "../models/Order.model.js";
import { Product } from "../models/Product.model.js";
import { User } from "../models/User.model.js";
import {
    detectCardBrand,
    isCardExpired,
    isValidCvv,
    isValidLuhn,
    payOrder,
    processCardPayment,
} from "./payment.service.js";

let database: MongoMemoryReplSet | undefined;
let server: Server | undefined;
let baseUrl: string;
let testUserId: Types.ObjectId;
let otherUserId: Types.ObjectId;
let adminUserId: Types.ObjectId;
let testOrderId: Types.ObjectId;
const jwtSecret = "payment-test-secret-key-1234567890";
const originalSecret = process.env.JWT_SECRET;

// Standard valid Luhn test cards:
// Visa: 4242424242424242 (16 digits)
// Mastercard: 5555555555554444 (16 digits)
// Amex: 378282246310005 (15 digits)
const validVisa = "4242424242424242";
const validMastercard = "5555555555554444";
const validAmex = "378282246310005";

before(async () => {
    process.env.JWT_SECRET = jwtSecret;

    database = await MongoMemoryReplSet.create({
        binary: { version: "8.2.6" },
        replSet: { count: 1, storageEngine: "wiredTiger", ip: "127.0.0.1" },
    });
    await mongoose.connect(database.getUri(), { dbName: "payment_tests" });
    await Promise.all([Order.init(), Product.init(), User.init()]);

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
    await Order.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});

    const user = await User.create({
        name: "Payment Test User",
        email: "payer@kaltech.com",
        password: "Password123!",
        role: "customer",
    });
    testUserId = user._id as Types.ObjectId;

    const otherUser = await User.create({
        name: "Other User",
        email: "other@kaltech.com",
        password: "Password123!",
        role: "customer",
    });
    otherUserId = otherUser._id as Types.ObjectId;

    const adminUser = await User.create({
        name: "Admin User",
        email: "admin@kaltech.com",
        password: "Password123!",
        role: "admin",
    });
    adminUserId = adminUser._id as Types.ObjectId;

    const product = await Product.create({
        name: "Test Laptop",
        slug: "test-laptop-payment",
        description: "Laptop for payment testing",
        category: new Types.ObjectId(),
        price: 999.99,
        stock: 10,
        images: ["https://example.com/laptop.png"],
    });

    const order = await Order.create({
        user: testUserId,
        items: [
            {
                product: product._id,
                name: product.name,
                quantity: 1,
                price: 999.99,
                image: product.images[0],
            },
        ],
        shippingAddress: {
            fullName: "Payment Test User",
            address: "Main Street 123",
            city: "Madrid",
            postalCode: "28001",
            country: "Spain",
            phone: "+34600112233",
        },
        paymentMethod: "card",
        paymentStatus: "pending",
        orderStatus: "pending",
        subtotal: 999.99,
        tax: 179.99,
        shippingCost: 0,
        total: 1179.98,
    });
    testOrderId = order._id as Types.ObjectId;
});

const generateToken = (id: Types.ObjectId, role = "customer") => {
    return jwt.sign({ userId: id.toString(), role }, jwtSecret, { expiresIn: "1h" });
};

test("isValidLuhn and detectCardBrand validate cards accurately", () => {
    assert.equal(isValidLuhn(validVisa), true);
    assert.equal(isValidLuhn(validMastercard), true);
    assert.equal(isValidLuhn(validAmex), true);

    // Invalid checksum: change last digit of visa
    assert.equal(isValidLuhn("4532000000000001"), false);
    // Invalid length:
    assert.equal(isValidLuhn("1234"), false);

    assert.equal(detectCardBrand(validVisa), "visa");
    assert.equal(detectCardBrand(validMastercard), "mastercard");
    assert.equal(detectCardBrand(validAmex), "amex");
    assert.equal(detectCardBrand("6011000000000000"), "discover");
});

test("isCardExpired and isValidCvv check expiration and security code", () => {
    const nextYear = new Date().getFullYear() + 2;
    const pastYear = new Date().getFullYear() - 1;

    assert.equal(isCardExpired(12, nextYear), false);
    assert.equal(isCardExpired("12", nextYear), false);
    assert.equal(isCardExpired(1, pastYear), true);
    assert.equal(isCardExpired(13, nextYear), true); // Invalid month

    assert.equal(isValidCvv("123"), true);
    assert.equal(isValidCvv("1234"), true);
    assert.equal(isValidCvv("12"), false);
    assert.equal(isValidCvv("12345"), false);
    assert.equal(isValidCvv("abc"), false);
});

test("processCardPayment validates card and generates receipt ID", async () => {
    const nextYear = new Date().getFullYear() + 2;
    const result = await processCardPayment(
        {
            cardHolder: "Jane Doe",
            cardNumber: validVisa,
            expiryMonth: "10",
            expiryYear: nextYear.toString(),
            cvv: "123",
            email: "jane@example.com",
        },
        100
    );

    assert.ok(result.id.startsWith("PAY-CARD-"));
    assert.equal(result.status, "COMPLETED");
    assert.equal(result.email_address, "jane@example.com");
    assert.equal(result.method, "card_visa_4242");

    // Rejects expired card:
    await assert.rejects(
        async () => {
            await processCardPayment(
                {
                    cardHolder: "Jane Doe",
                    cardNumber: validVisa,
                    expiryMonth: "01",
                    expiryYear: "2020",
                    cvv: "123",
                },
                100
            );
        },
        { message: "Card is expired or expiration date is invalid" }
    );
});

test("payOrder transitions order to paid and processing status", async () => {
    const nextYear = new Date().getFullYear() + 2;
    const updated = await payOrder(testUserId.toString(), testOrderId.toString(), {
        method: "card",
        card: {
            cardHolder: "Payment Test User",
            cardNumber: validMastercard,
            expiryMonth: "11",
            expiryYear: nextYear.toString(),
            cvv: "456",
        },
    });

    assert.equal(updated.paymentStatus, "paid");
    assert.equal(updated.orderStatus, "processing");
    assert.ok(updated.paidAt instanceof Date);
    assert.ok(updated.paymentResult?.id.startsWith("PAY-CARD-"));
    assert.equal(updated.paymentResult?.method, "card_mastercard_4444");

    // Double payment is rejected:
    await assert.rejects(
        async () => {
            await payOrder(testUserId.toString(), testOrderId.toString(), {
                method: "cash",
            });
        },
        { message: "Order is already paid" }
    );
});

test("payOrder rejects unauthorized user and cancelled orders", async () => {
    const nextYear = new Date().getFullYear() + 2;
    const validCardInput = {
        method: "card" as const,
        card: {
            cardHolder: "Other User",
            cardNumber: validVisa,
            expiryMonth: "08",
            expiryYear: nextYear.toString(),
            cvv: "999",
        },
    };

    // Other user cannot pay for testUserId's order:
    await assert.rejects(
        async () => {
            await payOrder(otherUserId.toString(), testOrderId.toString(), validCardInput);
        },
        { message: "Access denied" }
    );

    // Cancel the order:
    await Order.findByIdAndUpdate(testOrderId, { orderStatus: "cancelled" });

    // Payment on cancelled order is rejected:
    await assert.rejects(
        async () => {
            await payOrder(testUserId.toString(), testOrderId.toString(), validCardInput);
        },
        { message: "Cannot pay for a cancelled order" }
    );
});

test("HTTP endpoints: POST /api/orders/:id/pay and /api/payments/*", async () => {
    const nextYear = new Date().getFullYear() + 2;
    const token = generateToken(testUserId);

    // 1. GET /api/payments/config (public)
    const configRes = await fetch(`${baseUrl}/api/payments/config`);
    assert.equal(configRes.status, 200);
    const configJson = await configRes.json() as { success: boolean; data: { supportedMethods: string[] } };
    assert.equal(configJson.success, true);
    assert.ok(configJson.data.supportedMethods.includes("card"));

    // 2. POST /api/orders/:id/pay without token -> 401
    const unauthRes = await fetch(`${baseUrl}/api/orders/${testOrderId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: "cash" }),
    });
    assert.equal(unauthRes.status, 401);

    // 3. POST /api/orders/:id/pay with token -> 200
    const payRes = await fetch(`${baseUrl}/api/orders/${testOrderId}/pay`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            method: "card",
            card: {
                cardHolder: "Payment Test User",
                cardNumber: validVisa,
                expiryMonth: "09",
                expiryYear: nextYear.toString(),
                cvv: "789",
            },
        }),
    });
    assert.equal(payRes.status, 200);
    const payJson = await payRes.json() as {
        success: boolean;
        data: { order: { paymentStatus: string; orderStatus: string; paymentResult: { id: string } } };
    };
    assert.equal(payJson.success, true);
    assert.equal(payJson.data.order.paymentStatus, "paid");
    assert.equal(payJson.data.order.orderStatus, "processing");
    assert.ok(payJson.data.order.paymentResult.id.startsWith("PAY-CARD-"));

    // 4. POST /api/payments/process direct gateway simulation -> 200
    const directRes = await fetch(`${baseUrl}/api/payments/process`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            method: "card",
            amount: 49.99,
            card: {
                cardHolder: "Direct Buyer",
                cardNumber: validAmex,
                expiryMonth: "12",
                expiryYear: nextYear.toString(),
                cvv: "1234",
            },
        }),
    });
    assert.equal(directRes.status, 200);
    const directJson = await directRes.json() as {
        success: boolean;
        data: { paymentResult: { id: string; status: string; method: string } };
    };
    assert.equal(directJson.success, true);
    assert.equal(directJson.data.paymentResult.status, "COMPLETED");
    assert.equal(directJson.data.paymentResult.method, "card_amex_0005");
});
