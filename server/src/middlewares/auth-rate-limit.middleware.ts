import { createHmac, randomBytes } from "node:crypto";
import { rateLimit } from "express-rate-limit";

const message = {
    success: false,
    message: "Demasiados intentos. Inténtalo de nuevo más tarde.",
};

// Each factory call owns independent stores. Production creates one set at startup.
export const createAuthRateLimiters = () => {
    const accountKeySecret = randomBytes(32);
    const common = {
        standardHeaders: "draft-8" as const,
        legacyHeaders: false,
        message,
        passOnStoreError: false,
    };

    return {
        loginIp: rateLimit({
            ...common,
            windowMs: 15 * 60 * 1000,
            limit: 30,
            identifier: "login-ip",
            requestPropertyName: "loginIpRateLimit",
        }),
        registerIp: rateLimit({
            ...common,
            windowMs: 60 * 60 * 1000,
            limit: 10,
            identifier: "register-ip",
            requestPropertyName: "registerIpRateLimit",
        }),
        loginAccount: rateLimit({
            ...common,
            windowMs: 15 * 60 * 1000,
            limit: 10,
            identifier: "login-account",
            requestPropertyName: "loginAccountRateLimit",
            skip: (req) => typeof req.body?.email !== "string" ||
                req.body.email.trim().length > 254 ||
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email.trim()),
            // Do not keep email addresses in the in-memory store or expose them in headers.
            keyGenerator: (req) => createHmac("sha256", accountKeySecret)
                .update(req.body.email.trim().toLowerCase())
                .digest("hex"),
        }),
        forgotPasswordIp: rateLimit({
            ...common,
            windowMs: 15 * 60 * 1000,
            limit: 10,
            identifier: "forgot-password-ip",
            requestPropertyName: "forgotPasswordIpRateLimit",
        }),
        forgotPasswordAccount: rateLimit({
            ...common,
            windowMs: 60 * 60 * 1000,
            limit: 5,
            identifier: "forgot-password-account",
            requestPropertyName: "forgotPasswordAccountRateLimit",
            skip: (req) => typeof req.body?.email !== "string" ||
                req.body.email.trim().length > 254 ||
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email.trim()),
            keyGenerator: (req) => createHmac("sha256", accountKeySecret)
                .update(req.body.email.trim().toLowerCase())
                .digest("hex"),
        }),
        resetPasswordIp: rateLimit({
            ...common,
            windowMs: 15 * 60 * 1000,
            limit: 10,
            identifier: "reset-password-ip",
            requestPropertyName: "resetPasswordIpRateLimit",
        }),
    };
};
