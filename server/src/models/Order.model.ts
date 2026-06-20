import mongoose, { Schema, Document, Types } from "mongoose";

interface IOrderItem {
    product: Types.ObjectId;
    name: string;
    quantity: number;
    price: number;
    image?: string;
}

interface IShippingAddrees {
    fullName: string,
    address: string,
    city: string;
    postalCode: string;
    country: string;
    phone: string;
}

export interface IOrder extends Document {
    user: Types.ObjectId;
    items: IOrderItem[];
    shippingAddress: IShippingAddrees;
    paymentMethod: "card" | "paypal" | "cash";
    paymentStatus: "pending" | "paid" | "failed";
    orderStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
    subtotal: number;
    tax: number;
    shippingCost: number;
    total: number;
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
        },
    },
    { _id: false }
);

const shippingAddressSchema = new Schema<IShippingAddrees>(
    {
        fullName: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
        phone: { type: String, required: true },
    },
    { _id: false }
)

const orderSchema = new Schema<IOrder>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
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
        },
        orderStatus: {
            type: String,
            enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
            default: "pending",
        },
        subtotal: {
            type: Number,
            required: true,
            min: 0,
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
    },
    {
        timestamps: true,
    }
);

export const Order = mongoose.model<IOrder>("Order", orderSchema);
