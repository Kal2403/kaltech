import { useCallback, useEffect, useMemo, useState } from "react";

import {
    addCartItem,
    clearCart,
    getCart,
    removeCartItem,
    updateCartItem,
} from '../services/cart/cart.service';
import type { Cart } from "../types/cart.types";

export const useCart = () => {
    const [cart, setCart] = useState<Cart | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isMutating, setIsMutating] = useState(false);
    const [error, setError] = useState("");

    const loadCart = useCallback(async () => {
        try {
            setIsLoading(true);
            setError("");

            const cartData = await getCart();
            setCart(cartData);
        } catch {
            setError("No se pudo cargar el carrito");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const addItem = async (productId: string, quantity = 1) => {
        try {
            setIsMutating(true);
            setError("");

            const updatedCart = await addCartItem({ productId, quantity });
            setCart(updatedCart);
        } catch {
            setError("No se pudo agregar el producto al carrito");
        } finally {
            setIsMutating(false);
        }
    };

    const updateItem = async (productId: string, quantity: number) => {
        try {
            setIsMutating(true);
            setError("");
        const updatedCart = await updateCartItem({ productId, quantity });
            setCart(updatedCart);
        } catch {
            setError("No se pudo actualizar el producto");
        } finally {
            setIsMutating(false);
        }
    };

    const removeItem = async (productId: string) => {
        try {
            setIsMutating(true);
            setError("");

            const updatedCart = await removeCartItem(productId);
            setCart(updatedCart);
        } catch {
            setError("No se pudo eliminar el producto del carrito");
        } finally {
            setIsMutating(false);
        }
    };

    const clear = async () => {
        try {
            setIsMutating(true);
            setError("");

            const updatedCart = await clearCart();
            setCart(updatedCart);
        } catch {
            setError("No se pudo vaciar el carrito");
        } finally {
            setIsMutating(false);
        }
    };

    useEffect(() => {
        loadCart();
    }, [loadCart]);

    const subTotal = useMemo(() => {
        return (
            cart?.items.reduce((total, item) => {
                const price = item.product.discountPrice ?? item.product.price;
                return total + price * item.quantity;
            }, 0) ?? 0
        );
    }, [cart]);

    const totalItems = useMemo(() => {
        return (
            cart?.items.reduce((total, item) => total + item.quantity, 0) ?? 0
        );
    }, [cart]);

    return {
        cart,
        items: cart?.items ?? [],
        subTotal,
        totalItems,
        isLoading,
        isMutating,
        error,
        reloadCart: loadCart,
        addItem,
        updateItem,
        removeItem,
        clearCart: clear,
    };
};
