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
    couponCode?: string;
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

export interface PaymentResult {
    id: string;
    status: string;
    update_time?: string;
    email_address?: string;
    method?: string;
}

export interface CardPaymentData {
    cardNumber: string;
    cardHolder: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    email?: string;
}

export interface ProcessPaymentPayload {
    method: PaymentMethod;
    card?: CardPaymentData;
    paypal?: {
        orderId?: string;
        payerEmail?: string;
    };
}

export interface OrderCouponSummary {
    code: string;
    discountPercent: number;
    discountAmount: number;
}

export interface OrderTimelineEvent {
    status: OrderStatus;
    title: string;
    description?: string;
    location?: string;
    timestamp: string;
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
    discountAmount?: number;
    coupon?: OrderCouponSummary;
    tax: number;
    shippingCost: number;
    total: number;
    paidAt?: string;
    paymentResult?: PaymentResult;
    trackingNumber?: string;
    carrier?: string;
    estimatedDelivery?: string;
    timeline?: OrderTimelineEvent[];
    createdAt: string;
    updatedAt: string;
}

export interface AdminOrder
    extends Omit<Order, "user"> {
    user: AdminOrderUser;
}

export interface UpdateOrderStatusPayload {
    orderStatus: OrderStatus;
    trackingNumber?: string;
    carrier?: string;
    estimatedDelivery?: string;
    note?: string;
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
