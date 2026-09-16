import assert from "node:assert/strict";
import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import multer from "multer";
import { test } from "node:test";

import { errorMiddleware } from "./error.middleware.js";
import { ApiError } from "../utils/ApiError.js";

const secret = "private-password-token-database-value";

const cases = [
    { name: "controlled errors", error: new ApiError(403, "Access denied"), status: 403, message: "Access denied", category: "operational" },
    { name: "large uploads", error: new multer.MulterError("LIMIT_FILE_SIZE", secret), status: 413, message: "Image must not exceed 5 MiB", category: "upload" },
    { name: "invalid uploads", error: new multer.MulterError("LIMIT_UNEXPECTED_FILE", secret), status: 400, message: "Invalid image upload request", category: "upload" },
    { name: "cast errors", error: new mongoose.Error.CastError("ObjectId", secret, "product"), status: 400, message: "Invalid request value", category: "cast" },
    { name: "duplicate keys", error: Object.assign(new Error(secret), { code: 11000, keyValue: { email: secret }, keyPattern: { email: 1 } }), status: 409, message: "Resource already exists", category: "duplicate_key" },
    { name: "unexpected errors", error: new Error(secret, { cause: new Error(secret) }), status: 500, message: "Internal server error", category: "unexpected" },
    { name: "unrecognized syntax errors", error: new SyntaxError(secret), status: 500, message: "Internal server error", category: "unexpected" },
    { name: "unrecognized status codes", error: { status: 400, message: secret }, status: 500, message: "Internal server error", category: "unexpected" },
    { name: "non-error throws", error: secret, status: 500, message: "Internal server error", category: "unexpected" },
    { name: "null throws", error: null, status: 500, message: "Internal server error", category: "unexpected" },
];

const validationError = new mongoose.Error.ValidationError();
validationError.addError("password", new mongoose.Error.ValidatorError({ message: secret, value: secret, path: "password" }));
cases.push({ name: "validation errors", error: validationError, status: 400, message: "Invalid request data", category: "validation" });

for (const scenario of cases) {
    test(`handles ${scenario.name} without exposing internal data`, (t) => {
        const logger = t.mock.method(console, "error", () => {});
        let statusCode: number | undefined;
        let body: unknown;
        const response = {
            headersSent: false,
            status(value: number) { statusCode = value; return this; },
            json(value: unknown) { body = value; return this; },
        } as Response;

        errorMiddleware(scenario.error, {} as Request, response, () => assert.fail("Unexpected delegation"));

        assert.equal(statusCode, scenario.status);
        assert.deepEqual(body, { success: false, message: scenario.message });
        assert.deepEqual(logger.mock.calls.map((call) => call.arguments), [
            ["Request failed", { category: scenario.category, statusCode: scenario.status }],
        ]);
        assert.equal(JSON.stringify(body).includes(secret), false);
        assert.equal(JSON.stringify(logger.mock.calls.map((call) => call.arguments)).includes(secret), false);
    });
}

test("does not log even controlled error messages", (t) => {
    const logger = t.mock.method(console, "error", () => {});
    const response = { status() { return this; }, json() { return this; } } as unknown as Response;
    errorMiddleware(new ApiError(400, secret), {} as Request, response, () => {});
    assert.deepEqual(logger.mock.calls[0].arguments, ["Request failed", { category: "operational", statusCode: 400 }]);
});

test("delegates safely when response headers have already been sent", (t) => {
    const logger = t.mock.method(console, "error", () => {});
    let delegated: unknown;
    const response = {
        headersSent: true,
        status() { assert.fail("Cannot write headers twice"); },
    } as unknown as Response;
    const next: NextFunction = (error: unknown) => { delegated = error; };

    errorMiddleware(new Error(secret), {} as Request, response, next);

    assert.ok(delegated instanceof Error);
    assert.equal(delegated.message, "Request failed after response started");
    assert.equal(delegated.stack?.includes(secret), false);
    assert.equal(delegated.cause, undefined);
    assert.deepEqual(logger.mock.calls[0].arguments, ["Request failed", { category: "unexpected", statusCode: 500 }]);
});
