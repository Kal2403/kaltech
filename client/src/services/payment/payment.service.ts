import { api } from "../../api/axios";
import type {
    Order,
    PaymentResult,
    ProcessPaymentPayload,
} from "../../types/order.types";

interface PayOrderResponse {
    success: boolean;
    message: string;
    data: {
        order: Order;
    };
}

interface ProcessPaymentResponse {
    success: boolean;
    message: string;
    data: {
        paymentResult: PaymentResult;
    };
}

export interface PaymentConfig {
    supportedMethods: string[];
    currency: string;
    testCards?: Array<{
        brand: string;
        number: string;
        note: string;
    }>;
}

interface PaymentConfigResponse {
    success: boolean;
    data: PaymentConfig;
}

export const payOrder = async (
    orderId: string,
    payload: ProcessPaymentPayload
): Promise<Order> => {
    const { data } = await api.post<PayOrderResponse>(
        `/orders/${orderId}/pay`,
        payload
    );

    return data.data.order;
};

export const processPayment = async (
    payload: ProcessPaymentPayload & { amount: number }
): Promise<PaymentResult> => {
    const { data } = await api.post<ProcessPaymentResponse>(
        "/payments/process",
        payload
    );

    return data.data.paymentResult;
};

export const getPaymentConfig = async (): Promise<PaymentConfig> => {
    const { data } = await api.get<PaymentConfigResponse>(
        "/payments/config"
    );

    return data.data;
};
