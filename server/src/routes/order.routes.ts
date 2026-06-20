import { Router } from "express";

import {
    createOrderController,
    getMyOrdersController,
    getOrderByIdController,
} from "../controllers/order.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(protect);

router.post("/", createOrderController);
router.get("/my-orders", getMyOrdersController);
router.get("/:id", getOrderByIdController);

export default router;
