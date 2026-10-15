import assert from "node:assert/strict";
import type { Server } from "node:http";
import { after, before, beforeEach, test } from "node:test";

import app from "../app.js";
import { User } from "../models/User.model.js";

const userId = "507f1f77bcf86cd799439011";
const originalFindOne = User.findOne;
const originalCreate = User.create;
const originalFetch = globalThis.fetch;
const originalGoogleClientId = process.env.GOOGLE_CLIENT_ID;
const originalFacebookAppId = process.env.FACEBOOK_APP_ID;

let server: Server;
let baseUrl: string;

before(async () => {
    process.env.JWT_SECRET = "social-auth-test-secret-key-32-chars";
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
    User.create = originalCreate;
    globalThis.fetch = originalFetch;

    if (originalGoogleClientId === undefined) delete process.env.GOOGLE_CLIENT_ID;
    else process.env.GOOGLE_CLIENT_ID = originalGoogleClientId;

    if (originalFacebookAppId === undefined) delete process.env.FACEBOOK_APP_ID;
    else process.env.FACEBOOK_APP_ID = originalFacebookAppId;

    await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve()))
    );
});

beforeEach(() => {
    User.findOne = originalFindOne;
    User.create = originalCreate;
    globalThis.fetch = originalFetch;
});

const postJson = (path: string, body: unknown) =>
    fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

test("GET /api/auth/config returns public social config", async () => {
    process.env.GOOGLE_CLIENT_ID = "mock-google-client-id.apps.googleusercontent.com";
    process.env.FACEBOOK_APP_ID = "mock-facebook-app-id-12345";

    const response = await fetch(`${baseUrl}/api/auth/config`);
    const body = (await response.json()) as {
        success: boolean;
        data: { googleClientId: string | null; facebookAppId: string | null };
    };

    assert.equal(response.status, 200);
    assert.equal(body.success, true);
    assert.equal(body.data.googleClientId, "mock-google-client-id.apps.googleusercontent.com");
    assert.equal(body.data.facebookAppId, "mock-facebook-app-id-12345");
});

test("POST /api/auth/google rejects missing or empty credential", async () => {
    const res1 = await postJson("/api/auth/google", {});
    assert.equal(res1.status, 400);

    const res2 = await postJson("/api/auth/google", { credential: "   " });
    assert.equal(res2.status, 400);
});

test("POST /api/auth/google registers a new user with Google verified email", async () => {
    process.env.GOOGLE_CLIENT_ID = "test-client-id";

    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url.includes("oauth2.googleapis.com/tokeninfo")) {
            return new Response(
                JSON.stringify({
                    sub: "google-sub-12345",
                    email: "newgoogle@example.com",
                    email_verified: "true",
                    name: "Google Customer",
                    picture: "https://lh3.googleusercontent.com/photo.jpg",
                    aud: "test-client-id",
                }),
                { status: 200, headers: { "Content-Type": "application/json" } }
            );
        }
        return originalFetch(input, init);
    }) as typeof fetch;

    let userCreatedWith: any = null;
    User.findOne = (async () => null) as typeof User.findOne;
    User.create = (async (data: any) => {
        userCreatedWith = data;
        return {
            id: userId,
            ...data,
        };
    }) as typeof User.create;

    const res = await postJson("/api/auth/google", {
        credential: "valid-google-id-token",
    });
    const body = (await res.json()) as any;

    assert.equal(res.status, 200);
    assert.equal(body.success, true);
    assert.equal(body.data.user.email, "newgoogle@example.com");
    assert.equal(body.data.user.role, "customer");
    assert.ok(body.data.token);
    assert.equal(userCreatedWith.googleId, "google-sub-12345");
    assert.equal(userCreatedWith.authProvider, "google");
});

test("POST /api/auth/google links account if user already exists with same email", async () => {
    process.env.GOOGLE_CLIENT_ID = "test-client-id";

    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url.includes("oauth2.googleapis.com/tokeninfo")) {
            return new Response(
                JSON.stringify({
                    sub: "google-sub-99999",
                    email: "existing@example.com",
                    email_verified: true,
                    name: "Existing User",
                    picture: "https://lh3.googleusercontent.com/avatar.jpg",
                    aud: "test-client-id",
                }),
                { status: 200, headers: { "Content-Type": "application/json" } }
            );
        }
        return originalFetch(input, init);
    }) as typeof fetch;

    let saved = false;
    const mockUser: any = {
        id: userId,
        name: "Existing User",
        email: "existing@example.com",
        role: "customer",
        isActive: true,
        authProvider: "local",
        avatar: "",
        save: async () => {
            saved = true;
        },
    };

    User.findOne = (async () => mockUser) as typeof User.findOne;

    const res = await postJson("/api/auth/google", {
        credential: "valid-google-id-token",
    });
    const body = (await res.json()) as any;

    assert.equal(res.status, 200);
    assert.equal(body.success, true);
    assert.equal(mockUser.googleId, "google-sub-99999");
    assert.equal(mockUser.avatar, "https://lh3.googleusercontent.com/avatar.jpg");
    assert.equal(saved, true);
});

test("POST /api/auth/google rejects invalid or unverified Google tokens", async () => {
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url.includes("oauth2.googleapis.com/tokeninfo")) {
            return new Response(
                JSON.stringify({ error_description: "Invalid Value" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }
        return originalFetch(input, init);
    }) as typeof fetch;

    const res = await postJson("/api/auth/google", {
        credential: "bad-token",
    });
    assert.equal(res.status, 401);
});

test("POST /api/auth/facebook registers a new user with Facebook profile", async () => {
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url.includes("graph.facebook.com")) {
            return new Response(
                JSON.stringify({
                    id: "fb-123456789",
                    name: "Facebook User",
                    email: "fbuser@example.com",
                    picture: {
                        data: {
                            url: "https://platform-lookaside.fbsbx.com/photo.jpg",
                        },
                    },
                }),
                { status: 200, headers: { "Content-Type": "application/json" } }
            );
        }
        return originalFetch(input, init);
    }) as typeof fetch;

    let userCreatedWith: any = null;
    User.findOne = (async () => null) as typeof User.findOne;
    User.create = (async (data: any) => {
        userCreatedWith = data;
        return {
            id: userId,
            ...data,
        };
    }) as typeof User.create;

    const res = await postJson("/api/auth/facebook", {
        accessToken: "valid-fb-token",
    });
    const body = (await res.json()) as any;

    assert.equal(res.status, 200);
    assert.equal(body.success, true);
    assert.equal(body.data.user.email, "fbuser@example.com");
    assert.equal(userCreatedWith.facebookId, "fb-123456789");
    assert.equal(userCreatedWith.authProvider, "facebook");
});

test("POST /api/auth/facebook rejects empty or invalid access token", async () => {
    const emptyRes = await postJson("/api/auth/facebook", { accessToken: "" });
    assert.equal(emptyRes.status, 400);

    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url.includes("graph.facebook.com")) {
            return new Response(
                JSON.stringify({ error: { message: "Invalid OAuth access token" } }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }
        return originalFetch(input, init);
    }) as typeof fetch;

    const invalidRes = await postJson("/api/auth/facebook", {
        accessToken: "expired-fb-token",
    });
    assert.equal(invalidRes.status, 401);
});
