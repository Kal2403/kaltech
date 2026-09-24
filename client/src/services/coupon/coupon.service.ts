import { api } from "../../api/axios";
import type {
    Coupon,
    CouponValidationResult,
    CreateCouponPayload,
    UpdateCouponPayload,
} from "../../types/coupon.types";

interface CouponValidationResponse {
    success: boolean;
    message: string;
    data: CouponValidationResult;
}

interface CouponsResponse {
    success: boolean;
    message: string;
    data: {
        coupons: Coupon[];
    };
}

interface CouponResponse {
    success: boolean;
    message: string;
    data: {
        coupon: Coupon;
    };
}

export const validateCoupon = async (
    code: string,
    subtotal: number
): Promise<CouponValidationResult> => {
    const response = await api.post<CouponValidationResponse>(
        "/coupons/validate",
        {
            code,
            subtotal,
        }
    );

    return response.data.data;
};

export const getAdminCoupons = async (): Promise<Coupon[]> => {
    const response = await api.get<CouponsResponse>("/coupons/admin");

    return response.data.data.coupons;
};

export const getCouponById = async (id: string): Promise<Coupon> => {
    const response = await api.get<CouponResponse>(`/coupons/${id}`);

    return response.data.data.coupon;
};

export const createCoupon = async (
    payload: CreateCouponPayload
): Promise<Coupon> => {
    const response = await api.post<CouponResponse>("/coupons", payload);

    return response.data.data.coupon;
};

export const updateCoupon = async (
    id: string,
    payload: UpdateCouponPayload
): Promise<Coupon> => {
    const response = await api.patch<CouponResponse>(
        `/coupons/${id}`,
        payload
    );

    return response.data.data.coupon;
};

export const deleteCoupon = async (id: string): Promise<Coupon> => {
    const response = await api.delete<CouponResponse>(`/coupons/${id}`);

    return response.data.data.coupon;
};
