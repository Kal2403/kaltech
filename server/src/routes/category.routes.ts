import { Router } from "express";

import { createCategoryController, getCategoriesController } from "../controllers/category.controller.js";
import { authorizeRoles, protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", getCategoriesController);

router.post(
    "/",
    protect,
    authorizeRoles("admin"),
    createCategoryController
);

export default router;