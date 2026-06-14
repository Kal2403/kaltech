import mongoose, { Schema, Document, Types} from "mongoose";

export interface IProduct extends Document {
    name: string;
    slug: string;
    description: string;
    price: number;
    discountPrice?: number;
    stock: number,
    images: string[];
    brand?: string;
    category: Types.ObjectId;
    specs?: Record<string, string>;
    isFeatured: boolean;
    isActive: boolean;
}

const productSchema = new Schema<IProduct>(
    {
        name: {
            type: String,
            required: [true, "Product name is required"],
            trim: true,
        },
        slug: {
            type: String,
            required: [true, "Product slug is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Product description is required"],
            trim: true,
        },
        price: {
            type: Number,
            required: [true, "Product price is required"],
            min: 0,
        },
        discountPrice: {
            type: Number,
            min: 0,
        },
        stock: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
        images: {
            type: [String],
            default: [],
        },
        brand: {
            type: String,
            trim: true,
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        specs: {
            type: Map,
            of: String,
            default: {},
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Product = mongoose.model<IProduct>("Product", productSchema);