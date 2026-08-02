import assert from "node:assert/strict";
import test from "node:test";

import { validateObjectId } from "./validateObjectId.js";

test("accepts canonical ObjectIds", () => {
    assert.equal(
        validateObjectId("507f1f77bcf86cd799439011", "order"),
        "507f1f77bcf86cd799439011"
    );
});

test("rejects malformed ObjectIds", () => {
    for (const value of ["", "abc", "507f1f77bcf86cd79943901z", [], {}]) {
        assert.throws(() => validateObjectId(value, "order"));
    }
});
