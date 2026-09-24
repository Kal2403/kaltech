import { Router } from "express";

import {
    createCouponController,
    deleteCouponController,
    getAdminCouponsController,
    getCouponByIdController,
    updateCouponController,
    validateCouponController,
} from "../controllers/coupon.controller.js";
import {
    authorizeRoles,
    protect,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/validate", validateCouponController);

router.get(
    "/admin",
    protect,
    authorizeRoles("admin"),
    getAdminCouponsController
);

router.post(
    "/",
    protect,
    authorizeRoles("admin"),
    createCouponController
);

router.get(
    "/:id",
    protect,
    authorizeRoles("admin"),
    getCouponByIdController
);

router.patch(
    "/:id",
    protect,
    authorizeRoles("admin"),
    updateCouponController
);

router.delete(
    "/:id",
    protect,
    authorizeRoles("admin"),
    deleteCouponController
);

export default router;
