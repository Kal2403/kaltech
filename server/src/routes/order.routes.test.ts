import assert from "node:assert/strict";
import { once } from "node:events";
import type { Server } from "node:http";
import { after, before, test } from "node:test";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import app from "../app.js";
import { User } from "../models/User.model.js";

let server: Server;
let baseUrl: string;
const originalSecret = process.env.JWT_SECRET;
const userId = "507f1f77bcf86cd799439011";
const orderId = "507f1f77bcf86cd799439012";

before(async () => {
    process.env.JWT_SECRET = "isolated-order-route-test-secret";
    server = app.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Missing test server port");
    baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
    if (originalSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalSecret;
    await new Promise<void>((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
    });
});

const changeStatus = (orderStatus: unknown, token?: string) => fetch(
    `${baseUrl}/api/orders/admin/${orderId}/status`,
    {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ orderStatus }),
    }
);

test("cancellation rejects unauthenticated requests before opening a transaction", async (t) => {
    const transaction = t.mock.method(mongoose.connection, "transaction", async () => {
        assert.fail("Unauthorized request must not reach order writes");
    });
    const response = await changeStatus("cancelled");
    assert.equal(response.status, 401);
    assert.equal(transaction.mock.callCount(), 0);
});

test("a customer cannot cancel through the administrator endpoint", async (t) => {
    t.mock.method(User, "findById", async () => ({ id: userId, role: "customer", isActive: true }));
    const transaction = t.mock.method(mongoose.connection, "transaction", async () => {
        assert.fail("Customer must not reach order writes");
    });
    // Even a token claiming admin cannot override the current database role.
    const token = jwt.sign({ userId, role: "admin" }, process.env.JWT_SECRET!);
    const response = await changeStatus("cancelled", token);
    assert.equal(response.status, 403);
    assert.equal(transaction.mock.callCount(), 0);
});

test("administrator input still uses the existing error contract", async (t) => {
    t.mock.method(User, "findById", async () => ({ id: userId, role: "admin", isActive: true }));
    const transaction = t.mock.method(mongoose.connection, "transaction", async () => {
        assert.fail("Invalid status must be rejected before opening a transaction");
    });
    const token = jwt.sign({ userId, role: "admin" }, process.env.JWT_SECRET!);
    const response = await changeStatus("unsupported", token);
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), {
        success: false,
        message: "Invalid order status. Allowed values: pending, processing, shipped, delivered, cancelled",
    });
    assert.equal(transaction.mock.callCount(), 0);
});
