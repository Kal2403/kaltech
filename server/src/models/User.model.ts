import mongoose, { Schema, Document, type Types } from "mongoose";

export interface IUserAddress {
    _id?: Types.ObjectId;
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
    isDefault: boolean;
}

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: "customer" | "admin";
    phone?: string;
    avatar?: string;
    addresses: IUserAddress[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const userAddressSchema = new Schema<IUserAddress>(
    {
        fullName: {
            type: String,
            required: [true, "Full name is required for address"],
            trim: true,
        },
        address: {
            type: String,
            required: [true, "Address is required"],
            trim: true,
        },
        city: {
            type: String,
            required: [true, "City is required"],
            trim: true,
        },
        postalCode: {
            type: String,
            required: [true, "Postal code is required"],
            trim: true,
        },
        country: {
            type: String,
            required: [true, "Country is required"],
            trim: true,
        },
        phone: {
            type: String,
            required: [true, "Phone number is required for address"],
            trim: true,
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
    },
    { _id: true }
);

const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: 2,
            maxLength: 80,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: 8,
            select: false,
        },
        role: {
            type: String,
            enum: ["customer", "admin"],
            default: "customer",
        },
        phone: {
            type: String,
            trim: true,
            default: "",
        },
        avatar: {
            type: String,
            trim: true,
            default: "",
        },
        addresses: {
            type: [userAddressSchema],
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

export const User = mongoose.model<IUser>("User", userSchema);
