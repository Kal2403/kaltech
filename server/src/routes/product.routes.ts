import { Router } from "express";

import {
    createProductController,
    deleteProductController,
    getProductByIdController,
    getProductsController,
    updateProductController,
    getAdminProductsController,
    getAdminProductByIdController,
    syncDummyProductsController,
} from "../controllers/product.controller.js";
import { authorizeRoles, protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", getProductsController);
router.get("/admin", protect, authorizeRoles("admin"), getAdminProductsController);
router.get("/admin/:id", protect, authorizeRoles("admin"), getAdminProductByIdController);
router.get("/:id", getProductByIdController);

router.post("/sync-dummy", protect, authorizeRoles("admin"), syncDummyProductsController);
router.post("/", protect, authorizeRoles("admin"), createProductController);
router.put("/:id", protect, authorizeRoles("admin"), updateProductController);
router.patch("/:id", protect, authorizeRoles("admin"), updateProductController);
router.delete("/:id", protect, authorizeRoles("admin"), deleteProductController);

export default router;
