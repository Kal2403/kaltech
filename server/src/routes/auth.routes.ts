import { Router } from "express";

import { getMe, login, register } from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { createAuthRateLimiters } from "../middlewares/auth-rate-limit.middleware.js";

const router = Router();
const limits = createAuthRateLimiters();

router.post("/register", limits.registerIp, register);
router.post("/login", limits.loginIp, limits.loginAccount, login);
router.get("/me", protect, getMe);

export default router;
