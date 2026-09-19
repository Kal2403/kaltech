import { Category } from "../models/Category.model.js";
import { Product } from "../models/Product.model.js";
import { ApiError } from "../utils/ApiError.js";

interface CreateCategoryInput {
    name: string;
    slug: string;
    description?: string;
    image?: string;
    isActive?: boolean;
}

type UpdateCategoryInput = Partial<CreateCategoryInput>;

const validateCategoryUpdate = (data: UpdateCategoryInput): void => {
    const allowed = ["name", "slug", "description", "image", "isActive"];
    if (!data || typeof data !== "object" || Array.isArray(data) ||
        Object.keys(data).some((key) => !allowed.includes(key))) {
        throw new ApiError(400, "Invalid category update");
    }
    if (Object.hasOwn(data, "isActive") && typeof data.isActive !== "boolean") {
        throw new ApiError(400, "Category active status must be a boolean");
    }
};

const ensureCategoryCanBeDeactivated = async (id: string): Promise<void> => {
    const hasActiveProducts = await Product.exists({ category: id, isActive: true });
    if (hasActiveProducts) {
        throw new ApiError(409, "Category cannot be deactivated while it has active products");
    }
};

const ensureCategoryIsUnique = async (
    data: Pick<UpdateCategoryInput, "name" | "slug">,
    excludedCategoryId?: string
): Promise<void> => {
    const duplicateConditions: Array<Record<string, string>> = [];

    if (data.name) {
        duplicateConditions.push({ name: data.name });
    }

    if (data.slug) {
        duplicateConditions.push({ slug: data.slug });
    }

    if (duplicateConditions.length === 0) {
        return;
    }

    const query: {
        $or: Array<Record<string, string>>;
        _id?: { $ne: string };
    } = {
        $or: duplicateConditions,
    };

    if (excludedCategoryId) {
        query._id = {
            $ne: excludedCategoryId,
        };
    }

    const existingCategory = await Category.findOne(query);

    if (existingCategory) {
        throw new ApiError(
            409,
            "A category with the same name or slug already exists"
        );
    }
};

export const createCategory = async (
    data: CreateCategoryInput
) => {
    await ensureCategoryIsUnique(data);

    const category = await Category.create(data);

    return category;
};

export const getCategories = async () => {
    const categories = await Category.find({
        isActive: true,
    }).sort({
        createdAt: -1,
    });

    return categories;
};

export const getAdminCategories = async () => {
    const categories = await Category.find().sort({
        createdAt: -1,
    });

    return categories;
};

export const getCategoryById = async (id: string) => {
    const category = await Category.findById(id);

    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    return category;
};

export const updateCategory = async (
    id: string,
    data: UpdateCategoryInput
) => {
    validateCategoryUpdate(data);
    const categoryExists = await Category.exists({
        _id: id,
    });

    if (!categoryExists) {
        throw new ApiError(404, "Category not found");
    }

    if (data.isActive === false) {
        await ensureCategoryCanBeDeactivated(id);
    }

    await ensureCategoryIsUnique(data, id);

    const category = await Category.findByIdAndUpdate(
        id,
        data,
        {
            returnDocument: "after",
            runValidators: true,
        }
    );

    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    return category;
};

export const deleteCategory = async (id: string) => {
    const category = await Category.findById(id);

    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    await ensureCategoryCanBeDeactivated(id);

    category.isActive = false;

    await category.save();

    return category;
};
