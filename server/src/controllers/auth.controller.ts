import { Request, Response, NextFunction } from "express";

import {
    loginUser,
    registerUser,
    requestPasswordReset,
    resetPassword as resetPasswordService,
} from "../services/auth.service.js";

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

export const forgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await requestPasswordReset(req.body);

        res.status(200).json({
            success: true,
            message: result.message,
            data: null,
        });
    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await resetPasswordService(req.body);

        res.status(200).json({
            success: true,
            message: result.message,
            data: null,
        });
    } catch (error) {
        next(error);
    }
};