import type { OrderStatus } from "../../models/Order.model.js";

export const orderStatuses: readonly OrderStatus[] = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
];

const allowedTransitions: Record<
    OrderStatus,
    readonly OrderStatus[]
> = {
    pending: ["processing", "cancelled"],
    processing: ["shipped", "cancelled"],
    shipped: ["delivered"],
    delivered: [],
    cancelled: [],
};

export const isOrderStatus = (
    value: unknown
): value is OrderStatus =>
    typeof value === "string" &&
    orderStatuses.includes(value as OrderStatus);

export const canTransitionOrderStatus = (
    currentStatus: OrderStatus,
    nextStatus: OrderStatus
): boolean =>
    currentStatus === nextStatus ||
    allowedTransitions[currentStatus].includes(nextStatus);
