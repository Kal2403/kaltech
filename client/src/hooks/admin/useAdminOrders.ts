import {
    useCallback,
    useEffect,
    useState,
} from "react";
import axios from "axios";

import {
    getAdminOrders,
    updateOrderStatus as updateOrderStatusRequest,
} from "../../services/order/order.service";
import type {
    AdminOrder,
    OrderStatus,
} from "../../types/order.types";

interface ApiErrorResponse {
    message?: string;
}

interface UseAdminOrdersReturn {
    orders: AdminOrder[];
    isLoading: boolean;
    error: string | null;
    updatingOrderId: string | null;
    refreshOrders: () => Promise<void>;
    changeOrderStatus: (
        orderId: string,
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

export const useAdminOrders =
    (): UseAdminOrdersReturn => {
        const [orders, setOrders] = useState<
            AdminOrder[]
        >([]);
        const [isLoading, setIsLoading] =
            useState(true);
        const [error, setError] = useState<
            string | null
        >(null);
        const [
            updatingOrderId,
            setUpdatingOrderId,
        ] = useState<string | null>(null);

        const refreshOrders =
            useCallback(async (): Promise<void> => {
                try {
                    setIsLoading(true);
                    setError(null);

                    const ordersData =
                        await getAdminOrders();

                    setOrders(ordersData);
                } catch (error: unknown) {
                    setError(
                        getErrorMessage(
                            error,
                            "No se pudieron cargar los pedidos."
                        )
                    );
                } finally {
                    setIsLoading(false);
                }
            }, []);

        const changeOrderStatus = useCallback(
            async (
                orderId: string,
                orderStatus: OrderStatus
            ): Promise<boolean> => {
                try {
                    setUpdatingOrderId(orderId);
                    setError(null);

                    const updatedOrder =
                        await updateOrderStatusRequest(
                            orderId,
                            {
                                orderStatus,
                            }
                        );

                    setOrders((currentOrders) =>
                        currentOrders.map((order) =>
                            order._id === orderId
                                ? {
                                    ...order,
                                    ...updatedOrder,
                                }
                                : order
                        )
                    );

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
                    setUpdatingOrderId(null);
                }
            },
            []
        );

        useEffect(() => {
            void refreshOrders();
        }, [refreshOrders]);

        return {
            orders,
            isLoading,
            error,
            updatingOrderId,
            refreshOrders,
            changeOrderStatus,
        };
    };
