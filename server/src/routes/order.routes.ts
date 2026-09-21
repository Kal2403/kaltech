import { Router } from "express";

import {
    createOrderController,
    getAdminOrderByIdController,
    getAdminOrdersController,
    getMyOrdersController,
    getOrderByIdController,
    updateOrderStatusController,
} from "../controllers/order.controller.js";
import { payOrderController } from "../controllers/payment.controller.js";
import {
    authorizeRoles,
    protect,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.use(protect);

router.get(
    "/admin",
    authorizeRoles("admin"),
    getAdminOrdersController
);

router.get(
    "/admin/:id",
    authorizeRoles("admin"),
    getAdminOrderByIdController
);

router.patch(
    "/admin/:id/status",
    authorizeRoles("admin"),
    updateOrderStatusController
);

router.post("/", createOrderController);

router.post("/:id/pay", payOrderController);

router.get("/my-orders", getMyOrdersController);

router.get("/:id", getOrderByIdController);

export default router;
