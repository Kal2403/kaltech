import { Router } from "express";

import authRoutes from "./auth.routes.js";

const router = Router();

router.get("/health", (_req, res) => {
    res.status(200).json({
        status: "ok",
        message: "KalTech Api is running",
    });
});

router.use("/auth", authRoutes);

export default router;