export interface Coupon {
    _id: string;
    code: string;
    description?: string;
    discountPercent: number;
    minOrderAmount: number;
    maxDiscountAmount?: number;
    validFrom: string;
    validUntil?: string;
    maxUses?: number;
    usedCount: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CouponValidationResult {
    valid: boolean;
    coupon: {
        _id: string;
        code: string;
        description?: string;
        discountPercent: number;
        minOrderAmount: number;
        maxDiscountAmount?: number;
    };
    discountAmount: number;
    newSubtotal: number;
}

export interface CreateCouponPayload {
    code: string;
    description?: string;
    discountPercent: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    validFrom?: string;
    validUntil?: string;
    maxUses?: number;
    isActive?: boolean;
}

export interface UpdateCouponPayload {
    code?: string;
    description?: string;
    discountPercent?: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    validFrom?: string;
    validUntil?: string;
    maxUses?: number;
    isActive?: boolean;
}
