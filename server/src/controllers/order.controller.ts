import {
    type Request,
    type Response,
    type NextFunction,
} from "express";

import {
    createOrder,
    getAdminOrderById,
    getAdminOrders,
    getMyOrders,
    getOrderById,
    updateOrderStatus,
} from "../services/order.service.js";
import { ApiError } from "../utils/ApiError.js";

const getOrderIdFromRequest = (req: Request): string => {
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
        throw new ApiError(400, "Invalid order ID");
    }

    return id;
};

export const createOrderController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const order = await createOrder(
            req.user!.id,
            req.body
        );

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: {
                order,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getMyOrdersController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const orders = await getMyOrders(req.user!.id);

        res.status(200).json({
            success: true,
            message: "Orders retrieved successfully",
            data: {
                orders,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getOrderByIdController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const orderId = getOrderIdFromRequest(req);

        const order = await getOrderById(
            req.user!.id,
            orderId
        );

        res.status(200).json({
            success: true,
            message: "Order retrieved successfully",
            data: {
                order,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getAdminOrdersController = async (
    _req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const orders = await getAdminOrders();

        res.status(200).json({
            success: true,
            message: "Admin orders retrieved successfully",
            data: {
                orders,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getAdminOrderByIdController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const orderId = getOrderIdFromRequest(req);
        const order = await getAdminOrderById(orderId);

        res.status(200).json({
            success: true,
            message: "Admin order retrieved successfully",
            data: {
                order,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const updateOrderStatusController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const orderId = getOrderIdFromRequest(req);

        const order = await updateOrderStatus(
            orderId,
            req.body.orderStatus
        );

        res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            data: {
                order,
            },
        });
    } catch (error) {
        next(error);
    }
};
