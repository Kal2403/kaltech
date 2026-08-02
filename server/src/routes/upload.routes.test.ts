import assert from "node:assert/strict";
import type { Server } from "node:http";
import { after, before, test } from "node:test";
import jwt from "jsonwebtoken";

import app from "../app.js";
import { User } from "../models/User.model.js";

const userId = "507f1f77bcf86cd799439011";
const originalFindById = User.findById;
const originalJwtSecret = process.env.JWT_SECRET;
let server: Server;
let baseUrl: string;

before(async () => {
    process.env.JWT_SECRET = "upload-route-test-secret";
    server = app.listen(0);
    await new Promise<void>((resolve) => server.once("listening", resolve));
    const address = server.address();
    if (!address || typeof address === "string") {
        throw new Error("Test server did not bind to a TCP port");
    }
    baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
    User.findById = originalFindById;
    if (originalJwtSecret === undefined) {
        delete process.env.JWT_SECRET;
    } else {
        process.env.JWT_SECRET = originalJwtSecret;
    }
    await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve()))
    );
});

const useUserRole = (role: "customer" | "admin"): string => {
    User.findById = (async () => ({
        id: userId,
        role,
        isActive: true,
    })) as typeof User.findById;

    return jwt.sign({ userId, role }, process.env.JWT_SECRET!);
};

test("upload route rejects requests without authentication", async () => {
    const response = await fetch(`${baseUrl}/api/uploads/image`, {
        method: "POST",
    });

    assert.equal(response.status, 401);
});

test("upload route rejects authenticated customers before parsing files", async () => {
    const token = useUserRole("customer");
    const response = await fetch(`${baseUrl}/api/uploads/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
    });

    assert.equal(response.status, 403);
});

test("upload route requires an image from administrators", async () => {
    const token = useUserRole("admin");
    const response = await fetch(`${baseUrl}/api/uploads/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
    });

    assert.equal(response.status, 400);
    const body = (await response.json()) as { message: string };
    assert.equal(body.message, "Image file is required");
});

test("upload route rejects an unexpected multipart field", async () => {
    const token = useUserRole("admin");
    const formData = new FormData();
    formData.append("file", new Blob(["not-an-image"]), "image.png");

    const response = await fetch(`${baseUrl}/api/uploads/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
    });

    assert.equal(response.status, 400);
});

test("upload route rejects files larger than five MiB", async () => {
    const token = useUserRole("admin");
    const formData = new FormData();
    formData.append(
        "image",
        new Blob([Buffer.alloc(5 * 1024 * 1024 + 1)], { type: "image/png" }),
        "large.png"
    );

    const response = await fetch(`${baseUrl}/api/uploads/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
    });

    assert.equal(response.status, 413);
});
