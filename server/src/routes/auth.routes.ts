import { Router } from "express";

import {
    forgotPassword,
    getMe,
    login,
    register,
    resetPassword,
} from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { createAuthRateLimiters } from "../middlewares/auth-rate-limit.middleware.js";

const router = Router();
const limits = createAuthRateLimiters();

router.post("/register", limits.registerIp, register);
router.post("/login", limits.loginIp, limits.loginAccount, login);
router.post(
    "/forgot-password",
    limits.forgotPasswordIp,
    limits.forgotPasswordAccount,
    forgotPassword
);
router.post("/reset-password", limits.resetPasswordIp, resetPassword);
router.get("/me", protect, getMe);

export default router;
