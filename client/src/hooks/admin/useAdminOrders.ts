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
    OrderPagination,
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
    pagination: OrderPagination;
    goToPage: (page: number) => void;
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
        const [page, setPage] = useState(1);
        const [pagination, setPagination] = useState<OrderPagination>({
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
        });
        const [
            updatingOrderId,
            setUpdatingOrderId,
        ] = useState<string | null>(null);

        const refreshOrders =
            useCallback(async (): Promise<void> => {
                try {
                    setIsLoading(true);
                    setError(null);

                    const result = await getAdminOrders(page);

                    setOrders(result.orders);
                    setPagination(result.pagination);
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
            }, [page]);

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
            const timeoutId = window.setTimeout(() => {
                void refreshOrders();
            }, 0);

            return () => window.clearTimeout(timeoutId);
        }, [refreshOrders]);

        return {
            orders,
            isLoading,
            error,
            updatingOrderId,
            pagination,
            goToPage: setPage,
            refreshOrders,
            changeOrderStatus,
        };
    };
