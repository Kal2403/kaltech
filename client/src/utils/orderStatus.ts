import type { OrderStatus } from "../types/order.types";

const transitions: Record<OrderStatus, readonly OrderStatus[]> = {
    pending: ["processing", "cancelled"],
    processing: ["shipped", "cancelled"],
    shipped: ["delivered"],
    delivered: [],
    cancelled: [],
};

export const getAvailableOrderStatuses = (
    currentStatus: OrderStatus
): readonly OrderStatus[] => [
    currentStatus,
    ...transitions[currentStatus],
];
