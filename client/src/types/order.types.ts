export type PaymentMethod = 'card' | 'paypal' | 'cash';

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
    paymentMethod: string;
}

export interface OrderItem {
    product: string;
    name: string;
    image?: string;
    price: number;
    quantity: number;
}

export interface Order {
    _id: string;
    user: string;
    items: OrderItem[];
    shippingAddress: ShippingAddress;
    paymentMethod: PaymentMethod;
    paymentStatus: 'pending' | 'paid' | 'failed';
    orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    subtotal: number;
    tax: number;
    shippingCost: number;
    total: number;
    status: string;
    createdAt: string;
    uodatedAt: string;
}
