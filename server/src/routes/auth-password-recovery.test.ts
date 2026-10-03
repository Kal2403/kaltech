import assert from "node:assert/strict";
import crypto from "node:crypto";
import type { Server } from "node:http";
import { after, before, test } from "node:test";
import bcrypt from "bcryptjs";

import app from "../app.js";
import { User } from "../models/User.model.js";

let server: Server;
let baseUrl: string;

const originalFindOne = User.findOne;
const originalJwtSecret = process.env.JWT_SECRET;

const mockUser = {
    _id: "507f1f77bcf86cd799439011",
    name: "Recovery User",
    email: "recovery@kaltech.com",
    password: "old-hashed-password",
    role: "customer" as const,
    isActive: true,
    resetPasswordToken: undefined as string | undefined,
    resetPasswordExpires: undefined as Date | undefined,
    async save() {
        return this;
    },
};

before(async () => {
    process.env.JWT_SECRET = "auth-recovery-test-secret";
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
    if (originalJwtSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalJwtSecret;

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

test("forgot-password rejects invalid or missing email", async () => {
    const emptyResponse = await postJson("/api/auth/forgot-password", {});
    assert.equal(emptyResponse.status, 400);

    const invalidResponse = await postJson("/api/auth/forgot-password", {
        email: "not-an-email",
    });
    assert.equal(invalidResponse.status, 400);
});

test("forgot-password returns 200 even if email does not exist (anti-enumeration)", async () => {
    User.findOne = (() => Promise.resolve(null)) as typeof User.findOne;

    const response = await postJson("/api/auth/forgot-password", {
        email: "nonexistent@kaltech.com",
    });
    const body = (await response.json()) as { success: boolean; message: string };

    assert.equal(response.status, 200);
    assert.equal(body.success, true);
    assert.equal(
        body.message,
        "Si el correo electrónico está registrado, recibirás un enlace para restablecer tu contraseña."
    );
});

test("forgot-password sets reset token and expiration on active user", async () => {
    let saved = false;
    let savedHashedToken: string | undefined;
    let savedExpiry: Date | undefined;

    const targetUser = {
        ...mockUser,
        async save() {
            saved = true;
            savedHashedToken = this.resetPasswordToken;
            savedExpiry = this.resetPasswordExpires;
            return this;
        },
    };

    User.findOne = ((filter: { email?: string }) => {
        if (filter.email === "recovery@kaltech.com") {
            return Promise.resolve(targetUser);
        }
        return Promise.resolve(null);
    }) as typeof User.findOne;

    const response = await postJson("/api/auth/forgot-password", {
        email: " RECOVERY@kaltech.com ",
    });
    const body = (await response.json()) as { success: boolean; message: string };

    assert.equal(response.status, 200);
    assert.equal(body.success, true);
    assert.equal(saved, true);
    assert.equal(typeof savedHashedToken, "string");
    assert.equal(savedHashedToken?.length, 64); // SHA-256 hex length
    assert.ok(savedExpiry && savedExpiry.getTime() > Date.now());
});

test("reset-password validates token and password requirements", async () => {
    const missingToken = await postJson("/api/auth/reset-password", {
        password: "newPassword123",
    });
    assert.equal(missingToken.status, 400);

    const shortPassword = await postJson("/api/auth/reset-password", {
        token: "some-random-token",
        password: "short",
    });
    assert.equal(shortPassword.status, 400);

    const excessivePassword = await postJson("/api/auth/reset-password", {
        token: "some-random-token",
        password: "x".repeat(80),
    });
    assert.equal(excessivePassword.status, 400);
});

test("reset-password rejects invalid or expired tokens", async () => {
    User.findOne = (() => ({
        select: async () => null,
    })) as typeof User.findOne;

    const response = await postJson("/api/auth/reset-password", {
        token: "invalid-or-expired-token",
        password: "validNewPassword123",
    });
    const body = (await response.json()) as { success: boolean; message: string };

    assert.equal(response.status, 400);
    assert.equal(body.success, false);
    assert.equal(body.message, "El token de recuperación es inválido o ha expirado");
});

test("reset-password rejects inactive user account", async () => {
    User.findOne = (() => ({
        select: async () => ({
            ...mockUser,
            isActive: false,
        }),
    })) as typeof User.findOne;

    const response = await postJson("/api/auth/reset-password", {
        token: "valid-token-for-inactive-user",
        password: "validNewPassword123",
    });

    assert.equal(response.status, 403);
});

test("reset-password updates password and clears reset token fields", async () => {
    const rawToken = "my-secret-test-token-12345";
    const expectedHashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    let saved = false;
    let newPasswordStored: string | undefined;
    let clearedToken: unknown = "not-cleared";
    let clearedExpires: unknown = "not-cleared";

    const userInDb = {
        ...mockUser,
        resetPasswordToken: expectedHashedToken,
        resetPasswordExpires: new Date(Date.now() + 3600000),
        async save() {
            saved = true;
            newPasswordStored = this.password;
            clearedToken = this.resetPasswordToken;
            clearedExpires = this.resetPasswordExpires;
            return this;
        },
    };

    User.findOne = ((filter: { resetPasswordToken?: string; resetPasswordExpires?: { $gt: Date } }) => {
        if (filter.resetPasswordToken === expectedHashedToken) {
            return {
                select: async () => userInDb,
            };
        }
        return {
            select: async () => null,
        };
    }) as typeof User.findOne;

    const response = await postJson("/api/auth/reset-password", {
        token: rawToken,
        password: "brandNewSecurePassword456",
    });
    const body = (await response.json()) as { success: boolean; message: string };

    assert.equal(response.status, 200);
    assert.equal(body.success, true);
    assert.equal(saved, true);
    assert.equal(clearedToken, undefined);
    assert.equal(clearedExpires, undefined);
    assert.ok(newPasswordStored && newPasswordStored !== "brandNewSecurePassword456");
    assert.ok(await bcrypt.compare("brandNewSecurePassword456", newPasswordStored!));
});
