import { Router } from "express";

import authRoutes from "./auth.routes.js";
import categoryRoutes from "./category.routes.js"
import productRoutes from "./product.routes.js"
import cartRoutes from "./cart.routes.js"
import orderRoutes from "./order.routes.js"
import uploadRoutes from "./upload.routes.js";

const router = Router();

router.get("/health", (_req, res) => {
    res.status(200).json({
        status: "ok",
        message: "KalTech Api is running",
    });
});

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/uploads", uploadRoutes);

export default router;
