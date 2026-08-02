export type PaymentMethod = "card" | "paypal" | "cash";

export type PaymentStatus =
    | "pending"
    | "paid"
    | "failed";

export type OrderStatus =
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";

export interface ShippingAddress {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
}

export interface CreateOrderPayload {
    shippingAddress: ShippingAddress;
    paymentMethod: PaymentMethod;
}

export interface OrderItemProduct {
    _id: string;
    name: string;
    slug: string;
    images?: string[];
}

export interface OrderItem {
    product: string | OrderItemProduct;
    name: string;
    image?: string;
    price: number;
    quantity: number;
}

export interface AdminOrderUser {
    _id: string;
    name: string;
    email: string;
}

export interface Order {
    _id: string;
    user: string;
    items: OrderItem[];
    shippingAddress: ShippingAddress;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    orderStatus: OrderStatus;
    subtotal: number;
    tax: number;
    shippingCost: number;
    total: number;
    createdAt: string;
    updatedAt: string;
}

export interface AdminOrder
    extends Omit<Order, "user"> {
    user: AdminOrderUser;
}

export interface UpdateOrderStatusPayload {
    orderStatus: OrderStatus;
}

export interface OrderPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface AdminOrdersResult {
    orders: AdminOrder[];
    pagination: OrderPagination;
}
