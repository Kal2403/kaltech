import { Cart } from "../models/Cart.model.js";
import { Order } from "../models/Order.model.js";
import { Product } from "../models/Product.model.js";
import { ApiError } from "../utils/ApiError.js";

interface CreateOrderInput {
    shippingAddress: {
        fullName: string;
        adress: string;
        city: string;
        postalCode: string;
        country: string;
        phone: string;
    };
    paymentMethod: "card" | "paypal" | "cash";
}

export const createOrder = async (
    userId: string,
    data: CreateOrderInput
) => {
    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart || cart.items.length === 0) {
        throw new ApiError(400, "Cart is empty")
    }

    let subtotal = 0;

    const orderItems = [];

    for (const item of cart.items) {
        const product = item.product as any;

        if (!product.isActive) {
            throw new ApiError(400, `${product.name} is no longer available`);
        }

        if (product.stock < item.quantity) {
            throw new ApiError(400, `Not enough stock for ${product.name}`);
        }

        const finalPrice = product.discountPrice ?? product.price;

        subtotal += finalPrice * item.quantity

        orderItems.push({
            product: product._id,
            name: product.name,
            quantity: item.quantity,
            price: product.price,
            image: product.images?.[0],
        });

        product.stock -= item.quantity;

        await Product.findByIdAndUpdate(product._id, {
            stock: product.stock,
        });
    }

    const tax = Number((subtotal * 0.18).toFixed(2));
    const shippingCost = subtotal > 1000 ? 0 : 25;
    const total = subtotal + tax + shippingCost;

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
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

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
