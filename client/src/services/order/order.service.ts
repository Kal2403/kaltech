import { api } from "../../api/axios";

import type {
    AdminOrder,
    CreateOrderPayload,
    Order,
    UpdateOrderStatusPayload,
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

interface GetAdminOrdersResponse {
    success: boolean;
    message: string;
    data: {
        orders: AdminOrder[];
    };
}

interface GetAdminOrderByIdResponse {
    success: boolean;
    message: string;
    data: {
        order: AdminOrder;
    };
}

interface UpdateOrderStatusResponse {
    success: boolean;
    message: string;
    data: {
        order: AdminOrder;
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

export const getAdminOrders = async (): Promise<AdminOrder[]> => {
    const { data } = await api.get<GetAdminOrdersResponse>(
        "/orders/admin"
    );

    return data.data.orders;
};

export const getAdminOrderById = async (
    orderId: string
): Promise<AdminOrder> => {
    const { data } =
        await api.get<GetAdminOrderByIdResponse>(
            `/orders/admin/${orderId}`
        );

    return data.data.order;
};

export const updateOrderStatus = async (
    orderId: string,
    payload: UpdateOrderStatusPayload
): Promise<AdminOrder> => {
    const { data } =
        await api.patch<UpdateOrderStatusResponse>(
            `/orders/admin/${orderId}/status`,
            payload
        );

    return data.data.order;
};
