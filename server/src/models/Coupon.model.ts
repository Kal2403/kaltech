import mongoose, { Document, Schema } from "mongoose";

export interface ICoupon extends Document {
    code: string;
    description?: string;
    discountPercent: number;
    minOrderAmount: number;
    maxDiscountAmount?: number;
    validFrom: Date;
    validUntil?: Date;
    maxUses?: number;
    usedCount: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
    {
        code: {
            type: String,
            required: [true, "Coupon code is required"],
            unique: true,
            uppercase: true,
            trim: true,
            minlength: [3, "Coupon code must be at least 3 characters"],
            maxlength: [30, "Coupon code cannot exceed 30 characters"],
            index: true,
        },
        description: {
            type: String,
            trim: true,
            maxlength: [200, "Description cannot exceed 200 characters"],
        },
        discountPercent: {
            type: Number,
            required: [true, "Discount percentage is required"],
            min: [1, "Discount percentage must be at least 1%"],
            max: [99, "Discount percentage cannot exceed 99%"],
        },
        minOrderAmount: {
            type: Number,
            default: 0,
            min: [0, "Minimum order amount cannot be negative"],
        },
        maxDiscountAmount: {
            type: Number,
            min: [0, "Maximum discount amount cannot be negative"],
        },
        validFrom: {
            type: Date,
            default: () => new Date(),
        },
        validUntil: {
            type: Date,
        },
        maxUses: {
            type: Number,
            min: [1, "Max uses must be at least 1"],
        },
        usedCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

couponSchema.index({
    createdAt: -1,
    _id: -1,
});

export const Coupon = mongoose.model<ICoupon>("Coupon", couponSchema);
