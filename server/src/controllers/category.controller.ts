import { Request, Response, NextFunction } from "express";

import {
    createCategory,
    deleteCategory,
    getAdminCategories,
    getCategories,
    getCategoryById,
    updateCategory,
} from "../services/category.service.js";
import { ApiError } from "../utils/ApiError.js";

const getCategoryIdFromRequest = (req: Request): string => {
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
        throw new ApiError(400, "Invalid category ID");
    }

    return id;
};

export const createCategoryController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const category = await createCategory(req.body);

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: {
                category,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getCategoriesController = async (
    _req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const categories = await getCategories();

        res.status(200).json({
            success: true,
            message: "Categories retrieved successfully",
            data: {
                categories,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getAdminCategoriesController = async (
    _req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const categories = await getAdminCategories();

        res.status(200).json({
            success: true,
            message: "Admin categories retrieved successfully",
            data: {
                categories,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getCategoryByIdController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const categoryId = getCategoryIdFromRequest(req);
        const category = await getCategoryById(categoryId);

        res.status(200).json({
            success: true,
            message: "Category retrieved successfully",
            data: {
                category,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const updateCategoryController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const categoryId = getCategoryIdFromRequest(req);

        const category = await updateCategory(
            categoryId,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: {
                category,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const deleteCategoryController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const categoryId = getCategoryIdFromRequest(req);
        const category = await deleteCategory(categoryId);

        res.status(200).json({
            success: true,
            message: "Category deactivated successfully",
            data: {
                category,
            },
        });
    } catch (error) {
        next(error);
    }
};
