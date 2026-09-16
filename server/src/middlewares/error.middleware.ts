import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import multer from "multer";
import mongoose from "mongoose";

const classifyError = (error: unknown) => {
    if (error instanceof ApiError) {
        return { statusCode: error.statusCode, message: error.message, category: "operational" };
    }

    if (error instanceof multer.MulterError) {
        const isTooLarge = error.code === "LIMIT_FILE_SIZE";
        return {
            statusCode: isTooLarge ? 413 : 400,
            message: isTooLarge ? "Image must not exceed 5 MiB" : "Invalid image upload request",
            category: "upload",
        };
    }

    if (typeof error === "object" && error !== null) {
        if ("type" in error && "status" in error) {
            if (error.type === "entity.parse.failed" && error.status === 400) {
                return { statusCode: 400, message: "Invalid JSON request body", category: "invalid_json" };
            }
            if (error.type === "entity.too.large" && error.status === 413) {
                return { statusCode: 413, message: "Request body is too large", category: "body_too_large" };
            }
        }

        if (error instanceof mongoose.Error.ValidationError) {
            return { statusCode: 400, message: "Invalid request data", category: "validation" };
        }
        if (error instanceof mongoose.Error.CastError) {
            return { statusCode: 400, message: "Invalid request value", category: "cast" };
        }
        if (error instanceof mongoose.Error.VersionError) {
            return { statusCode: 409, message: "Resource changed; please reload and retry", category: "version_conflict" };
        }
        if ("code" in error && error.code === 11000) {
            return { statusCode: 409, message: "Resource already exists", category: "duplicate_key" };
        }
    }

    return { statusCode: 500, message: "Internal server error", category: "unexpected" };
};

export const errorMiddleware = (
    error: unknown,
    _req: Request,
    res: Response,
    next: NextFunction
) => {
    const { statusCode, message, category } = classifyError(error);

    // Never log the original error: parser and database errors can contain secrets.
    console.error("Request failed", { category, statusCode });

    if (res.headersSent) {
        // Avoid passing sensitive error details to Express's default logger.
        return next(new Error("Request failed after response started"));
    }

    return res.status(statusCode).json({
        success: false,
        message,
    });
};
