import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import multer from "multer";

export const errorMiddleware = (
    error: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {

    console.error("GLOBAL ERROR:", error);

    if (error instanceof ApiError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
        });
    }

    if (error instanceof multer.MulterError) {
        const isTooLarge = error.code === "LIMIT_FILE_SIZE";

        return res.status(isTooLarge ? 413 : 400).json({
            success: false,
            message: isTooLarge
                ? "Image must not exceed 5 MiB"
                : "Invalid image upload request",
        });
    }

    return res.status(500).json({
        success: false,
        message: "Internal server error",
    });
};
