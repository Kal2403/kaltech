import { Cart } from "../models/Cart.model.js";
import { Product } from "../models/Product.model.js";
import { ApiError } from "../utils/ApiError.js";

export const getUserCart = async (userId: string) => {
    let cart = await Cart.findOne({ user: userId }).populate(
        "items.product",
        "name slug price discountPrice images stock brand"
    );

    if (!cart) {
        cart = await Cart.create({
            user: userId,
            items: [],
        });
    }

    return cart;
};

export const addItemToCart = async (
    userId: string,
    productId: string,
    quantity: number
) => {
    const product = await Product.findById(productId);

    if (!product || !product.isActive) {
        throw new ApiError(404, "Product not found");
    }

    if (product.stock < quantity) {
        throw new ApiError(400, "Not enough stock available");
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
        cart = await Cart.create({
            user: userId,
            items: [],
        });
    }

    const existingItem = cart.items.find(
        (item) => item.product.toString() === productId
    );

    if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;

        if (product.stock < newQuantity) {
            throw new ApiError(400, "Not enough stock available");
        }

        existingItem.quantity = newQuantity;
    } else {
        cart.items.push({
            product: product._id,
            quantity,
        });
    }

    await cart.save()

    return getUserCart(userId);
};

export const updateCartItem = async (
    userId: string,
    productId: string,
    quantity: number
) => {
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    const item = cart.items.find((item) => item.product.toString() === productId);

    if (!item) {
        throw new ApiError(404, "Product not found in cart");
    }

    const product = await Product.findById(productId)

    if (!product || !product.isActive) {
        throw new ApiError(404, "Product not found");
    }

    if (product.stock < quantity) {
        throw new ApiError(400, "Not enough stock available");
    }

    item.quantity = quantity;

    await cart.save();

    return getUserCart(userId);
};

export const removeCartItem = async (
    userId: string, productId: string
) => {
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    cart.items = cart.items.filter(
        (item) => item.product.toString() !== productId
    );

    await cart.save();

    return getUserCart(userId)
};

export const clearUserCart = async (userId: string) => {
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    cart.items = [];

    await cart.save();

    return cart;
};
