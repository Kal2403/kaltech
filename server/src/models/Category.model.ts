import mongoose, { Schema, Document} from "mongoose";

export interface ICategory extends Document {
    name: string;
    slug: string;
    description?: string;
    image?: string,
    isActive: boolean;
}

const categorySchema = new Schema<ICategory>(
    {
        name: {
            type: String,
            required: [true, "Catgory name is required"],
            trim: true,
            unique: true,
        },
        slug: {
            type: String,
            required: [true, "Category slug is required"],
            trim: true,
            lowercase: true,
            unique: true,
        },
        description: {
            type: String,
            trim: true,
            maxlength: 500,
        },
        image: {
            type: String,
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

export const Category = mongoose.model<ICategory>("Category", categorySchema);