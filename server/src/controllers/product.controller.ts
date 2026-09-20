import { Request, Response, NextFunction } from "express";

import {
    createProduct,
    deleteProduct,
    getProductById,
    getProducts,
    updateProduct,
    getAdminProducts,
    getAdminProductById,
    type ProductFilterQuery,
} from "../services/product.service.js";
import { syncDummyTechProducts } from "../services/dummy-product.service.js";
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
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const {
            category,
            brand,
            minPrice,
            maxPrice,
            minRating,
            inStock,
            search,
            sort,
        } = req.query;

        const filterOptions: ProductFilterQuery = {
            ...(typeof category === "string" ? { category } : {}),
            ...(typeof brand === "string" ? { brand } : {}),
            ...(minPrice !== undefined && !isNaN(Number(minPrice))
                ? { minPrice: Number(minPrice) }
                : {}),
            ...(maxPrice !== undefined && !isNaN(Number(maxPrice))
                ? { maxPrice: Number(maxPrice) }
                : {}),
            ...(minRating !== undefined && !isNaN(Number(minRating))
                ? { minRating: Number(minRating) }
                : {}),
            ...(inStock === "true" || inStock === "1"
                ? { inStock: true }
                : inStock === "false" || inStock === "0"
                ? { inStock: false }
                : {}),
            ...(typeof search === "string" ? { search } : {}),
            ...(typeof sort === "string" ? { sort } : {}),
        };

        const products = await getProducts(filterOptions);

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

export const syncDummyProductsController = async (
    _req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await syncDummyTechProducts();

        res.status(200).json({
            success: true,
            message: "Products synchronized successfully from DummyJSON",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};
