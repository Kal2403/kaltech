import assert from "node:assert/strict";
import { once } from "node:events";
import type { Server } from "node:http";
import { after, before, test } from "node:test";
import jwt from "jsonwebtoken";

import app from "../app.js";
import { Cart } from "../models/Cart.model.js";
import { User } from "../models/User.model.js";

let server: Server;
let baseUrl: string;
const originalSecret = process.env.JWT_SECRET;
const userId = "507f1f77bcf86cd799439011";
const validProductId = "507f1f77bcf86cd799439012";

before(async () => {
    process.env.JWT_SECRET = "isolated-cart-route-test-secret";
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
        server.close((error) => (error ? reject(error) : resolve()));
    });
});

const generateTestToken = () =>
    jwt.sign({ userId, role: "customer" }, "isolated-cart-route-test-secret");

test("DELETE /api/cart returns success: true and clears the cart", async (t) => {
    t.mock.method(User, "findById", async () => ({
        id: userId,
        role: "customer",
        isActive: true,
    }));

    t.mock.method(Cart, "findOne", async () => ({
        items: [{ product: validProductId, quantity: 2 }],
        save: async () => {},
    }));

    const token = generateTestToken();
    const response = await fetch(`${baseUrl}/api/cart`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    assert.equal(response.status, 200);
    const body = (await response.json()) as { success: boolean; message: string };
    assert.equal(body.success, true);
    assert.equal(body.message, "Cart cleared successfully");
});

test("POST /api/cart/items rejects non-positive and invalid quantities with 400", async (t) => {
    t.mock.method(User, "findById", async () => ({
        id: userId,
        role: "customer",
        isActive: true,
    }));

    const token = generateTestToken();

    for (const invalidQuantity of [0, -1, -10, 1.5, "five"]) {
        const response = await fetch(`${baseUrl}/api/cart/items`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                productId: validProductId,
                quantity: invalidQuantity,
            }),
        });

        assert.equal(response.status, 400);
        const body = (await response.json()) as { success: boolean; message: string };
        assert.equal(body.success, false);
    }
});

test("POST /api/cart/items rejects malformed productId with 400", async (t) => {
    t.mock.method(User, "findById", async () => ({
        id: userId,
        role: "customer",
        isActive: true,
    }));

    const token = generateTestToken();
    const response = await fetch(`${baseUrl}/api/cart/items`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            productId: "invalid-id",
            quantity: 1,
        }),
    });

    assert.equal(response.status, 400);
    const body = (await response.json()) as { success: boolean; message: string };
    assert.equal(body.success, false);
    assert.match(body.message, /product ID/i);
});

test("PATCH /api/cart/items/:productId rejects malformed productId with 400", async (t) => {
    t.mock.method(User, "findById", async () => ({
        id: userId,
        role: "customer",
        isActive: true,
    }));

    const token = generateTestToken();
    const response = await fetch(`${baseUrl}/api/cart/items/invalid-id`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            quantity: 2,
        }),
    });

    assert.equal(response.status, 400);
    const body = (await response.json()) as { success: boolean; message: string };
    assert.equal(body.success, false);
    assert.match(body.message, /product ID/i);
});

test("DELETE /api/cart/items/:productId rejects malformed productId with 400", async (t) => {
    t.mock.method(User, "findById", async () => ({
        id: userId,
        role: "customer",
        isActive: true,
    }));

    const token = generateTestToken();
    const response = await fetch(`${baseUrl}/api/cart/items/invalid-id`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    assert.equal(response.status, 400);
    const body = (await response.json()) as { success: boolean; message: string };
    assert.equal(body.success, false);
    assert.match(body.message, /product ID/i);
});
