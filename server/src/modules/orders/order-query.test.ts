import assert from "node:assert/strict";
import test from "node:test";

import { parseAdminOrdersQuery } from "./order-query.js";

test("uses safe pagination defaults", () => {
    assert.deepEqual(parseAdminOrdersQuery({}), { page: 1, limit: 20 });
});

test("accepts valid pagination boundaries", () => {
    assert.deepEqual(parseAdminOrdersQuery({ page: "2", limit: "100" }), {
        page: 2,
        limit: 100,
    });
});

test("rejects invalid pagination values", () => {
    for (const query of [
        { page: "0" },
        { page: "1.5" },
        { limit: "101" },
        { limit: ["20"] },
        { page: "9007199254740992" },
        { page: "9".repeat(400) },
    ]) {
        assert.throws(() => parseAdminOrdersQuery(query));
    }
});
