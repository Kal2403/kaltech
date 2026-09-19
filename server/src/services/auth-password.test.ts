import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import bcrypt from "bcryptjs";

import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { loginUser, registerUser } from "./auth.service.js";

const originalSecret = process.env.JWT_SECRET;
const originalExpiry = process.env.JWT_EXPIRES_IN;
before(() => {
    process.env.JWT_SECRET = "isolated-password-validation-test-secret";
    process.env.JWT_EXPIRES_IN = "1h";
});
after(() => {
    if (originalSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalSecret;
    if (originalExpiry === undefined) delete process.env.JWT_EXPIRES_IN;
    else process.env.JWT_EXPIRES_IN = originalExpiry;
});

const user = {
    id: "507f1f77bcf86cd799439011", name: "Password Test",
    email: "password@example.com", role: "customer", isActive: true,
};
const invalidInput = (error: unknown) => error instanceof ApiError && error.statusCode === 400;
const cases = [
    { name: "ASCII", accepted: "a".repeat(72), rejected: "a".repeat(73) },
    { name: "two-byte Unicode", accepted: "é".repeat(36), rejected: "é".repeat(37) },
    { name: "four-byte emoji", accepted: "😀".repeat(18), rejected: "😀".repeat(19) },
];

for (const scenario of cases) {
    test(`register accepts exactly 72 UTF-8 bytes of ${scenario.name}`, async (t) => {
        assert.equal(Buffer.byteLength(scenario.accepted, "utf8"), 72);
        t.mock.method(User, "findOne", (() => Promise.resolve(null)) as typeof User.findOne);
        const hash = t.mock.method(bcrypt, "hash", (async () => "test-hash") as typeof bcrypt.hash);
        const create = t.mock.method(User, "create", (async () => user) as unknown as typeof User.create);
        const result = await registerUser({ ...user, password: scenario.accepted });
        assert.equal(result.user.id, user.id);
        assert.deepEqual(hash.mock.calls[0]!.arguments, [scenario.accepted, 12]);
        assert.equal(create.mock.callCount(), 1);
        assert.equal("password" in result.user, false);
    });

    test(`login accepts exactly 72 UTF-8 bytes of ${scenario.name}`, async (t) => {
        const passwordHash = await bcrypt.hash(scenario.accepted, 4);
        t.mock.method(User, "findOne", (() => ({
            select: async () => ({ ...user, password: passwordHash }),
        })) as unknown as typeof User.findOne);
        const compare = t.mock.method(bcrypt, "compare");
        const result = await loginUser({ email: user.email, password: scenario.accepted });
        assert.equal(result.user.id, user.id);
        assert.deepEqual(compare.mock.calls[0]!.arguments, [scenario.accepted, passwordHash]);
    });

    for (const [action, service] of [["register", registerUser], ["login", loginUser]] as const) {
        test(`${action} rejects over 72 UTF-8 bytes of ${scenario.name} before database or bcrypt calls`, async (t) => {
            const find = t.mock.method(User, "findOne", (() => assert.fail("Unexpected database lookup")) as typeof User.findOne);
            const create = t.mock.method(User, "create", (() => assert.fail("Unexpected database write")) as typeof User.create);
            const hash = t.mock.method(bcrypt, "hash", (() => assert.fail("Unexpected hash")) as typeof bcrypt.hash);
            const compare = t.mock.method(bcrypt, "compare", (() => assert.fail("Unexpected compare")) as typeof bcrypt.compare);
            await assert.rejects(service({ ...user, password: scenario.rejected }), invalidInput);
            for (const mock of [find, create, hash, compare]) assert.equal(mock.mock.callCount(), 0);
        });
    }
}

test("registration keeps the existing eight-character minimum", async (t) => {
    const find = t.mock.method(User, "findOne", (() => Promise.resolve(null)) as typeof User.findOne);
    const hash = t.mock.method(bcrypt, "hash", (async () => "test-hash") as typeof bcrypt.hash);
    t.mock.method(User, "create", (async () => user) as unknown as typeof User.create);
    await assert.rejects(registerUser({ ...user, password: "1234567" }), invalidInput);
    assert.equal(find.mock.callCount(), 0);
    assert.equal(hash.mock.callCount(), 0);
    await registerUser({ ...user, password: "12345678" });
    assert.equal(hash.mock.callCount(), 1);
});

test("registration preserves leading and trailing password spaces", async (t) => {
    const password = "  password  ";
    t.mock.method(User, "findOne", (() => Promise.resolve(null)) as typeof User.findOne);
    const hash = t.mock.method(bcrypt, "hash", (async () => "test-hash") as typeof bcrypt.hash);
    t.mock.method(User, "create", (async () => user) as unknown as typeof User.create);
    await registerUser({ ...user, password });
    assert.equal(hash.mock.calls[0]!.arguments[0], password);
});

test("login compares the untrimmed password and rejects the trimmed variant", async (t) => {
    const password = "  password  ";
    const passwordHash = await bcrypt.hash(password, 4);
    t.mock.method(User, "findOne", (() => ({
        select: async () => ({ ...user, password: passwordHash }),
    })) as unknown as typeof User.findOne);
    await loginUser({ email: user.email, password });
    await assert.rejects(loginUser({ email: user.email, password: password.trim() }),
        (error: unknown) => error instanceof ApiError && error.statusCode === 401);
});

test("login rejects empty input before lookup but permits an existing short password", async (t) => {
    const passwordHash = await bcrypt.hash("short", 4);
    const find = t.mock.method(User, "findOne", (() => ({
        select: async () => ({ ...user, password: passwordHash }),
    })) as unknown as typeof User.findOne);
    const compare = t.mock.method(bcrypt, "compare");
    await assert.rejects(loginUser({ email: user.email, password: "" }), invalidInput);
    assert.equal(find.mock.callCount(), 0);
    assert.equal(compare.mock.callCount(), 0);
    await loginUser({ email: user.email, password: "short" });
    assert.equal(compare.mock.callCount(), 1);
});
