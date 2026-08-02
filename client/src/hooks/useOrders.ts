import { useCallback, useEffect, useState } from "react";

import { getOrders } from "../services/order/order.service";
import type { Order } from "../types/order.types";

export const useOrders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadOrders = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const ordersResponse = await getOrders();

            setOrders(ordersResponse);
        } catch (error) {
            console.error("Failed to load orders:", error);
            setError("No se pudieron cargar las órdenes.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void loadOrders();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [loadOrders]);

    return {
        orders,
        isLoading,
        error,
        reloadOrders: loadOrders,
    };
};
