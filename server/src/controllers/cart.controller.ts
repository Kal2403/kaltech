import { Request, Response, NextFunction } from "express";

import {
    addItemToCart,
    clearUserCart,
    getUserCart,
    removeCartItem,
    updateCartItem,
} from "../services/cart.service.js";
import { validateObjectId } from "../utils/validateObjectId.js";


export const getCartController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const cart = await getUserCart(req.user!.id);

        res.status(200).json({
            success: true,
            message: "Cart retrieved successfully",
            data: { cart },
        });
    } catch (error) {
        next(error);
    }
};

export const addItemToCartController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const cart = await addItemToCart(
            req.user!.id,
            req.body.productId,
            req.body.quantity
        );

        res.status(200).json({
            success: true,
            message: "Item added to cart successfully",
            data: { cart },
        });
    } catch (error) {
        next(error);
    }
};

export const updateCartItemController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { productId } = req.params;

        if (!productId || Array.isArray(productId)) {
            throw new Error("Invalid product id");
        }

        const validProductId = validateObjectId(productId, "product");
        const cart = await updateCartItem(req.user!.id, validProductId, req.body.quantity);

        res.status(200).json({
            success: true,
            message: "Cart item updated successfully",
            data: { cart },
        });
    } catch (error) {
        next(error);
    }
};

export const removeCartItemController = async(
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { productId } = req.params;

        if (!productId || Array.isArray(productId)) {
            throw new Error("Invalid product id");
        }

        const validProductId = validateObjectId(productId, "product");
        const cart = await removeCartItem(req.user!.id, validProductId);

        res.status(200).json({
            success: true,
            message: "Cart item removed successfully",
            data: { cart },
        });
    } catch (error) {
        next(error);
    }
};

export const clearCartController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const cart = await clearUserCart(req.user!.id);

        res.status(200).json({
            success: true,
            message: "Cart cleared successfully",
            data: { cart },
        });
    } catch (error) {
        next(error);
    }
};
