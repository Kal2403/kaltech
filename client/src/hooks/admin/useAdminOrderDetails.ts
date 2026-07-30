import {
    useCallback,
    useEffect,
    useState,
} from "react";
import axios from "axios";

import {
    getAdminOrderById,
    updateOrderStatus,
} from "../../services/order/order.service";
import type {
    AdminOrder,
    OrderStatus,
} from "../../types/order.types";

interface ApiErrorResponse {
    message?: string;
}

interface UseAdminOrderDetailsReturn {
    order: AdminOrder | null;
    isLoading: boolean;
    isUpdatingStatus: boolean;
    error: string | null;
    reloadOrder: () => Promise<void>;
    changeOrderStatus: (
        orderStatus: OrderStatus
    ) => Promise<boolean>;
}

const getErrorMessage = (
    error: unknown,
    fallbackMessage: string
): string => {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return (
            error.response?.data?.message ??
            fallbackMessage
        );
    }

    if (error instanceof Error) {
        return error.message;
    }

    return fallbackMessage;
};

export const useAdminOrderDetails = (
    orderId?: string
): UseAdminOrderDetailsReturn => {
    const [order, setOrder] =
        useState<AdminOrder | null>(null);
    const [isLoading, setIsLoading] =
        useState(true);
    const [isUpdatingStatus, setIsUpdatingStatus] =
        useState(false);
    const [error, setError] = useState<
        string | null
    >(null);

    const reloadOrder =
        useCallback(async (): Promise<void> => {
            if (!orderId) {
                setOrder(null);
                setError(
                    "El identificador del pedido no es válido."
                );
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);

                const orderData =
                    await getAdminOrderById(orderId);

                setOrder(orderData);
            } catch (error: unknown) {
                setOrder(null);
                setError(
                    getErrorMessage(
                        error,
                        "No se pudo cargar el pedido."
                    )
                );
            } finally {
                setIsLoading(false);
            }
        }, [orderId]);

    const changeOrderStatus = useCallback(
        async (
            orderStatus: OrderStatus
        ): Promise<boolean> => {
            if (!orderId) {
                setError(
                    "El identificador del pedido no es válido."
                );
                return false;
            }

            try {
                setIsUpdatingStatus(true);
                setError(null);

                const updatedOrder =
                    await updateOrderStatus(orderId, {
                        orderStatus,
                    });

                setOrder(updatedOrder);

                return true;
            } catch (error: unknown) {
                setError(
                    getErrorMessage(
                        error,
                        "No se pudo actualizar el estado del pedido."
                    )
                );

                return false;
            } finally {
                setIsUpdatingStatus(false);
            }
        },
        [orderId]
    );

    useEffect(() => {
        void reloadOrder();
    }, [reloadOrder]);

    return {
        order,
        isLoading,
        isUpdatingStatus,
        error,
        reloadOrder,
        changeOrderStatus,
    };
};
