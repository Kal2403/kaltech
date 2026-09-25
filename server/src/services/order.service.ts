import mongoose from "mongoose";
import { Cart } from "../models/Cart.model.js";
import { Coupon } from "../models/Coupon.model.js";
import {
    Order,
    type IOrderItem,
    type IOrderTimelineEvent,
    type OrderStatus,
} from "../models/Order.model.js";
import { Product } from "../models/Product.model.js";
import {
    canTransitionOrderStatus,
    isOrderStatus,
} from "../modules/orders/order-status.policy.js";
import { ApiError } from "../utils/ApiError.js";
import { parseCreateOrderInput } from "../modules/orders/order-input.js";
import {
    sendOrderCreatedEmail,
    sendOrderStatusUpdatedEmail,
} from "./email.service.js";

export const createOrder = async (
    userId: string,
    data: unknown
) => {
    const input = parseCreateOrderInput(data);
    const createdOrder = await mongoose.connection.transaction(async (session) => {
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

        let discountAmount = 0;
        let appliedCoupon:
            | {
                  code: string;
                  discountPercent: number;
                  discountAmount: number;
              }
            | undefined;

        if (input.couponCode) {
            const coupon = await Coupon.findOne({
                code: input.couponCode,
            }).session(session);

            if (!coupon) {
                throw new ApiError(404, "Coupon not found");
            }

            if (!coupon.isActive) {
                throw new ApiError(400, "Coupon is inactive");
            }

            const now = new Date();
            if (coupon.validFrom && now < coupon.validFrom) {
                throw new ApiError(400, "Coupon is not yet active");
            }

            if (coupon.validUntil && now > coupon.validUntil) {
                throw new ApiError(400, "Coupon has expired");
            }

            if (
                coupon.maxUses !== undefined &&
                coupon.maxUses !== null &&
                coupon.usedCount >= coupon.maxUses
            ) {
                throw new ApiError(400, "Coupon usage limit reached");
            }

            if (coupon.minOrderAmount > 0 && subtotal < coupon.minOrderAmount) {
                throw new ApiError(
                    400,
                    `Minimum order amount of $${coupon.minOrderAmount} required`
                );
            }

            let rawDiscount = (subtotal * coupon.discountPercent) / 100;
            if (
                coupon.maxDiscountAmount !== undefined &&
                coupon.maxDiscountAmount !== null &&
                rawDiscount > coupon.maxDiscountAmount
            ) {
                rawDiscount = coupon.maxDiscountAmount;
            }

            discountAmount = Number(
                Math.min(subtotal, Math.max(0, rawDiscount)).toFixed(2)
            );

            appliedCoupon = {
                code: coupon.code,
                discountPercent: coupon.discountPercent,
                discountAmount,
            };

            const couponUpdate = await Coupon.updateOne(
                {
                    _id: coupon._id,
                    isActive: true,
                    ...(coupon.maxUses !== undefined && coupon.maxUses !== null
                        ? { usedCount: { $lt: coupon.maxUses } }
                        : {}),
                },
                { $inc: { usedCount: 1 } },
                { session }
            );

            if (couponUpdate.matchedCount !== 1) {
                throw new ApiError(
                    400,
                    "Coupon is no longer available or limit reached"
                );
            }
        }

        const tax = Number((subtotal * 0.18).toFixed(2));
        const shippingCost = subtotal > 1000 ? 0 : 25;
        const total = Number(
            Math.max(0, subtotal - discountAmount + tax + shippingCost).toFixed(2)
        );

        if (![subtotal, discountAmount, tax, total].every(Number.isFinite)) {
            throw new ApiError(400, "Invalid order total");
        }
        const order = new Order({
            user: userId,
            items: orderItems,
            shippingAddress: input.shippingAddress,
            paymentMethod: input.paymentMethod,
            subtotal,
            discountAmount,
            coupon: appliedCoupon,
            tax,
            shippingCost,
            total,
            timeline: [
                {
                    status: "pending",
                    title: "Pedido recibido",
                    description: "El pedido ha sido registrado exitosamente en el sistema",
                    timestamp: new Date(),
                },
            ],
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

    void sendOrderCreatedEmail(userId, createdOrder).catch((err) => {
        console.error("[Email Error] No se pudo enviar el correo de confirmación de orden:", err);
    });

    return createdOrder;
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

export interface UpdateOrderStatusOptions {
    trackingNumber?: string;
    carrier?: string;
    estimatedDelivery?: Date | string;
    note?: string;
}

const getTimelineDetailsForStatus = (
    status: OrderStatus,
    options?: UpdateOrderStatusOptions
): { title: string; description: string } => {
    if (options?.note?.trim()) {
        const titleMap: Record<OrderStatus, string> = {
            pending: "En espera",
            processing: "En preparación",
            shipped: "En camino",
            delivered: "Entregado",
            cancelled: "Cancelado",
        };
        return {
            title: titleMap[status] ?? "Estado actualizado",
            description: options.note.trim(),
        };
    }

    switch (status) {
        case "processing":
            return {
                title: "En preparación",
                description: "El pedido está siendo preparado y empaquetado",
            };
        case "shipped": {
            const carrier = options?.carrier?.trim();
            const tracking = options?.trackingNumber?.trim();
            const desc = carrier && tracking
                ? `Pedido enviado con ${carrier}. Número de seguimiento: ${tracking}`
                : "El pedido ha sido enviado y se encuentra en camino";
            return {
                title: "En camino",
                description: desc,
            };
        }
        case "delivered":
            return {
                title: "Entregado",
                description: "El pedido ha sido entregado en la dirección de destino",
            };
        case "cancelled":
            return {
                title: "Cancelado",
                description: "El pedido ha sido cancelado",
            };
        case "pending":
        default:
            return {
                title: "En espera",
                description: "El pedido se encuentra en espera de procesamiento",
            };
    }
};

export const updateOrderStatus = async (
    orderId: string,
    orderStatus: unknown,
    options?: UpdateOrderStatusOptions
) => {
    if (!isOrderStatus(orderStatus)) {
        throw new ApiError(
            400,
            "Invalid order status. Allowed values: pending, processing, shipped, delivered, cancelled"
        );
    }

    const updated = await mongoose.connection.transaction(async (session) => {
        const order = await Order.findById(orderId).session(session);

        if (!order) {
            throw new ApiError(404, "Order not found");
        }

        if (!canTransitionOrderStatus(order.orderStatus, orderStatus)) {
            throw new ApiError(409, "Invalid order status transition");
        }

        // A retry of a committed cancellation must never restore stock twice.
        if (order.orderStatus === orderStatus) {
            await order.populate({ path: "user", select: "name email", options: { session } });
            return order;
        }

        if (orderStatus === "cancelled" && (
            order.items.length === 0 ||
            order.items.some((item) => !Number.isSafeInteger(item.quantity) || item.quantity <= 0)
        )) {
            throw new ApiError(409, "Order quantities must be corrected before cancellation");
        }

        const trackingNumber =
            typeof options?.trackingNumber === "string" && options.trackingNumber.trim().length > 0
                ? options.trackingNumber.trim()
                : undefined;
        const carrier =
            typeof options?.carrier === "string" && options.carrier.trim().length > 0
                ? options.carrier.trim()
                : undefined;

        let parsedEstimatedDelivery: Date | undefined;
        if (options?.estimatedDelivery) {
            const date = new Date(options.estimatedDelivery);
            if (!isNaN(date.getTime())) {
                parsedEstimatedDelivery = date;
            }
        }

        const { title, description } = getTimelineDetailsForStatus(orderStatus, options);

        const newTimelineEvent: IOrderTimelineEvent = {
            status: orderStatus,
            title,
            description,
            location: carrier,
            timestamp: new Date(),
        };

        const updateSet: Record<string, unknown> = {
            orderStatus,
        };

        if (trackingNumber !== undefined) {
            updateSet.trackingNumber = trackingNumber;
        }
        if (carrier !== undefined) {
            updateSet.carrier = carrier;
        }
        if (parsedEstimatedDelivery !== undefined) {
            updateSet.estimatedDelivery = parsedEstimatedDelivery;
        }

        const updatedOrder = await Order.findOneAndUpdate(
            { _id: orderId, orderStatus: order.orderStatus },
            {
                $set: updateSet,
                $push: { timeline: newTimelineEvent },
            },
            { returnDocument: "after", runValidators: true, session }
        );

        if (!updatedOrder) {
            throw new ApiError(409, "Order status changed while the request was being processed");
        }

        if (orderStatus === "cancelled") {
            for (const item of order.items) {
                const product = await Product.findById(item.product).session(session);
                if (!product || !Number.isSafeInteger(product.stock) || product.stock < 0 ||
                    product.stock > Number.MAX_SAFE_INTEGER - item.quantity) {
                    throw new ApiError(409, "Product inventory must be corrected before cancellation");
                }

                // Inactive products still own inventory; restoring it does not reactivate them.
                const result = await Product.updateOne(
                    { _id: product._id, stock: product.stock },
                    { $inc: { stock: item.quantity } },
                    { session }
                );
                if (result.matchedCount !== 1) {
                    throw new ApiError(409, "Product inventory changed during cancellation");
                }
            }
        }

        await updatedOrder.populate({ path: "user", select: "name email", options: { session } });
        return updatedOrder;
    });

    void sendOrderStatusUpdatedEmail(updated, orderStatus).catch((err) => {
        console.error("[Email Error] No se pudo enviar el correo de actualización de estado:", err);
    });

    return updated;
};
