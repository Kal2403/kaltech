import { Request, Response, NextFunction } from "express";

import { createCategory, getCategories } from "../services/category.service.js"

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
