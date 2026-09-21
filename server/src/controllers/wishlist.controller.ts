import { Request, Response, NextFunction } from "express";
import {
    addToWishlist,
    clearWishlist,
    getUserWishlist,
    removeFromWishlist,
} from "../services/wishlist.service.js";
import { validateObjectId } from "../utils/validateObjectId.js";
import { ApiError } from "../utils/ApiError.js";

export const getWishlistController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user!.id;
        const wishlist = await getUserWishlist(userId);
        res.status(200).json({
            success: true,
            data: wishlist,
        });
    } catch (error) {
        next(error);
    }
};

export const addToWishlistController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user!.id;
        const { productId } = req.params;

        if (!productId || Array.isArray(productId)) {
            throw new ApiError(400, "Invalid product id");
        }

        const validProductId = validateObjectId(productId, "product");
        const wishlist = await addToWishlist(userId, validProductId);
        res.status(200).json({
            success: true,
            message: "Product added to wishlist",
            data: wishlist,
        });
    } catch (error) {
        next(error);
    }
};

export const removeFromWishlistController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user!.id;
        const { productId } = req.params;

        if (!productId || Array.isArray(productId)) {
            throw new ApiError(400, "Invalid product id");
        }

        const validProductId = validateObjectId(productId, "product");
        const wishlist = await removeFromWishlist(userId, validProductId);
        res.status(200).json({
            success: true,
            message: "Product removed from wishlist",
            data: wishlist,
        });
    } catch (error) {
        next(error);
    }
};

export const clearWishlistController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user!.id;
        const wishlist = await clearWishlist(userId);
        res.status(200).json({
            success: true,
            message: "Wishlist cleared",
            data: wishlist,
        });
    } catch (error) {
        next(error);
    }
};
