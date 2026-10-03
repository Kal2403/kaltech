import { Router } from "express";

import {
    getPaymentConfigController,
    handlePaymentWebhookController,
    processPaymentController,
} from "../controllers/payment.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/config", getPaymentConfigController);
router.post("/webhook", handlePaymentWebhookController);
router.post("/webhook/:provider", handlePaymentWebhookController);
router.post("/process", protect, processPaymentController);

export default router;
