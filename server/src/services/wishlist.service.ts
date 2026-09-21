import { Wishlist } from "../models/Wishlist.model.js";
import { Product } from "../models/Product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { validateObjectId } from "../utils/validateObjectId.js";

export const getUserWishlist = async (userId: string) => {
    let wishlist = await Wishlist.findOne({ user: userId }).populate(
        "products",
        "name slug price discountPrice images stock brand rating reviewsCount isFeatured category isActive"
    );

    if (!wishlist) {
        wishlist = await Wishlist.create({
            user: userId,
            products: [],
        });
    }

    return wishlist;
};

export const addToWishlist = async (userId: string, productId: string) => {
    validateObjectId(productId, "product");

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
        throw new ApiError(404, "Product not found");
    }

    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
        wishlist = await Wishlist.create({
            user: userId,
            products: [product._id],
        });
    } else {
        const exists = wishlist.products.some(
            (id) => id.toString() === productId
        );
        if (!exists) {
            wishlist.products.push(product._id);
            await wishlist.save();
        }
    }

    return getUserWishlist(userId);
};

export const removeFromWishlist = async (userId: string, productId: string) => {
    validateObjectId(productId, "product");

    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
        throw new ApiError(404, "Wishlist not found");
    }

    wishlist.products = wishlist.products.filter(
        (id) => id.toString() !== productId
    ) as any;

    await wishlist.save();

    return getUserWishlist(userId);
};

export const clearWishlist = async (userId: string) => {
    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
        wishlist = await Wishlist.create({
            user: userId,
            products: [],
        });
        return wishlist;
    }

    wishlist.products = [] as any;
    await wishlist.save();

    return wishlist;
};
