import { Coupon, type ICoupon } from "../models/Coupon.model.js";
import { ApiError } from "../utils/ApiError.js";

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

export interface ValidatedCouponResult {
    valid: true;
    coupon: {
        _id: unknown;
        code: string;
        description?: string;
        discountPercent: number;
        minOrderAmount: number;
        maxDiscountAmount?: number;
    };
    discountAmount: number;
    newSubtotal: number;
}

export const validateCoupon = async (
    code: string,
    subtotal: number
): Promise<ValidatedCouponResult> => {
    if (!code || typeof code !== "string" || code.trim().length === 0) {
        throw new ApiError(400, "Coupon code is required");
    }

    if (!Number.isFinite(subtotal) || subtotal < 0) {
        throw new ApiError(400, "Invalid subtotal");
    }

    const normalizedCode = code.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: normalizedCode });

    if (!coupon) {
        throw new ApiError(404, "Coupon not found");
    }

    if (!coupon.isActive) {
        throw new ApiError(400, "Coupon is inactive");
    }

    const now = new Date();

    if (coupon.validFrom && now < coupon.validFrom) {
        throw new ApiError(400, "Coupon is not yet active");
    }

    if (coupon.validUntil && now > coupon.validUntil) {
        throw new ApiError(400, "Coupon has expired");
    }

    if (
        coupon.maxUses !== undefined &&
        coupon.maxUses !== null &&
        coupon.usedCount >= coupon.maxUses
    ) {
        throw new ApiError(400, "Coupon usage limit reached");
    }

    if (coupon.minOrderAmount > 0 && subtotal < coupon.minOrderAmount) {
        throw new ApiError(
            400,
            `Minimum order amount of $${coupon.minOrderAmount} required`
        );
    }

    let calculatedDiscount = (subtotal * coupon.discountPercent) / 100;

    if (
        coupon.maxDiscountAmount !== undefined &&
        coupon.maxDiscountAmount !== null &&
        calculatedDiscount > coupon.maxDiscountAmount
    ) {
        calculatedDiscount = coupon.maxDiscountAmount;
    }

    const discountAmount = Number(
        Math.min(subtotal, Math.max(0, calculatedDiscount)).toFixed(2)
    );
    const newSubtotal = Number(Math.max(0, subtotal - discountAmount).toFixed(2));

    return {
        valid: true,
        coupon: {
            _id: coupon._id,
            code: coupon.code,
            description: coupon.description,
            discountPercent: coupon.discountPercent,
            minOrderAmount: coupon.minOrderAmount,
            maxDiscountAmount: coupon.maxDiscountAmount,
        },
        discountAmount,
        newSubtotal,
    };
};

export interface CreateCouponInput {
    code: string;
    description?: string;
    discountPercent: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    validFrom?: Date | string;
    validUntil?: Date | string;
    maxUses?: number;
    isActive?: boolean;
}

export const createCoupon = async (data: unknown): Promise<ICoupon> => {
    if (!isRecord(data)) {
        throw new ApiError(400, "Invalid coupon data");
    }

    if (typeof data.code !== "string" || data.code.trim().length === 0) {
        throw new ApiError(400, "Coupon code is required");
    }

    const normalizedCode = data.code.trim().toUpperCase();

    if (normalizedCode.length < 3 || normalizedCode.length > 30) {
        throw new ApiError(
            400,
            "Coupon code must be between 3 and 30 characters"
        );
    }

    const existingCoupon = await Coupon.findOne({ code: normalizedCode });
    if (existingCoupon) {
        throw new ApiError(409, "A coupon with this code already exists");
    }

    const discountPercent = Number(data.discountPercent);
    if (
        !Number.isFinite(discountPercent) ||
        discountPercent < 1 ||
        discountPercent > 99
    ) {
        throw new ApiError(
            400,
            "Discount percentage must be a number between 1 and 99"
        );
    }

    let minOrderAmount = 0;
    if (data.minOrderAmount !== undefined && data.minOrderAmount !== null) {
        const parsedMin = Number(data.minOrderAmount);
        if (!Number.isFinite(parsedMin) || parsedMin < 0) {
            throw new ApiError(400, "Minimum order amount cannot be negative");
        }
        minOrderAmount = parsedMin;
    }

    let maxDiscountAmount: number | undefined;
    if (
        data.maxDiscountAmount !== undefined &&
        data.maxDiscountAmount !== null &&
        data.maxDiscountAmount !== ""
    ) {
        const parsedMax = Number(data.maxDiscountAmount);
        if (!Number.isFinite(parsedMax) || parsedMax < 0) {
            throw new ApiError(400, "Maximum discount amount cannot be negative");
        }
        maxDiscountAmount = parsedMax;
    }

    let validFrom = new Date();
    if (data.validFrom) {
        const parsedFrom = new Date(data.validFrom as string | number);
        if (Number.isNaN(parsedFrom.getTime())) {
            throw new ApiError(400, "Invalid validFrom date");
        }
        validFrom = parsedFrom;
    }

    let validUntil: Date | undefined;
    if (data.validUntil) {
        const parsedUntil = new Date(data.validUntil as string | number);
        if (Number.isNaN(parsedUntil.getTime())) {
            throw new ApiError(400, "Invalid validUntil date");
        }
        if (parsedUntil <= validFrom) {
            throw new ApiError(400, "validUntil must be after validFrom");
        }
        validUntil = parsedUntil;
    }

    let maxUses: number | undefined;
    if (
        data.maxUses !== undefined &&
        data.maxUses !== null &&
        data.maxUses !== ""
    ) {
        const parsedUses = Number(data.maxUses);
        if (!Number.isSafeInteger(parsedUses) || parsedUses < 1) {
            throw new ApiError(400, "maxUses must be an integer of at least 1");
        }
        maxUses = parsedUses;
    }

    const description =
        typeof data.description === "string" ? data.description.trim() : undefined;

    const isActive = data.isActive !== undefined ? Boolean(data.isActive) : true;

    const coupon = await Coupon.create({
        code: normalizedCode,
        description,
        discountPercent,
        minOrderAmount,
        maxDiscountAmount,
        validFrom,
        validUntil,
        maxUses,
        isActive,
    });

    return coupon;
};

export const getAdminCoupons = async (): Promise<ICoupon[]> => {
    return Coupon.find().sort({ createdAt: -1 });
};

export const getCouponById = async (id: string): Promise<ICoupon> => {
    const coupon = await Coupon.findById(id);
    if (!coupon) {
        throw new ApiError(404, "Coupon not found");
    }
    return coupon;
};

export const updateCoupon = async (
    id: string,
    data: unknown
): Promise<ICoupon> => {
    if (!isRecord(data)) {
        throw new ApiError(400, "Invalid coupon data");
    }

    const coupon = await Coupon.findById(id);
    if (!coupon) {
        throw new ApiError(404, "Coupon not found");
    }

    if (data.code !== undefined) {
        if (typeof data.code !== "string" || data.code.trim().length === 0) {
            throw new ApiError(400, "Coupon code cannot be empty");
        }
        const normalizedCode = data.code.trim().toUpperCase();
        if (normalizedCode.length < 3 || normalizedCode.length > 30) {
            throw new ApiError(
                400,
                "Coupon code must be between 3 and 30 characters"
            );
        }

        const duplicate = await Coupon.findOne({
            code: normalizedCode,
            _id: { $ne: id },
        });
        if (duplicate) {
            throw new ApiError(409, "A coupon with this code already exists");
        }
        coupon.code = normalizedCode;
    }

    if (data.discountPercent !== undefined) {
        const discountPercent = Number(data.discountPercent);
        if (
            !Number.isFinite(discountPercent) ||
            discountPercent < 1 ||
            discountPercent > 99
        ) {
            throw new ApiError(
                400,
                "Discount percentage must be a number between 1 and 99"
            );
        }
        coupon.discountPercent = discountPercent;
    }

    if (data.description !== undefined) {
        coupon.description =
            typeof data.description === "string"
                ? data.description.trim()
                : undefined;
    }

    if (data.minOrderAmount !== undefined) {
        const parsedMin = Number(data.minOrderAmount);
        if (!Number.isFinite(parsedMin) || parsedMin < 0) {
            throw new ApiError(400, "Minimum order amount cannot be negative");
        }
        coupon.minOrderAmount = parsedMin;
    }

    if (data.maxDiscountAmount !== undefined) {
        if (data.maxDiscountAmount === null || data.maxDiscountAmount === "") {
            coupon.maxDiscountAmount = undefined;
        } else {
            const parsedMax = Number(data.maxDiscountAmount);
            if (!Number.isFinite(parsedMax) || parsedMax < 0) {
                throw new ApiError(
                    400,
                    "Maximum discount amount cannot be negative"
                );
            }
            coupon.maxDiscountAmount = parsedMax;
        }
    }

    if (data.validFrom !== undefined) {
        const parsedFrom = new Date(data.validFrom as string | number);
        if (Number.isNaN(parsedFrom.getTime())) {
            throw new ApiError(400, "Invalid validFrom date");
        }
        coupon.validFrom = parsedFrom;
    }

    if (data.validUntil !== undefined) {
        if (data.validUntil === null || data.validUntil === "") {
            coupon.validUntil = undefined;
        } else {
            const parsedUntil = new Date(data.validUntil as string | number);
            if (Number.isNaN(parsedUntil.getTime())) {
                throw new ApiError(400, "Invalid validUntil date");
            }
            if (parsedUntil <= coupon.validFrom) {
                throw new ApiError(400, "validUntil must be after validFrom");
            }
            coupon.validUntil = parsedUntil;
        }
    }

    if (data.maxUses !== undefined) {
        if (data.maxUses === null || data.maxUses === "") {
            coupon.maxUses = undefined;
        } else {
            const parsedUses = Number(data.maxUses);
            if (!Number.isSafeInteger(parsedUses) || parsedUses < 1) {
                throw new ApiError(
                    400,
                    "maxUses must be an integer of at least 1"
                );
            }
            coupon.maxUses = parsedUses;
        }
    }

    if (data.isActive !== undefined) {
        coupon.isActive = Boolean(data.isActive);
    }

    await coupon.save();
    return coupon;
};

export const deleteCoupon = async (id: string): Promise<ICoupon> => {
    const coupon = await Coupon.findById(id);
    if (!coupon) {
        throw new ApiError(404, "Coupon not found");
    }

    coupon.isActive = false;
    await coupon.save();
    return coupon;
};
