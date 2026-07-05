import { api } from "../../api/axios";
import type { Cart } from "../../types/cart.types";

interface CartResponse {
    success: boolean;
    message: string;
    data: {
        cart: Cart;
    };
}

interface AddCartItemInput {
    productId: string;
    quantity: number;
}

interface UpdateCartItemInput {
    productId: string;
    quantity: number;
}

export const getCart = async (): Promise<Cart> => {
    const response = await api.get<CartResponse>("/cart");

    return response.data.data.cart;
};

export const addCartItem = async ({ productId, quantity, }: AddCartItemInput): Promise<Cart> => {
    const response = await api.post<CartResponse>("/cart/items", {
        productId,
        quantity,
    });

    return response.data.data.cart;
};

export const updateCartItem = async ({ productId, quantity, }: UpdateCartItemInput): Promise<Cart> => {
    const response = await api.patch<CartResponse>(`/cart/items/${productId}`, {
        quantity,
    });

    return response.data.data.cart;
};

export const removeCartItem = async (productId: string): Promise<Cart> => {
    const response = await api.delete<CartResponse>(`/cart/items/${productId}`);

    return response.data.data.cart;
};

export const clearCart = async (): Promise<Cart> => {
    const response = await api.delete<CartResponse>("/cart");

    return response.data.data.cart;
};  
