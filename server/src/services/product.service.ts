import { Product } from "../models/Product.model.js";
import { Category } from "../models/Category.model.js";
import { ApiError } from "../utils/ApiError.js";

interface ProductInput {
    name: string;
    slug: string;
    description: string;
    price: number;
    discountPrice?: number;
    stock: number;
    images?: string[];
    brand?: string;
    category: string;
    specs?: Record<string, string>;
    isFeatured?: boolean;
}

export const createProduct = async (data: ProductInput) => {
    const existingProduct = await Product.findOne({ slug: data.slug });

    if (existingProduct) {
        throw new ApiError(409, "Product already exists");
    }

    const categoryExists = await Category.findById(data.category);

    if (!categoryExists) {
        throw new ApiError(404, "Category no found");
    }

    const product = await Product.create(data);

    return product;
};

export const getProducts = async () => {
    const products = await Product.find({ isActive: true })
        .populate("category", "name slug")
        .sort({ createdAt: -1 });

    return products;
};

export const getProductById = async (id: string) => {
    const product = await Product.findById(id).populate("category", "name slug");

    if (!product || !product.isActive) {
        throw new ApiError(404, "Product not found")
    }

    return product;
};

export const updateProduct = async (id: string, data: Partial<ProductInput>) => {
    const product = await Product.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    }).populate("category", "name slug");

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    return product;
};

export const deleteProduct = async (id: string) => {
    const product = await Product.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
    );

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    return product;
};