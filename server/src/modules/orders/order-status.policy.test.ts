import assert from "node:assert/strict";
import test from "node:test";

import {
    canTransitionOrderStatus,
    isOrderStatus,
} from "./order-status.policy.js";

test("recognizes only supported order statuses", () => {
    assert.equal(isOrderStatus("pending"), true);
    assert.equal(isOrderStatus("unknown"), false);
    assert.equal(isOrderStatus(undefined), false);
});

test("allows the approved order lifecycle and idempotent retries", () => {
    assert.equal(canTransitionOrderStatus("pending", "processing"), true);
    assert.equal(canTransitionOrderStatus("pending", "cancelled"), true);
    assert.equal(canTransitionOrderStatus("processing", "shipped"), true);
    assert.equal(canTransitionOrderStatus("processing", "cancelled"), true);
    assert.equal(canTransitionOrderStatus("shipped", "delivered"), true);
    assert.equal(canTransitionOrderStatus("delivered", "delivered"), true);
});

test("rejects skipped, reversed, and terminal transitions", () => {
    assert.equal(canTransitionOrderStatus("pending", "shipped"), false);
    assert.equal(canTransitionOrderStatus("shipped", "processing"), false);
    assert.equal(canTransitionOrderStatus("delivered", "cancelled"), false);
    assert.equal(canTransitionOrderStatus("cancelled", "pending"), false);
});
