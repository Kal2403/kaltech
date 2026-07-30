import { Cart } from "../models/Cart.model.js";
import {
    Order,
    type IShippingAddress,
    type OrderStatus,
    type PaymentMethod,
} from "../models/Order.model.js";
import { Product } from "../models/Product.model.js";
import { ApiError } from "../utils/ApiError.js";

interface CreateOrderInput {
    shippingAddress: IShippingAddress;
    paymentMethod: PaymentMethod;
}

const validOrderStatuses: OrderStatus[] = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
];

const isOrderStatus = (value: unknown): value is OrderStatus => {
    return (
        typeof value === "string" &&
        validOrderStatuses.includes(value as OrderStatus)
    );
};

export const createOrder = async (
    userId: string,
    data: CreateOrderInput
) => {
    const cart = await Cart.findOne({
        user: userId,
    }).populate("items.product");

    if (!cart || cart.items.length === 0) {
        throw new ApiError(400, "Cart is empty");
    }

    let subtotal = 0;

    const orderItems = [];

    for (const item of cart.items) {
        const product = item.product as any;

        if (!product?.isActive) {
            throw new ApiError(
                400,
                `${product?.name ?? "Product"} is no longer available`
            );
        }

        if (product.stock < item.quantity) {
            throw new ApiError(
                400,
                `Not enough stock for ${product.name}`
            );
        }

        const finalPrice =
            product.discountPrice ?? product.price;

        subtotal += finalPrice * item.quantity;

        orderItems.push({
            product: product._id,
            name: product.name,
            quantity: item.quantity,
            price: finalPrice,
            image: product.images?.[0],
        });

        product.stock -= item.quantity;

        await Product.findByIdAndUpdate(product._id, {
            stock: product.stock,
        });
    }

    const tax = Number((subtotal * 0.18).toFixed(2));
    const shippingCost = subtotal > 1000 ? 0 : 25;
    const total = Number(
        (subtotal + tax + shippingCost).toFixed(2)
    );

    const order = await Order.create({
        user: userId,
        items: orderItems,
        shippingAddress: data.shippingAddress,
        paymentMethod: data.paymentMethod,
        subtotal,
        tax,
        shippingCost,
        total,
    });

    cart.items = [];

    await cart.save();

    return order;
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

export const getAdminOrders = async () => {
    const orders = await Order.find()
        .populate("user", "name email")
        .sort({
            createdAt: -1,
        });

    return orders;
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

    order.orderStatus = orderStatus;

    await order.save();

    await order.populate("user", "name email");

    return order;
};
