import { Request, Response, NextFunction } from "express";

import {
    createProduct,
    deleteProduct,
    getProductById,
    getProducts,
    updateProduct,
} from "../services/product.service.js"
import { rmSync } from "node:fs";

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
            suscces: true,
            message: "Products retrieved successfully",
            data: { products },
        });
    } catch (error) {
        next(error);
    }
}

export const getProductByIdController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        if (!id || Array.isArray(id)) {
            throw new Error("Ivalid product id");
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
            throw new Error("Invalid product id");
        }

        const product = await updateProduct(id, req.body);

        res.status(200).json({
            success: true,
            message: "Product update successfully",
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
            throw new Error("Invalid product id");
        }

        await deleteProduct(id);

        res.status(200).json({
            success: true,
            message: "Product deleted succcesfully",
        });
    } catch (error) {
        next(error);
    }
};
