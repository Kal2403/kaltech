import { Router } from "express";

import {
    createCategoryController,
    deleteCategoryController,
    getAdminCategoriesController,
    getCategoriesController,
    getCategoryByIdController,
    updateCategoryController,
} from "../controllers/category.controller.js";
import {
    authorizeRoles,
    protect,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", getCategoriesController);

router.get(
    "/admin",
    protect,
    authorizeRoles("admin"),
    getAdminCategoriesController
);

router.post(
    "/",
    protect,
    authorizeRoles("admin"),
    createCategoryController
);

router.get(
    "/:id",
    protect,
    authorizeRoles("admin"),
    getCategoryByIdController
);

router.patch(
    "/:id",
    protect,
    authorizeRoles("admin"),
    updateCategoryController
);

router.delete(
    "/:id",
    protect,
    authorizeRoles("admin"),
    deleteCategoryController
);

export default router;
