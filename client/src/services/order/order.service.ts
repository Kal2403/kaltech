import { api } from "../../api/axios";

import type {
    CreateOrderPayload,
    Order,
} from "../../types/order.types";

interface CreateOrderResponse {
    success: boolean;
    message: string;
    data: {
        order: Order;
    };
}

interface GetOrdersResponse {
    success: boolean;
    message: string;
    data: {
        orders: Order[];
    };
}

interface GetOrderByIdResponse {
    success: boolean;
    message: string;
    data: {
        order: Order;
    };
}

export const createOrder = async (
    payload: CreateOrderPayload
): Promise<Order> => {
    const { data } = await api.post<CreateOrderResponse>(
        "/orders",
        payload
    );

    return data.data.order;
};

export const getOrders = async (): Promise<Order[]> => {
    const { data } = await api.get<GetOrdersResponse>(
        "/orders/my-orders"
    );

    return data.data.orders;
};

export const getOrderById = async (
    orderId: string
): Promise<Order> => {
    const { data } = await api.get<GetOrderByIdResponse>(
        `/orders/${orderId}`
    );

    return data.data.order;
};
