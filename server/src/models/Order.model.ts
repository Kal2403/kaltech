import mongoose, {
    Schema,
    type Document,
    type Types,
} from "mongoose";

export type PaymentMethod = "card" | "paypal" | "cash";

export type PaymentStatus = "pending" | "paid" | "failed";

export type OrderStatus =
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";

export interface IOrderItem {
    product: Types.ObjectId;
    name: string;
    quantity: number;
    price: number;
    image?: string;
}

export interface IShippingAddress {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
}

export interface IPaymentResult {
    id: string;
    status: string;
    update_time?: string;
    email_address?: string;
    method?: string;
}

export interface IOrderCouponSummary {
    code: string;
    discountPercent: number;
    discountAmount: number;
}

export interface IOrderTimelineEvent {
    status: OrderStatus;
    title: string;
    description?: string;
    location?: string;
    timestamp: Date;
}

export interface IOrder extends Document {
    user: Types.ObjectId;
    items: IOrderItem[];
    shippingAddress: IShippingAddress;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    orderStatus: OrderStatus;
    subtotal: number;
    discountAmount?: number;
    coupon?: IOrderCouponSummary;
    tax: number;
    shippingCost: number;
    total: number;
    paidAt?: Date;
    paymentResult?: IPaymentResult;
    trackingNumber?: string;
    carrier?: string;
    estimatedDelivery?: Date;
    timeline: IOrderTimelineEvent[];
    createdAt: Date;
    updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        image: {
            type: String,
            trim: true,
        },
    },
    {
        _id: false,
    }
);

const shippingAddressSchema = new Schema<IShippingAddress>(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        address: {
            type: String,
            required: true,
            trim: true,
        },
        city: {
            type: String,
            required: true,
            trim: true,
        },
        postalCode: {
            type: String,
            required: true,
            trim: true,
        },
        country: {
            type: String,
            required: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        _id: false,
    }
);

const orderTimelineEventSchema = new Schema<IOrderTimelineEvent>(
    {
        status: {
            type: String,
            enum: [
                "pending",
                "processing",
                "shipped",
                "delivered",
                "cancelled",
            ],
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        location: {
            type: String,
            trim: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
            required: true,
        },
    },
    {
        _id: false,
    }
);

const orderSchema = new Schema<IOrder>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        items: {
            type: [orderItemSchema],
            required: true,
            validate: {
                validator: (items: IOrderItem[]) => items.length > 0,
                message: "Order must contain at least one item",
            },
        },
        shippingAddress: {
            type: shippingAddressSchema,
            required: true,
        },
        paymentMethod: {
            type: String,
            enum: ["card", "paypal", "cash"],
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed"],
            default: "pending",
            index: true,
        },
        orderStatus: {
            type: String,
            enum: [
                "pending",
                "processing",
                "shipped",
                "delivered",
                "cancelled",
            ],
            default: "pending",
            index: true,
        },
        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },
        discountAmount: {
            type: Number,
            default: 0,
            min: 0,
        },
        coupon: {
            code: {
                type: String,
                trim: true,
            },
            discountPercent: {
                type: Number,
                min: 1,
                max: 99,
            },
            discountAmount: {
                type: Number,
                min: 0,
            },
        },
        tax: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
        shippingCost: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
        total: {
            type: Number,
            required: true,
            min: 0,
        },
        paidAt: {
            type: Date,
        },
        paymentResult: {
            id: { type: String },
            status: { type: String },
            update_time: { type: String },
            email_address: { type: String },
            method: { type: String },
        },
        trackingNumber: {
            type: String,
            trim: true,
        },
        carrier: {
            type: String,
            trim: true,
        },
        estimatedDelivery: {
            type: Date,
        },
        timeline: {
            type: [orderTimelineEventSchema],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

orderSchema.index({
    createdAt: -1,
    _id: -1,
});

export const Order = mongoose.model<IOrder>(
    "Order",
    orderSchema
);
