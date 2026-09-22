import {
    type Request,
    type Response,
    type NextFunction,
} from "express";

import {
    payOrder,
    processCardPayment,
    processPayPalPayment,
} from "../services/payment.service.js";
import { ApiError } from "../utils/ApiError.js";
import { validateObjectId } from "../utils/validateObjectId.js";

export const payOrderController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        if (!id || Array.isArray(id)) {
            throw new ApiError(400, "Invalid order ID");
        }

        const validOrderId = validateObjectId(id, "order");
        const order = await payOrder(
            req.user!.id,
            validOrderId,
            req.body,
            req.user?.role
        );

        res.status(200).json({
            success: true,
            message: "Payment processed successfully",
            data: {
                order,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const processPaymentController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { method, card, paypal, amount } = req.body;

        if (!method || !["card", "paypal"].includes(method)) {
            throw new ApiError(400, "Method must be 'card' or 'paypal'");
        }

        const numAmount = Number(amount);
        if (!Number.isFinite(numAmount) || numAmount <= 0) {
            throw new ApiError(400, "Invalid payment amount");
        }

        let result;
        if (method === "card") {
            if (!card) {
                throw new ApiError(400, "Card details are required");
            }
            result = await processCardPayment(card, numAmount);
        } else {
            result = await processPayPalPayment(paypal, numAmount);
        }

        res.status(200).json({
            success: true,
            message: "Payment processed successfully",
            data: {
                paymentResult: result,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getPaymentConfigController = async (
    _req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        res.status(200).json({
            success: true,
            data: {
                supportedMethods: ["card", "paypal", "cash"],
                currency: "EUR",
                testCards: [
                    {
                        brand: "Visa",
                        number: "4532 •••• •••• 0000",
                        note: "Cualquier fecha futura y CVV de 3 dígitos",
                    },
                    {
                        brand: "Mastercard",
                        number: "5555 •••• •••• 4444",
                        note: "Cualquier fecha futura y CVV de 3 dígitos",
                    },
                ],
            },
        });
    } catch (error) {
        next(error);
    }
};
