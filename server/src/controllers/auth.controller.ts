import { Request, Response, NextFunction } from "express";

import {
    loginUser,
    registerUser,
    requestPasswordReset,
    resetPassword as resetPasswordService,
} from "../services/auth.service.js";
import {
    getSocialAuthConfig,
    verifyAndLoginWithFacebook,
    verifyAndLoginWithGoogle,
} from "../services/social-auth.service.js";

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

export const googleAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const credential = req.body?.credential;
        const result = await verifyAndLoginWithGoogle(credential);

        res.status(200).json({
            success: true,
            message: "Sesión iniciada con Google exitosamente",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const facebookAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const accessToken = req.body?.accessToken;
        const result = await verifyAndLoginWithFacebook(accessToken);

        res.status(200).json({
            success: true,
            message: "Sesión iniciada con Facebook exitosamente",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const getSocialConfig = async (_req: Request, res: Response) => {
    const config = getSocialAuthConfig();
    res.status(200).json({
        success: true,
        message: "Configuración social obtenida exitosamente",
        data: config,
    });
};