import assert from "node:assert/strict";
import { test } from "node:test";
import { parseCreateOrderInput } from "./order-input.js";
import { ApiError } from "../../utils/ApiError.js";

const shippingAddress = {
    fullName: "Test Customer", address: "Test Street 1", city: "Madrid",
    postalCode: "28001", country: "Spain", phone: "600000000",
};
const isBadRequest = (error: unknown) => error instanceof ApiError && error.statusCode === 400;

test("checkout rejects missing or malformed request objects", () => {
    for (const value of [undefined, null, [], "invalid", {}, { shippingAddress: [] }]) {
        assert.throws(() => parseCreateOrderInput(value), isBadRequest);
    }
});

test("checkout requires every address field to be a nonempty string", () => {
    for (const field of Object.keys(shippingAddress)) {
        for (const invalid of [undefined, null, "", "   ", 123, {}, []]) {
            assert.throws(() => parseCreateOrderInput({
                shippingAddress: { ...shippingAddress, [field]: invalid }, paymentMethod: "cash",
            }), isBadRequest);
        }
    }
});

test("checkout accepts only supported payment methods", () => {
    for (const paymentMethod of [undefined, null, "bank", {}, 1]) {
        assert.throws(() => parseCreateOrderInput({ shippingAddress, paymentMethod }), isBadRequest);
    }
    for (const paymentMethod of ["cash", "card", "paypal"]) {
        assert.equal(parseCreateOrderInput({ shippingAddress, paymentMethod }).paymentMethod, paymentMethod);
    }
});

test("checkout normalizes the address and excludes client-controlled order fields", () => {
    const result = parseCreateOrderInput({
        shippingAddress: { ...shippingAddress, fullName: " Test Customer ", privateField: "ignored" },
        paymentMethod: "cash", user: "another-user", total: 0, items: [], paymentStatus: "paid",
    });
    assert.deepEqual(result, { shippingAddress, paymentMethod: "cash" });
});
