import assert from "node:assert/strict";
import test from "node:test";

import { User } from "./User.model.js";

test("password is excluded from unique user indexes", () => {
    const passwordPath = User.schema.path("password");
    const passwordOptions = passwordPath.options as { unique?: boolean };
    const indexes = User.schema.indexes();

    assert.notEqual(passwordOptions.unique, true);
    assert.equal(
        indexes.some(([fields]) => Object.hasOwn(fields, "password")),
        false
    );
});
