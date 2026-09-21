import type { Product } from "./product.types";

export interface Wishlist {
    _id: string;
    user: string;
    products: Product[];
    createdAt?: string;
    updatedAt?: string;
}

export interface WishlistResponse {
    success: boolean;
    message?: string;
    data: Wishlist;
}
