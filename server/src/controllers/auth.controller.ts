import { Request, Response, NextFunction } from "express";

import { loginUser, registerUser } from "../services/auth.service.js";

export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await registerUser(req.body);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await loginUser(req.body);

        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const getMe = async (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "Authenticated user retrieved successfully",
        data: {
            user: req.user,
        },
    });
};