import assert from "node:assert/strict";
import { once } from "node:events";
import type { Server } from "node:http";
import { after, before, test } from "node:test";

import app from "../app.js";

let server: Server;
let baseUrl: string;
const secret = "fake-sensitive-password-token";

before(async () => {
    server = app.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Missing test server port");
    baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
    await new Promise<void>((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
    });
});

const scenarios = [
    { name: "malformed JSON", body: `{"password":"${secret}",`, status: 400, message: "Invalid JSON request body", category: "invalid_json" },
    { name: "oversized JSON", body: JSON.stringify({ password: secret, padding: "x".repeat(110 * 1024) }), status: 413, message: "Request body is too large", category: "body_too_large" },
];

for (const scenario of scenarios) {
    test(`rejects ${scenario.name} safely through the application parser`, async (t) => {
        const logger = t.mock.method(console, "error", () => {});
        const response = await fetch(`${baseUrl}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
            body: scenario.body,
        });
        const body = await response.json();

        assert.equal(response.status, scenario.status);
        assert.deepEqual(body, { success: false, message: scenario.message });
        assert.deepEqual(logger.mock.calls.map((call) => call.arguments), [
            ["Request failed", { category: scenario.category, statusCode: scenario.status }],
        ]);
        assert.equal(JSON.stringify(body).includes(secret), false);
        assert.equal(JSON.stringify(logger.mock.calls.map((call) => call.arguments)).includes(secret), false);
    });
}
