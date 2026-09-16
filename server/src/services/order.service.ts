import mongoose from "mongoose";
import { Cart } from "../models/Cart.model.js";
import {
    Order,
    type IOrderItem,
} from "../models/Order.model.js";
import { Product } from "../models/Product.model.js";
import {
    canTransitionOrderStatus,
    isOrderStatus,
} from "../modules/orders/order-status.policy.js";
import { ApiError } from "../utils/ApiError.js";
import { parseCreateOrderInput } from "../modules/orders/order-input.js";

export const createOrder = async (
    userId: string,
    data: unknown
) => {
    const input = parseCreateOrderInput(data);
    return mongoose.connection.transaction(async (session) => {
        const cart = await Cart.findOne({
            user: userId,
        }).session(session);

        if (!cart || cart.items.length === 0) {
            throw new ApiError(400, "Cart is empty");
        }

        let subtotal = 0;

        const orderItems: IOrderItem[] = [];

        for (const item of cart.items) {
            if (!Number.isSafeInteger(item.quantity) || item.quantity <= 0) {
                throw new ApiError(400, "Invalid cart quantity");
            }
            const product = await Product.findById(item.product).session(session);

            if (!product?.isActive) {
                throw new ApiError(
                    400,
                    `${product?.name ?? "Product"} is no longer available`
                );
            }

            if (!Number.isSafeInteger(product.stock) || product.stock < item.quantity) {
                throw new ApiError(
                    400,
                    `Not enough stock for ${product.name}`
                );
            }

            const finalPrice =
                product.discountPrice ?? product.price;

            if (!Number.isFinite(finalPrice) || finalPrice < 0) {
                throw new ApiError(400, "Invalid product price");
            }

            subtotal += finalPrice * item.quantity;

            orderItems.push({
                product: product._id,
                name: product.name,
                quantity: item.quantity,
                price: finalPrice,
                image: product.images?.[0],
            });
        }

        const tax = Number((subtotal * 0.18).toFixed(2));
        const shippingCost = subtotal > 1000 ? 0 : 25;
        const total = Number(
            (subtotal + tax + shippingCost).toFixed(2)
        );

        if (![subtotal, tax, total].every(Number.isFinite)) {
            throw new ApiError(400, "Invalid order total");
        }
        const order = new Order({
            user: userId,
            items: orderItems,
            shippingAddress: input.shippingAddress,
            paymentMethod: input.paymentMethod,
            subtotal,
            tax,
            shippingCost,
            total,
        });
        await order.validate();

        // All writes share the session so any failure rolls back the entire checkout.
        for (const item of orderItems) {
            const result = await Product.updateOne(
                { _id: item.product, isActive: true, stock: { $gte: item.quantity } },
                { $inc: { stock: -item.quantity } },
                { session }
            );
            if (result.matchedCount !== 1) {
                throw new ApiError(409, "Product availability changed; please retry checkout");
            }
        }
        await order.save({ session });

        cart.items = [];

        await cart.save({ session });

        return order;
    });
};

export const getMyOrders = async (userId: string) => {
    const orders = await Order.find({
        user: userId,
    }).sort({
        createdAt: -1,
    });

    return orders;
};

export const getOrderById = async (
    userId: string,
    orderId: string
) => {
    const order = await Order.findById(orderId);

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (order.user.toString() !== userId) {
        throw new ApiError(403, "Access denied");
    }

    return order;
};

export const getAdminOrders = async (
    page: number,
    limit: number
) => {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
        Order.find()
            .populate("user", "name email")
            .sort({ createdAt: -1, _id: -1 })
            .skip(skip)
            .limit(limit),
        Order.countDocuments(),
    ]);
    const totalPages = Math.ceil(total / limit);

    return {
        orders,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1 && totalPages > 0,
        },
    };
};

export const getAdminOrderById = async (
    orderId: string
) => {
    const order = await Order.findById(orderId)
        .populate("user", "name email")
        .populate("items.product", "name slug images");

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    return order;
};

export const updateOrderStatus = async (
    orderId: string,
    orderStatus: unknown
) => {
    if (!isOrderStatus(orderStatus)) {
        throw new ApiError(
            400,
            "Invalid order status. Allowed values: pending, processing, shipped, delivered, cancelled"
        );
    }

    const order = await Order.findById(orderId);

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (!canTransitionOrderStatus(order.orderStatus, orderStatus)) {
        throw new ApiError(409, "Invalid order status transition");
    }

    if (order.orderStatus === orderStatus) {
        await order.populate("user", "name email");
        return order;
    }

    const updatedOrder = await Order.findOneAndUpdate(
        { _id: orderId, orderStatus: order.orderStatus },
        { $set: { orderStatus } },
        { new: true, runValidators: true }
    ).populate("user", "name email");

    if (!updatedOrder) {
        throw new ApiError(
            409,
            "Order status changed while the request was being processed"
        );
    }

    return updatedOrder;
};
