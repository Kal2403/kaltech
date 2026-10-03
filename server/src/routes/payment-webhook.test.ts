import assert from "node:assert/strict";
import type { Server } from "node:http";
import { after, before, test } from "node:test";
import jwt from "jsonwebtoken";
import mongoose, { Types } from "mongoose";

import app from "../app.js";
import { Order } from "../models/Order.model.js";
import { User } from "../models/User.model.js";

let server: Server;
let baseUrl: string;
const testUserId = new Types.ObjectId().toString();
const jwtSecret = "webhook-test-secret-12345";
const originalJwtSecret = process.env.JWT_SECRET;
const originalFindById = Order.findById;
const originalFindOneAndUpdate = Order.findOneAndUpdate;
const originalUserFindById = User.findById;

const createMockOrder = (overrides = {}) => ({
    _id: "507f1f77bcf86cd799439011",
    user: testUserId,
    total: 150.0,
    paymentStatus: "pending",
    orderStatus: "pending",
    paymentMethod: "card",
    timeline: [],
    async save() {
        return this;
    },
    ...overrides,
});

before(async () => {
    process.env.JWT_SECRET = jwtSecret;
    User.findById = ((_id: unknown) => {
        const userDoc = {
            id: testUserId,
            _id: testUserId,
            name: "Webhook Test User",
            email: "webhook@kaltech.com",
            role: "customer",
            isActive: true,
            select: () => userDoc,
        };
        return Object.assign(Promise.resolve(userDoc), userDoc);
    }) as unknown as typeof User.findById;

    server = app.listen(0);
    await new Promise<void>((resolve) => server.once("listening", resolve));
    const address = server.address();
    if (!address || typeof address === "string") {
        throw new Error("Test server did not bind to a TCP port");
    }
    baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
    Order.findById = originalFindById;
    Order.findOneAndUpdate = originalFindOneAndUpdate;
    User.findById = originalUserFindById;

    if (originalJwtSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalJwtSecret;

    await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve()))
    );
});

const postJson = (path: string, body: unknown, headers: Record<string, string> = {}) =>
    fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(body),
    });

test("GET /api/payments/config returns supported methods and environment mode", async () => {
    const res = await fetch(`${baseUrl}/api/payments/config`);
    const json = (await res.json()) as {
        success: boolean;
        data: { supportedMethods: string[]; currency: string; mode: string };
    };

    assert.equal(res.status, 200);
    assert.equal(json.success, true);
    assert.ok(json.data.supportedMethods.includes("card"));
    assert.ok(json.data.supportedMethods.includes("paypal"));
    assert.ok(json.data.supportedMethods.includes("cash"));
    assert.ok(["sandbox", "production"].includes(json.data.mode));
});

test("Stripe webhook ignores irrelevant events gracefully", async () => {
    const res = await postJson("/api/payments/webhook/stripe", {
        type: "customer.created",
        data: { object: {} },
    });
    const json = (await res.json()) as {
        success: boolean;
        data: { status: string };
    };

    assert.equal(res.status, 200);
    assert.equal(json.success, true);
    assert.equal(json.data.status, "ignored");
});

test("Stripe webhook updates order to paid and processing", async () => {
    const orderId = "507f1f77bcf86cd799439011";
    let saved = false;
    const mock = createMockOrder({
        _id: orderId,
        async save() {
            saved = true;
            return this;
        },
    });

    Order.findById = (async (id: unknown) => {
        if (String(id) === orderId) return mock;
        return null;
    }) as typeof Order.findById;

    const res = await postJson("/api/payments/webhook/stripe", {
        type: "checkout.session.completed",
        data: {
            object: {
                id: "cs_test_123456789",
                metadata: { orderId },
            },
        },
    });
    const json = (await res.json()) as {
        success: boolean;
        data: { status: string; orderId: string };
    };

    assert.equal(res.status, 200);
    assert.equal(json.success, true);
    assert.equal(json.data.status, "processed");
    assert.equal(json.data.orderId, orderId);
    assert.equal(saved, true);
    assert.equal(mock.paymentStatus, "paid");
    assert.equal(mock.orderStatus, "processing");
    assert.equal(mock.paymentResult?.id, "cs_test_123456789");
});

test("Stripe webhook is idempotent when order is already paid", async () => {
    const orderId = "507f1f77bcf86cd799439011";
    const paidMock = createMockOrder({
        _id: orderId,
        paymentStatus: "paid",
        orderStatus: "processing",
        paymentResult: { id: "cs_test_123456789", status: "COMPLETED" },
    });

    Order.findById = (async () => paidMock) as typeof Order.findById;

    const res = await postJson("/api/payments/webhook/stripe", {
        type: "checkout.session.completed",
        data: {
            object: {
                id: "cs_test_123456789",
                metadata: { orderId },
            },
        },
    });
    const json = (await res.json()) as {
        success: boolean;
        data: { status: string };
    };

    assert.equal(res.status, 200);
    assert.equal(json.success, true);
    assert.equal(json.data.status, "duplicate");
});

test("PayPal webhook processes PAYMENT.CAPTURE.COMPLETED successfully", async () => {
    const orderId = "507f1f77bcf86cd799439011";
    let saved = false;
    const mock = createMockOrder({
        _id: orderId,
        async save() {
            saved = true;
            return this;
        },
    });

    Order.findById = (async (id: unknown) => {
        if (String(id) === orderId) return mock;
        return null;
    }) as typeof Order.findById;

    const res = await postJson("/api/payments/webhook/paypal", {
        event_type: "PAYMENT.CAPTURE.COMPLETED",
        resource: {
            id: "CAPTURE-PAYPAL-987",
            custom_id: orderId,
        },
    });
    const json = (await res.json()) as {
        success: boolean;
        data: { status: string; orderId: string };
    };

    assert.equal(res.status, 200);
    assert.equal(json.success, true);
    assert.equal(json.data.status, "processed");
    assert.equal(saved, true);
    assert.equal(mock.paymentMethod, "paypal");
    assert.equal(mock.paymentStatus, "paid");
    assert.equal(mock.paymentResult?.id, "CAPTURE-PAYPAL-987");
});

test("payOrder with idempotencyKey returns existing paid order on duplicate request", async () => {
    const orderId = "507f1f77bcf86cd799439011";
    const idempotencyKey = "IDEMP-KEY-ABC-123";
    const token = jwt.sign({ userId: testUserId, role: "customer" }, jwtSecret);

    const paidOrder = createMockOrder({
        _id: orderId,
        paymentStatus: "paid",
        orderStatus: "processing",
        paymentResult: { id: idempotencyKey, status: "COMPLETED" },
    });

    Order.findById = (async () => paidOrder) as typeof Order.findById;

    const res = await postJson(
        `/api/orders/${orderId}/pay`,
        {
            method: "card",
            idempotencyKey,
            card: {
                cardHolder: "Jane Doe",
                cardNumber: "4242424242424242",
                expiryMonth: "12",
                expiryYear: "2030",
                cvv: "123",
            },
        },
        { Authorization: `Bearer ${token}` }
    );
    const json = (await res.json()) as {
        success: boolean;
        data: { order: { paymentStatus: string; paymentResult: { id: string } } };
    };

    assert.equal(res.status, 200);
    assert.equal(json.success, true);
    assert.equal(json.data.order.paymentStatus, "paid");
    assert.equal(json.data.order.paymentResult.id, idempotencyKey);
});
