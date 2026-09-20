import mongoose, { Schema, Document, Types} from "mongoose";

export interface IProductReview {
    rating: number;
    comment: string;
    date: Date;
    reviewerName: string;
    reviewerEmail?: string;
}

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
    rating?: number;
    reviewsCount?: number;
    reviews?: IProductReview[];
    isFeatured: boolean;
    isActive: boolean;
}

const productReviewSchema = new Schema<IProductReview>(
    {
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
            trim: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
        reviewerName: {
            type: String,
            required: true,
            trim: true,
        },
        reviewerEmail: {
            type: String,
            trim: true,
        },
    },
    { _id: false }
);

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
            validate: Number.isFinite,
        },
        discountPrice: {
            type: Number,
            min: 0,
            validate: Number.isFinite,
        },
        stock: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
            validate: Number.isSafeInteger,
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
        rating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0,
        },
        reviewsCount: {
            type: Number,
            min: 0,
            default: 0,
        },
        reviews: {
            type: [productReviewSchema],
            default: [],
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
