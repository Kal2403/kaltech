import { Category } from "../models/Category.model.js";
import { ApiError } from "../utils/ApiError.js";

interface CreateCategoryInput {
    name: string;
    slug: string;
    description?: string;
    image?: string;
}

export const createCategory = async (data: CreateCategoryInput) => {
    const existingCategory = await Category.findOne({
        $or: [{ name: data.name }, { slug: data.slug } ],
    });

    if (existingCategory) {
        throw new ApiError(409, "Category already exists");
    }

    const category = await Category.create(data);

    return category;
};

export const getCategories = async () => {
    const categories = await Category.find({ isActive: true }).sort({
        createdAt: -1,
    })

    return categories;
}