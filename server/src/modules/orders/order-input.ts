import type { IShippingAddress, PaymentMethod } from "../../models/Order.model.js";
import { ApiError } from "../../utils/ApiError.js";

export interface CreateOrderInput {
    shippingAddress: IShippingAddress;
    paymentMethod: PaymentMethod;
    couponCode?: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

export const parseCreateOrderInput = (value: unknown): CreateOrderInput => {
    if (!isRecord(value) || !isRecord(value.shippingAddress)) {
        throw new ApiError(400, "Shipping address is required");
    }

    const address = value.shippingAddress;
    const readAddressField = (field: keyof IShippingAddress): string => {
        const fieldValue = address[field];
        if (typeof fieldValue !== "string" || fieldValue.trim().length === 0) {
            throw new ApiError(400, `Shipping address ${field} is required`);
        }
        return fieldValue.trim();
    };

    const shippingAddress: IShippingAddress = {
        fullName: readAddressField("fullName"),
        address: readAddressField("address"),
        city: readAddressField("city"),
        postalCode: readAddressField("postalCode"),
        country: readAddressField("country"),
        phone: readAddressField("phone"),
    };

    const paymentMethod = value.paymentMethod;
    if (paymentMethod !== "card" && paymentMethod !== "paypal" && paymentMethod !== "cash") {
        throw new ApiError(400, "Invalid payment method");
    }

    let couponCode: string | undefined;
    if (value.couponCode !== undefined && value.couponCode !== null) {
        if (typeof value.couponCode !== "string") {
            throw new ApiError(400, "Coupon code must be a string");
        }
        const trimmed = value.couponCode.trim().toUpperCase();
        if (trimmed.length > 0) {
            couponCode = trimmed;
        }
    }

    const result: CreateOrderInput = { shippingAddress, paymentMethod };
    if (couponCode !== undefined) {
        result.couponCode = couponCode;
    }

    return result;
};
