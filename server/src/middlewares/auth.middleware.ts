import { NextFunction, Request, Response } from "express";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";

interface JwtPayload {
    userId: string;
    role: "customer" | "admin";
}

export const protect = async (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new ApiError(401, "Not authorized, token missing");
        }

        const token = authHeader.split(" ")[1];
        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            throw new Error("JWT_SECRET is not defined");
        }

        const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

        const user = await User.findById(decoded.userId);

        if (!user || !user.isActive) {
            throw new ApiError(401, "Not authorized, user not found");
        }

        req.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        };

        next();
    } catch (error) {
        if (error instanceof TokenExpiredError || error instanceof JsonWebTokenError) {
            return next(new ApiError(401, "Not authorized, token invalid or expired"));
        }
        next(error);
    }
};

export const authorizeRoles = (...roles: Array<"customer" | "admin">) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            throw new ApiError(403, "Forbidden, insufficient permissions");
        }

        next();
    };
};
