import assert from "node:assert/strict";
import type { Server } from "node:http";
import { after, before, test } from "node:test";
import mongoose from "mongoose";

import app from "../app.js";

let server: Server;
let baseUrl: string;
const originalReadyState = mongoose.connection.readyState;

before(async () => {
    server = app.listen(0);
    await new Promise<void>((resolve) => server.once("listening", resolve));
    const address = server.address();
    if (!address || typeof address === "string") {
        throw new Error("Test server did not bind to a TCP port");
    }
    baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
    Object.defineProperty(mongoose.connection, "readyState", {
        value: originalReadyState,
        configurable: true,
        writable: true,
    });

    await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve()))
    );
});

test("GET /health returns 200 and healthy status when database is connected", async () => {
    Object.defineProperty(mongoose.connection, "readyState", {
        value: 1,
        configurable: true,
        writable: true,
    });

    const response = await fetch(`${baseUrl}/health`);
    const body = (await response.json()) as {
        status: string;
        database: string;
        uptime: number;
        timestamp: string;
        environment: string;
        version: string;
    };

    assert.equal(response.status, 200);
    assert.equal(body.status, "ok");
    assert.equal(body.database, "connected");
    assert.equal(typeof body.uptime, "number");
    assert.equal(typeof body.timestamp, "string");
    assert.equal(body.version, "1.0.0");
});

test("GET /api/health returns 200 and healthy status matching /health", async () => {
    Object.defineProperty(mongoose.connection, "readyState", {
        value: 1,
        configurable: true,
        writable: true,
    });

    const response = await fetch(`${baseUrl}/api/health`);
    const body = (await response.json()) as {
        status: string;
        database: string;
    };

    assert.equal(response.status, 200);
    assert.equal(body.status, "ok");
    assert.equal(body.database, "connected");
});

test("GET /health returns 503 and degraded status when database is disconnected", async () => {
    Object.defineProperty(mongoose.connection, "readyState", {
        value: 0,
        configurable: true,
        writable: true,
    });

    const response = await fetch(`${baseUrl}/health`);
    const body = (await response.json()) as {
        status: string;
        database: string;
    };

    assert.equal(response.status, 503);
    assert.equal(body.status, "degraded");
    assert.equal(body.database, "disconnected");
});
