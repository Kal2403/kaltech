import { NextFunction, Request, Response } from "express";

import {
    parseImageContext,
    uploadImage,
} from "../services/upload.service.js";
import { ApiError } from "../utils/ApiError.js";

export const uploadImageController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.file) {
            throw new ApiError(400, "Image file is required");
        }

        const context = parseImageContext(req.body.context);
        const image = await uploadImage(req.file, context);

        res.status(201).json({
            success: true,
            message: "Image uploaded successfully",
            data: image,
        });
    } catch (error) {
        next(error);
    }
};
