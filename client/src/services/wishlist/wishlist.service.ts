import { api } from "../../api/axios";
import type { Wishlist, WishlistResponse } from "../../types/wishlist.types";

export const getWishlist = async (): Promise<Wishlist> => {
    const response = await api.get<WishlistResponse>("/wishlist");
    return response.data.data;
};

export const addWishlistItem = async (productId: string): Promise<Wishlist> => {
    const response = await api.post<WishlistResponse>(`/wishlist/${productId}`);
    return response.data.data;
};

export const removeWishlistItem = async (productId: string): Promise<Wishlist> => {
    const response = await api.delete<WishlistResponse>(`/wishlist/${productId}`);
    return response.data.data;
};

export const clearWishlist = async (): Promise<Wishlist> => {
    const response = await api.delete<WishlistResponse>("/wishlist");
    return response.data.data;
};
