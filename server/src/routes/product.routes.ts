import { Router } from "express";

import { createProductController, deleteProductController, getProductByIdController, getProductsController, updateProductController } from "../controllers/product.controller.js";
import { authorizeRoles, protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", getProductsController);
router.get("/:id", getProductByIdController);

router.post("/", protect, authorizeRoles("admin"), createProductController);
router.put("/:id", protect, authorizeRoles("admin"), updateProductController);
router.delete("/:id", protect, authorizeRoles("admin"), deleteProductController);

export default router;