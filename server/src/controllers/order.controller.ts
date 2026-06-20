import { Request, Response, NextFunction } from "express";

import {
    createOrder,
    getMyOrders,
    getOrderById,
} from "../services/order.service.js";

export const createOrderController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const order = await createOrder(req.user!.id, req.body);

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: { order },
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
            data: { orders },
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
        const { id } = req.params;

        if (!id || Array.isArray(id)) {
            throw new Error("Invalid order id");
        }

        const order = await getOrderById(req.user!.id, id);

        res.status(200).json({
            success: true,
            message: "Order retrieved successfully",
            data: { order },
        });
    } catch (error) {
        next(error);
    }
};