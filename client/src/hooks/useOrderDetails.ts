import { useCallback, useEffect, useState } from "react";

import { getOrderById } from "../services/order/order.service";
import type { Order } from "../types/order.types";

export const useOrderDetails = (orderId: string | undefined) => {
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadOrder = useCallback(async () => {
        if (!orderId) {
            setOrder(null);
            setError("El identificador de la orden no es válido.");
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const orderResponse = await getOrderById(orderId);

            setOrder(orderResponse);
        } catch (error) {
            console.error("Failed to load order details:", error);
            setOrder(null);
            setError("No se pudo cargar el detalle de la orden.");
        } finally {
            setIsLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void loadOrder();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [loadOrder]);

    return {
        order,
        isLoading,
        error,
        reloadOrder: loadOrder,
    };
};
