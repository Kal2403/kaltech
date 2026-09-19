import { Request, Response, NextFunction } from "express";

import {
    createProduct,
    deleteProduct,
    getProductById,
    getProducts,
    updateProduct,
    getAdminProducts,
    getAdminProductById,
} from "../services/product.service.js";
import { ApiError } from "../utils/ApiError.js";

export const createProductController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const product = await createProduct(req.body);

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: { product },
        });
    } catch (error) {
        next(error);
    }
};

export const getProductsController = async (
    _req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const products = await getProducts();

        res.status(200).json({
            success: true,
            message: "Products retrieved successfully",
            data: { products },
        });
    } catch (error) {
        next(error);
    }
};

export const getProductByIdController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        if (!id || Array.isArray(id)) {
            throw new ApiError(400, "Invalid product ID");
        }
        const product = await getProductById(id);

        res.status(200).json({
            success: true,
            message: "Product retrieved successfully",
            data: { product },
        });
    } catch (error) {
        next(error);
    }
};

export const updateProductController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        if (!id || Array.isArray(id)) {
            throw new ApiError(400, "Invalid product ID");
        }

        const product = await updateProduct(id, req.body);

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: { product },
        });
    } catch (error) {
        next(error);
    }
};

export const deleteProductController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        if (!id || Array.isArray(id)) {
            throw new ApiError(400, "Invalid product ID");
        }

        await deleteProduct(id);

        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

export const getAdminProductsController = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const products = await getAdminProducts();
        res.status(200).json({ success: true, message: "Products retrieved successfully", data: { products } });
    } catch (error) { next(error); }
};

export const getAdminProductByIdController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        if (!id || Array.isArray(id)) throw new ApiError(400, "Invalid product ID");
        const product = await getAdminProductById(id);
        res.status(200).json({ success: true, message: "Product retrieved successfully", data: { product } });
    } catch (error) { next(error); }
};
