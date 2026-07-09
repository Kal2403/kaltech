import { api } from "../../api/axios";
import type { CreateOrderPayload, Order } from "../../types/order.types";

interface CreateOrderResponse {
    success: boolean;
    message: string;
    data: {
        order: Order;
    };
}

export const createOrder = async (payload: CreateOrderPayload): Promise<Order> => {
    const { data } = await api.post<CreateOrderResponse>('/orders', payload);
    return data.data.order;
};
