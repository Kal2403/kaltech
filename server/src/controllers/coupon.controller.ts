import { Request, Response, NextFunction } from "express";

import {
    createCoupon,
    deleteCoupon,
    getAdminCoupons,
    getCouponById,
    updateCoupon,
    validateCoupon,
} from "../services/coupon.service.js";
import { ApiError } from "../utils/ApiError.js";

const getCouponIdFromRequest = (req: Request): string => {
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
        throw new ApiError(400, "Invalid coupon ID");
    }

    return id;
};

export const validateCouponController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { code, subtotal } = req.body;

        if (!code || typeof code !== "string") {
            throw new ApiError(400, "Coupon code is required");
        }

        const parsedSubtotal = Number(subtotal);
        if (!Number.isFinite(parsedSubtotal) || parsedSubtotal < 0) {
            throw new ApiError(400, "Subtotal must be a non-negative number");
        }

        const result = await validateCoupon(code, parsedSubtotal);

        res.status(200).json({
            success: true,
            message: "Coupon validated successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const getAdminCouponsController = async (
    _req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const coupons = await getAdminCoupons();

        res.status(200).json({
            success: true,
            message: "Coupons retrieved successfully",
            data: {
                coupons,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getCouponByIdController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const couponId = getCouponIdFromRequest(req);
        const coupon = await getCouponById(couponId);

        res.status(200).json({
            success: true,
            message: "Coupon retrieved successfully",
            data: {
                coupon,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const createCouponController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const coupon = await createCoupon(req.body);

        res.status(201).json({
            success: true,
            message: "Coupon created successfully",
            data: {
                coupon,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const updateCouponController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const couponId = getCouponIdFromRequest(req);
        const coupon = await updateCoupon(couponId, req.body);

        res.status(200).json({
            success: true,
            message: "Coupon updated successfully",
            data: {
                coupon,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const deleteCouponController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const couponId = getCouponIdFromRequest(req);
        const coupon = await deleteCoupon(couponId);

        res.status(200).json({
            success: true,
            message: "Coupon deactivated successfully",
            data: {
                coupon,
            },
        });
    } catch (error) {
        next(error);
    }
};
