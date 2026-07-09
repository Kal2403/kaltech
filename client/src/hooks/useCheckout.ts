import { useState } from "react";

import { createOrder } from "../services/order/order.service";

import type { CreateOrderPayload, Order } from "../types/order.types";

export const useCheckout = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submitOrder = async (payload: CreateOrderPayload): Promise<Order | null> => {
        try {
            setLoading(true);
            setError(null);

            const order = await createOrder(payload);

            return order
        } catch (err) {
            console.error(err);
            setError("Error al Crear Orden.");
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        submitOrder,
    };
};
