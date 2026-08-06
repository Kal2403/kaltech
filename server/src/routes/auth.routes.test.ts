import assert from "node:assert/strict";
import type { Server } from "node:http";
import { after, before, test } from "node:test";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import app from "../app.js";
import { User } from "../models/User.model.js";

const userId = "507f1f77bcf86cd799439011";
const originalFindOne = User.findOne;
const originalFindById = User.findById;
const originalCreate = User.create;
const originalJwtSecret = process.env.JWT_SECRET;
const originalJwtExpiresIn = process.env.JWT_EXPIRES_IN;
let server: Server;
let baseUrl: string;

const publicUser = {
    id: userId,
    name: "Test User",
    email: "test@example.com",
    role: "customer" as const,
    isActive: true,
};

before(async () => {
    process.env.JWT_SECRET = "auth-route-test-secret";
    process.env.JWT_EXPIRES_IN = "7d";
    server = app.listen(0);
    await new Promise<void>((resolve) => server.once("listening", resolve));
    const address = server.address();
    if (!address || typeof address === "string") {
        throw new Error("Test server did not bind to a TCP port");
    }
    baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
    User.findOne = originalFindOne;
    User.findById = originalFindById;
    User.create = originalCreate;

    if (originalJwtSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalJwtSecret;

    if (originalJwtExpiresIn === undefined) delete process.env.JWT_EXPIRES_IN;
    else process.env.JWT_EXPIRES_IN = originalJwtExpiresIn;

    await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve()))
    );
});

const postJson = (path: string, body: unknown) =>
    fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

test("register validates required input", async () => {
    const response = await postJson("/api/auth/register", {});
    const body = (await response.json()) as { success: boolean; message: string };

    assert.equal(response.status, 400);
    assert.equal(body.success, false);
    assert.equal(body.message, "Name must be between 2 and 80 characters");
});

test("register rejects invalid email and short password", async () => {
    const invalidEmail = await postJson("/api/auth/register", {
        name: "Test User",
        email: "not-an-email",
        password: "password123",
    });
    assert.equal(invalidEmail.status, 400);

    const shortPassword = await postJson("/api/auth/register", {
        name: "Test User",
        email: "test@example.com",
        password: "short",
    });
    assert.equal(shortPassword.status, 400);
});

test("register normalizes identity and never returns the password hash", async () => {
    let lookupEmail: string | undefined;
    let createdEmail: string | undefined;
    User.findOne = ((filter: { email?: string }) => {
        lookupEmail = filter.email;
        return Promise.resolve(null);
    }) as typeof User.findOne;
    User.create = (async (input: { email?: string }) => {
        createdEmail = input.email;
        return publicUser;
    }) as typeof User.create;

    const response = await postJson("/api/auth/register", {
        name: "  Test User  ",
        email: "  TEST@EXAMPLE.COM ",
        password: "password123",
    });
    const body = (await response.json()) as Record<string, unknown>;

    assert.equal(response.status, 201);
    assert.equal(lookupEmail, "test@example.com");
    assert.equal(createdEmail, "test@example.com");
    assert.equal(JSON.stringify(body).includes("password123"), false);
    assert.equal(JSON.stringify(body).includes("$2"), false);
});

test("register maps duplicate email races to conflict", async () => {
    User.findOne = (() => Promise.resolve(null)) as typeof User.findOne;
    User.create = (async () => {
        throw Object.assign(new Error("duplicate"), {
            code: 11000,
            keyPattern: { email: 1 },
            keyValue: { email: "test@example.com" },
        });
    }) as typeof User.create;

    const response = await postJson("/api/auth/register", {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
    });

    assert.equal(response.status, 409);
});

test("register does not misreport an unexpected duplicate index as email", async () => {
    User.findOne = (() => Promise.resolve(null)) as typeof User.findOne;
    User.create = (async () => {
        throw Object.assign(new Error("unexpected duplicate"), {
            code: 11000,
            keyPattern: { legacyField: 1 },
            keyValue: { legacyField: "value" },
        });
    }) as typeof User.create;

    const response = await postJson("/api/auth/register", {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
    });
    const body = (await response.json()) as { message: string };

    assert.equal(response.status, 500);
    assert.equal(body.message, "Internal server error");
});

test("login normalizes email and returns a public user", async () => {
    let lookupEmail: string | undefined;
    const passwordHash = await bcrypt.hash("password123", 4);
    User.findOne = ((filter: { email?: string }) => {
        lookupEmail = filter.email;
        return {
            select: async () => ({
                ...publicUser,
                password: passwordHash,
            }),
        };
    }) as typeof User.findOne;

    const response = await postJson("/api/auth/login", {
        email: " TEST@EXAMPLE.COM ",
        password: "password123",
    });
    const body = (await response.json()) as Record<string, unknown>;

    assert.equal(response.status, 200);
    assert.equal(lookupEmail, "test@example.com");
    assert.equal(JSON.stringify(body).includes("$2"), false);
});

test("login uses a uniform unauthorized response for invalid credentials", async () => {
    User.findOne = (() => ({ select: async () => null })) as typeof User.findOne;

    const response = await postJson("/api/auth/login", {
        email: "missing@example.com",
        password: "password123",
    });
    const body = (await response.json()) as { message: string };

    assert.equal(response.status, 401);
    assert.equal(body.message, "Invalid email or password");
});

test("login rejects passwords longer than the supported maximum", async () => {
    const response = await postJson("/api/auth/login", {
        email: "test@example.com",
        password: "x".repeat(129),
    });

    assert.equal(response.status, 400);
});

test("login rejects a wrong password without exposing which credential failed", async () => {
    const passwordHash = await bcrypt.hash("correct-password", 4);
    User.findOne = (() => ({
        select: async () => ({ ...publicUser, password: passwordHash }),
    })) as typeof User.findOne;

    const response = await postJson("/api/auth/login", {
        email: "test@example.com",
        password: "wrong-password",
    });
    const body = (await response.json()) as { message: string };

    assert.equal(response.status, 401);
    assert.equal(body.message, "Invalid email or password");
});

test("login rejects inactive accounts", async () => {
    const passwordHash = await bcrypt.hash("password123", 4);
    User.findOne = (() => ({
        select: async () => ({
            ...publicUser,
            isActive: false,
            password: passwordHash,
        }),
    })) as typeof User.findOne;

    const response = await postJson("/api/auth/login", {
        email: "test@example.com",
        password: "password123",
    });

    assert.equal(response.status, 403);
});

test("me rejects missing, malformed, and expired tokens with 401", async () => {
    const missing = await fetch(`${baseUrl}/api/auth/me`);
    assert.equal(missing.status, 401);

    const malformed = await fetch(`${baseUrl}/api/auth/me`, {
        headers: { Authorization: "Bearer malformed-token" },
    });
    assert.equal(malformed.status, 401);

    const wrongSignatureToken = jwt.sign(
        { userId, role: "customer" },
        "different-test-secret"
    );
    const wrongSignature = await fetch(`${baseUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${wrongSignatureToken}` },
    });
    assert.equal(wrongSignature.status, 401);

    const expiredToken = jwt.sign(
        { userId, role: "customer" },
        process.env.JWT_SECRET!,
        { expiresIn: -1 }
    );
    const expired = await fetch(`${baseUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${expiredToken}` },
    });
    assert.equal(expired.status, 401);
});

test("me returns the complete public identity and no sensitive fields", async () => {
    User.findById = (async () => ({
        ...publicUser,
        password: "must-not-leak",
    })) as typeof User.findById;
    const token = jwt.sign(
        { userId, role: "customer" },
        process.env.JWT_SECRET!
    );

    const response = await fetch(`${baseUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const body = (await response.json()) as {
        data: { user: Record<string, unknown> };
    };

    assert.equal(response.status, 200);
    assert.deepEqual(body.data.user, {
        id: userId,
        name: "Test User",
        email: "test@example.com",
        role: "customer",
    });
    assert.equal("password" in body.data.user, false);
});

test("me rejects inactive users", async () => {
    User.findById = (async () => ({ ...publicUser, isActive: false })) as typeof User.findById;
    const token = jwt.sign(
        { userId, role: "customer" },
        process.env.JWT_SECRET!
    );

    const response = await fetch(`${baseUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    assert.equal(response.status, 401);
});
