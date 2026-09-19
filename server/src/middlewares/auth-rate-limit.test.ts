import assert from "node:assert/strict";
import { once } from "node:events";
import { test, type TestContext } from "node:test";
import express, { type Express } from "express";

import app from "../app.js";
import { createAuthRateLimiters } from "./auth-rate-limit.middleware.js";

const serve = async (t: TestContext, application: Express) => {
    const server = application.listen(0, "127.0.0.1");
    await once(server, "listening");
    t.after(async () => {
        await new Promise<void>((resolve, reject) => {
            server.close((error) => error ? reject(error) : resolve());
        });
    });
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    return `http://127.0.0.1:${address.port}`;
};

const fixture = async (t: TestContext) => {
    const application = express();
    // Only the local test fixture trusts its simulated one-hop proxy.
    application.set("trust proxy", 1);
    application.use(express.json());
    const limits = createAuthRateLimiters();
    let handled = 0;
    const handler: express.RequestHandler = (_req, res) => {
        handled++;
        res.status(204).end();
    };
    application.post("/login", limits.loginIp, limits.loginAccount, handler);
    application.post("/register", limits.registerIp, handler);
    const baseUrl = await serve(t, application);
    return { baseUrl, handled: () => handled };
};

const post = (baseUrl: string, path: string, body: unknown = {}, ip: string | null = "192.0.2.1") =>
    fetch(`${baseUrl}${path}`, {
        method: "POST", headers: { "Content-Type": "application/json", ...(ip ? { "X-Forwarded-For": ip } : {}) },
        body: JSON.stringify(body),
    });

const assertBlocked = async (response: Response, maximumRetry: number) => {
    assert.equal(response.status, 429);
    assert.ok(response.headers.get("ratelimit"));
    assert.ok(response.headers.get("ratelimit-policy"));
    assert.deepEqual(await response.json(), {
        success: false,
        message: "Demasiados intentos. Inténtalo de nuevo más tarde.",
    });
    const retry = Number(response.headers.get("retry-after"));
    assert.ok(Number.isInteger(retry) && retry > 0 && retry <= maximumRetry);
};

for (const scenario of [
    { path: "/login", allowed: 30, window: 900 },
    { path: "/register", allowed: 10, window: 3600 },
]) {
    test(`${scenario.path} enforces its IP quota without reaching the handler after blocking`, async (t) => {
        const instance = await fixture(t);
        for (let i = 0; i < scenario.allowed; i++) {
            assert.equal((await post(instance.baseUrl, scenario.path)).status, 204);
        }
        await assertBlocked(await post(instance.baseUrl, scenario.path), scenario.window);
        assert.equal(instance.handled(), scenario.allowed);
        assert.equal((await post(instance.baseUrl, scenario.path, {}, "192.0.2.2")).status, 204);
    });
}

test("account quota follows normalized email across distinct IPs without exposing email", async (t) => {
    const instance = await fixture(t);
    for (let i = 0; i < 10; i++) {
        const email = i % 2 ? " PRIVATE@EXAMPLE.COM " : "private@example.com";
        assert.equal((await post(instance.baseUrl, "/login", { email }, `192.0.2.${i + 1}`)).status, 204);
    }
    const response = await post(instance.baseUrl, "/login", { email: "Private@Example.Com" }, "198.51.100.1");
    assert.equal(JSON.stringify([...response.headers]).toLowerCase().includes("private@example.com"), false);
    await assertBlocked(response, 900);
    assert.equal(instance.handled(), 10);
    assert.equal((await post(instance.baseUrl, "/login", { email: "another@example.com" }, "198.51.100.1")).status, 204);
});

test("IPv6 addresses within a /56 share their IP quota while another /56 remains independent", async (t) => {
    const instance = await fixture(t);
    for (let i = 0; i < 10; i++) {
        assert.equal((await post(instance.baseUrl, "/register", {}, `2001:db8:abcd:1201::${i + 1}`)).status, 204);
    }
    await assertBlocked(await post(instance.baseUrl, "/register", {}, "2001:db8:abcd:12ff::1"), 3600);
    assert.equal((await post(instance.baseUrl, "/register", {}, "2001:db8:abcd:1300::1")).status, 204);
});

test("fresh limiter factories do not share counters", async (t) => {
    const first = await fixture(t);
    const second = await fixture(t);
    for (let i = 0; i < 10; i++) await post(first.baseUrl, "/register");
    await assertBlocked(await post(first.baseUrl, "/register"), 3600);
    assert.equal((await post(second.baseUrl, "/register")).status, 204);
});

test("login IP and account quotas expire after their window", async (t) => {
    t.mock.timers.enable({ apis: ["Date"], now: 1_800_000_000_000 });
    const instance = await fixture(t);
    for (let i = 0; i < 10; i++) await post(instance.baseUrl, "/login", { email: "expiry@example.com" });
    await assertBlocked(await post(instance.baseUrl, "/login", { email: "expiry@example.com" }), 900);
    for (let i = 0; i < 19; i++) assert.equal((await post(instance.baseUrl, "/login")).status, 204);
    await assertBlocked(await post(instance.baseUrl, "/login"), 900);
    t.mock.timers.tick(900_001);
    assert.equal((await post(instance.baseUrl, "/login", { email: "expiry@example.com" })).status, 204);
});

test("the real auth router applies both IP limiters before invalid input reaches database code", async (t) => {
    const baseUrl = await serve(t, app);
    for (let i = 0; i < 30; i++) assert.equal((await post(baseUrl, "/api/auth/login", {}, null)).status, 400);
    await assertBlocked(await post(baseUrl, "/api/auth/login", {}, null), 900);
    for (let i = 0; i < 10; i++) assert.equal((await post(baseUrl, "/api/auth/register", {}, null)).status, 400);
    await assertBlocked(await post(baseUrl, "/api/auth/register", {}, null), 3600);
    assert.equal((await fetch(`${baseUrl}/api/auth/me`)).status, 401);
});
