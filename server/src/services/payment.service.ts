import { createHmac } from "node:crypto";
import {
    Order,
    type IOrder,
    type IPaymentResult,
} from "../models/Order.model.js";
import { ApiError } from "../utils/ApiError.js";
import { validateObjectId } from "../utils/validateObjectId.js";
import { sendPaymentConfirmedEmail } from "./email.service.js";

export interface CardPaymentInput {
    cardNumber: string;
    cardHolder: string;
    expiryMonth: number | string;
    expiryYear: number | string;
    cvv: string;
    email?: string;
}

export interface PayPalPaymentInput {
    orderId?: string;
    payerEmail?: string;
}

export interface ProcessPaymentInput {
    method: "card" | "paypal" | "cash";
    card?: CardPaymentInput;
    paypal?: PayPalPaymentInput;
    idempotencyKey?: string;
}

export const isValidLuhn = (cardNumber: string): boolean => {
    const cleaned = cardNumber.replace(/\D/g, "");
    if (cleaned.length < 13 || cleaned.length > 19) return false;

    let sum = 0;
    let shouldDouble = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
        let digit = parseInt(cleaned.charAt(i), 10);
        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
};

export const isCardExpired = (
    month: number | string,
    year: number | string
): boolean => {
    const m = typeof month === "string" ? parseInt(month, 10) : month;
    const y = typeof year === "string" ? parseInt(year, 10) : year;

    if (!Number.isInteger(m) || m < 1 || m > 12) return true;
    if (!Number.isInteger(y) || y < 0) return true;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const fullYear = y < 100 ? 2000 + y : y;

    if (fullYear < currentYear) return true;
    if (fullYear === currentYear && m < currentMonth) return true;

    return false;
};

export const isValidCvv = (cvv: string): boolean => {
    return /^\d{3,4}$/.test(cvv.trim());
};

export const detectCardBrand = (cardNumber: string): string => {
    const cleaned = cardNumber.replace(/\D/g, "");
    if (/^4/.test(cleaned)) return "visa";
    if (/^(5[1-5]|2[2-7])/.test(cleaned)) return "mastercard";
    if (/^3[47]/.test(cleaned)) return "amex";
    if (/^6(011|5)/.test(cleaned)) return "discover";
    return "unknown";
};

export const validateCardData = (card: CardPaymentInput): void => {
    if (!card.cardHolder || card.cardHolder.trim().length < 2) {
        throw new ApiError(400, "Cardholder name must be at least 2 characters");
    }

    const cleanedNumber = card.cardNumber ? card.cardNumber.replace(/\D/g, "") : "";
    if (!cleanedNumber || !isValidLuhn(cleanedNumber)) {
        throw new ApiError(400, "Invalid card number");
    }

    if (isCardExpired(card.expiryMonth, card.expiryYear)) {
        throw new ApiError(400, "Card is expired or expiration date is invalid");
    }

    if (!card.cvv || !isValidCvv(card.cvv)) {
        throw new ApiError(400, "Invalid CVV security code");
    }
};

export const processCardPayment = async (
    card: CardPaymentInput,
    amount: number
): Promise<IPaymentResult> => {
    validateCardData(card);

    if (!Number.isFinite(amount) || amount <= 0) {
        throw new ApiError(400, "Invalid payment amount");
    }

    const brand = detectCardBrand(card.cardNumber);
    const last4 = card.cardNumber.replace(/\D/g, "").slice(-4);
    const transactionId = `PAY-CARD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    return {
        id: transactionId,
        status: "COMPLETED",
        update_time: new Date().toISOString(),
        email_address: card.email?.trim() || undefined,
        method: `card_${brand}_${last4}`,
    };
};

export const processPayPalPayment = async (
    paypal: PayPalPaymentInput | undefined,
    amount: number
): Promise<IPaymentResult> => {
    if (!Number.isFinite(amount) || amount <= 0) {
        throw new ApiError(400, "Invalid payment amount");
    }

    const transactionId = paypal?.orderId || `PAY-PP-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    return {
        id: transactionId,
        status: "COMPLETED",
        update_time: new Date().toISOString(),
        email_address: paypal?.payerEmail?.trim() || undefined,
        method: "paypal",
    };
};

export const payOrder = async (
    userId: string,
    orderId: string,
    paymentInput: ProcessPaymentInput,
    userRole?: string
): Promise<IOrder> => {
    const validOrderId = validateObjectId(orderId, "order");
    const order = await Order.findById(validOrderId);

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (userRole !== "admin" && order.user.toString() !== userId) {
        throw new ApiError(403, "Access denied");
    }

    if (order.paymentStatus === "paid") {
        if (
            paymentInput.idempotencyKey &&
            order.paymentResult?.id === paymentInput.idempotencyKey
        ) {
            return order;
        }
        throw new ApiError(400, "Order is already paid");
    }

    if (order.orderStatus === "cancelled") {
        throw new ApiError(400, "Cannot pay for a cancelled order");
    }

    let paymentResult: IPaymentResult;

    if (paymentInput.method === "card") {
        if (!paymentInput.card) {
            throw new ApiError(400, "Card details are required for card payment");
        }
        paymentResult = await processCardPayment(paymentInput.card, order.total);
    } else if (paymentInput.method === "paypal") {
        paymentResult = await processPayPalPayment(paymentInput.paypal, order.total);
    } else if (paymentInput.method === "cash") {
        paymentResult = {
            id: `PAY-CASH-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            status: "COMPLETED",
            update_time: new Date().toISOString(),
            method: "cash",
        };
    } else {
        throw new ApiError(400, "Invalid payment method. Allowed: card, paypal, cash");
    }

    if (paymentInput.idempotencyKey) {
        paymentResult.id = paymentInput.idempotencyKey;
    }

    const nextOrderStatus = order.orderStatus === "pending" ? "processing" : order.orderStatus;
    const timelineEvent = {
        status: nextOrderStatus,
        title: "Pago verificado",
        description: `Pago registrado exitosamente vía ${paymentInput.method.toUpperCase()}. Identificador: ${paymentResult.id}`,
        timestamp: new Date(),
    };

    const updatedOrder = await Order.findOneAndUpdate(
        {
            _id: validOrderId,
            paymentStatus: { $ne: "paid" },
            orderStatus: { $ne: "cancelled" },
        },
        {
            $set: {
                paymentMethod: paymentInput.method,
                paymentStatus: "paid",
                paidAt: new Date(),
                paymentResult,
                ...(order.orderStatus === "pending" ? { orderStatus: "processing" } : {}),
            },
            $push: {
                timeline: timelineEvent,
            },
        },
        { new: true }
    );

    if (!updatedOrder) {
        const freshOrder = await Order.findById(validOrderId);
        if (freshOrder?.paymentStatus === "paid") {
            if (
                paymentInput.idempotencyKey &&
                freshOrder.paymentResult?.id === paymentInput.idempotencyKey
            ) {
                return freshOrder;
            }
            throw new ApiError(400, "Order is already paid");
        }
        throw new ApiError(400, "Cannot pay for a cancelled order");
    }

    void sendPaymentConfirmedEmail(updatedOrder).catch((err) => {
        console.error("[Email Error] No se pudo enviar el correo de confirmación de pago:", err);
    });

    return updatedOrder;
};

export interface WebhookProcessingResult {
    received: boolean;
    orderId?: string;
    status: "processed" | "ignored" | "duplicate";
    message: string;
}

export const processWebhookEvent = async (
    provider: "stripe" | "paypal",
    payload: Record<string, unknown>,
    signatureHeader?: string
): Promise<WebhookProcessingResult> => {
    if (provider !== "stripe" && provider !== "paypal") {
        throw new ApiError(400, "Invalid webhook provider");
    }

    if (provider === "stripe") {
        const stripeSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (stripeSecret) {
            if (!signatureHeader) {
                throw new ApiError(400, "Missing Stripe signature header");
            }
            const elements = signatureHeader.split(",");
            const timestamp = elements.find((el) => el.startsWith("t="))?.replace("t=", "");
            const v1Sig = elements.find((el) => el.startsWith("v1="))?.replace("v1=", "");
            if (!timestamp || !v1Sig) {
                throw new ApiError(400, "Invalid Stripe signature format");
            }
            const expectedSig = createHmac("sha256", stripeSecret)
                .update(`${timestamp}.${JSON.stringify(payload)}`)
                .digest("hex");
            if (expectedSig !== v1Sig) {
                throw new ApiError(400, "Stripe signature verification failed");
            }
        }

        const eventType = String(payload.type || "");
        if (
            eventType !== "checkout.session.completed" &&
            eventType !== "payment_intent.succeeded"
        ) {
            return {
                received: true,
                status: "ignored",
                message: `Stripe event ${eventType} ignored`,
            };
        }

        const dataObject = (payload.data as { object?: Record<string, unknown> })?.object || {};
        const metadata = (dataObject.metadata as Record<string, unknown>) || {};
        const rawOrderId =
            metadata.orderId ||
            dataObject.client_reference_id ||
            metadata.order_id;

        if (!rawOrderId || typeof rawOrderId !== "string") {
            return {
                received: true,
                status: "ignored",
                message: "No order ID found in Stripe event metadata",
            };
        }

        const validOrderId = validateObjectId(rawOrderId, "order");
        const order = await Order.findById(validOrderId);
        if (!order) {
            throw new ApiError(404, "Order not found for Stripe webhook");
        }

        if (order.paymentStatus === "paid") {
            return {
                received: true,
                orderId: validOrderId,
                status: "duplicate",
                message: "Order already paid",
            };
        }

        const transactionId = String(dataObject.id || `STRIPE-${Date.now()}`);
        order.paymentMethod = "card";
        order.paymentStatus = "paid";
        order.paidAt = new Date();
        order.paymentResult = {
            id: transactionId,
            status: "COMPLETED",
            update_time: new Date().toISOString(),
            method: "stripe",
        };

        if (order.orderStatus === "pending") {
            order.orderStatus = "processing";
        }

        order.timeline = order.timeline || [];
        order.timeline.push({
            status: order.orderStatus,
            title: "Pago verificado vía Stripe",
            description: `Pago procesado automáticamente mediante webhook de Stripe. Identificador: ${transactionId}`,
            timestamp: new Date(),
        });

        await order.save();

        void sendPaymentConfirmedEmail(order).catch((err) => {
            console.error("[Email Error] Falló confirmación de correo tras webhook de Stripe:", err);
        });

        return {
            received: true,
            orderId: validOrderId,
            status: "processed",
            message: "Stripe payment processed successfully",
        };
    }

    if (provider === "paypal") {
        const paypalWebhookId = process.env.PAYPAL_WEBHOOK_ID;
        if (paypalWebhookId && !signatureHeader) {
            throw new ApiError(400, "Missing PayPal signature header");
        }

        const eventType = String(payload.event_type || "");
        if (
            eventType !== "PAYMENT.CAPTURE.COMPLETED" &&
            eventType !== "CHECKOUT.ORDER.APPROVED"
        ) {
            return {
                received: true,
                status: "ignored",
                message: `PayPal event ${eventType} ignored`,
            };
        }

        const resource = (payload.resource as Record<string, unknown>) || {};
        const rawOrderId =
            resource.custom_id ||
            resource.invoice_id ||
            (resource.supplementary_data as { related_ids?: { order_id?: string } })
                ?.related_ids?.order_id;

        if (!rawOrderId || typeof rawOrderId !== "string") {
            return {
                received: true,
                status: "ignored",
                message: "No order ID found in PayPal webhook resource",
            };
        }

        const validOrderId = validateObjectId(rawOrderId, "order");
        const order = await Order.findById(validOrderId);
        if (!order) {
            throw new ApiError(404, "Order not found for PayPal webhook");
        }

        if (order.paymentStatus === "paid") {
            return {
                received: true,
                orderId: validOrderId,
                status: "duplicate",
                message: "Order already paid",
            };
        }

        const transactionId = String(resource.id || `PAYPAL-${Date.now()}`);
        order.paymentMethod = "paypal";
        order.paymentStatus = "paid";
        order.paidAt = new Date();
        order.paymentResult = {
            id: transactionId,
            status: "COMPLETED",
            update_time: new Date().toISOString(),
            method: "paypal",
        };

        if (order.orderStatus === "pending") {
            order.orderStatus = "processing";
        }

        order.timeline = order.timeline || [];
        order.timeline.push({
            status: order.orderStatus,
            title: "Pago verificado vía PayPal",
            description: `Pago procesado automáticamente mediante webhook de PayPal. Identificador: ${transactionId}`,
            timestamp: new Date(),
        });

        await order.save();

        void sendPaymentConfirmedEmail(order).catch((err) => {
            console.error("[Email Error] Falló confirmación de correo tras webhook de PayPal:", err);
        });

        return {
            received: true,
            orderId: validOrderId,
            status: "processed",
            message: "PayPal payment processed successfully",
        };
    }

    throw new ApiError(400, "Unsupported provider");
};
