import { Types } from "mongoose";
import { Product } from "../models/Product.model.js";
import { Category } from "../models/Category.model.js";
import { ApiError } from "../utils/ApiError.js";
import { parseProductInput } from "../utils/product-input.js";
import { validateObjectId } from "../utils/validateObjectId.js";

const validateDiscount = (price: number, discount: number | null | undefined) => {
    if (discount != null && discount >= price) throw new ApiError(400, "Discount price must be lower than price");
};
const activeCategory = async (id: string) => {
    const category = await Category.findById(id);
    if (!category) throw new ApiError(404, "Category not found");
    if (!category.isActive) throw new ApiError(409, "Category is inactive");
};
const mapDuplicate = (error: unknown): never => {
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
        throw new ApiError(409, "Product slug already exists");
    }
    throw error;
};

export const createProduct = async (input: unknown) => {
    const data = parseProductInput(input);
    validateDiscount(data.price!, data.discountPrice);
    await activeCategory(data.category!);
    const id = new Types.ObjectId();
    const base = data.name!.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
        .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "product";
    const { discountPrice, brand, ...fields } = data;
    try {
        const product = await Product.create({
            ...fields, _id: id, slug: data.slug ?? `${base}-${id}`,
            ...(discountPrice != null ? { discountPrice } : {}),
            ...(brand != null ? { brand } : {}),
        });
        return await product.populate("category", "name slug");
    } catch (error) { return mapDuplicate(error); }
};

export interface ProductFilterQuery {
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    inStock?: boolean;
    search?: string;
    sort?: string;
}

export const getProducts = async (options?: ProductFilterQuery) => {
    const filter: Record<string, unknown> = { isActive: true };

    if (options?.category) {
        if (Types.ObjectId.isValid(options.category)) {
            filter.category = new Types.ObjectId(options.category);
        } else {
            const cat = await Category.findOne({ slug: options.category.toLowerCase().trim() });
            if (cat) {
                filter.category = cat._id;
            } else {
                return [];
            }
        }
    }

    if (options?.brand) {
        const brands = options.brand.split(",").map((b) => b.trim()).filter(Boolean);
        if (brands.length === 1) {
            filter.brand = new RegExp(`^${brands[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
        } else if (brands.length > 1) {
            filter.brand = {
                $in: brands.map((b) => new RegExp(`^${b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i")),
            };
        }
    }

    if (options?.minPrice != null || options?.maxPrice != null) {
        const priceFilter: Record<string, number> = {};
        if (options.minPrice != null && !isNaN(options.minPrice) && options.minPrice >= 0) {
            priceFilter.$gte = options.minPrice;
        }
        if (options.maxPrice != null && !isNaN(options.maxPrice) && options.maxPrice >= 0) {
            priceFilter.$lte = options.maxPrice;
        }
        if (Object.keys(priceFilter).length > 0) {
            filter.price = priceFilter;
        }
    }

    if (options?.minRating != null && !isNaN(options.minRating) && options.minRating > 0) {
        filter.rating = { $gte: options.minRating };
    }

    if (options?.inStock === true) {
        filter.stock = { $gt: 0 };
    }

    if (options?.search) {
        const searchRegex = new RegExp(options.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
        filter.$or = [
            { name: searchRegex },
            { description: searchRegex },
            { brand: searchRegex },
        ];
    }

    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    if (options?.sort) {
        switch (options.sort) {
            case "price-asc":
                sortOption = { price: 1 };
                break;
            case "price-desc":
                sortOption = { price: -1 };
                break;
            case "name-asc":
                sortOption = { name: 1 };
                break;
            case "name-desc":
                sortOption = { name: -1 };
                break;
            case "rating-desc":
                sortOption = { rating: -1 };
                break;
            case "featured":
                sortOption = { isFeatured: -1, createdAt: -1 };
                break;
            default:
                sortOption = { createdAt: -1 };
        }
    }

    return await Product.find(filter).populate("category", "name slug").sort(sortOption);
};
export const getAdminProducts = () => Product.find().populate("category", "name slug").sort({ createdAt: -1 });
export const getAdminProductById = async (id: string) => {
    const product = await Product.findById(validateObjectId(id, "product")).populate("category", "name slug");
    if (!product) throw new ApiError(404, "Product not found");
    return product;
};
export const getProductById = async (id: string) => {
    const product = await getAdminProductById(id);
    if (!product.isActive) throw new ApiError(404, "Product not found");
    return product;
};

export const updateProduct = async (id: string, input: unknown) => {
    validateObjectId(id, "product");
    const data = parseProductInput(input, true);
    const current = await Product.findById(id);
    if (!current) throw new ApiError(404, "Product not found");
    validateDiscount(data.price ?? current.price,
        data.discountPrice === undefined ? current.discountPrice : data.discountPrice);
    if (data.category !== undefined || (data.isActive === true && !current.isActive)) {
        await activeCategory(data.category ?? current.category.toString());
    }
    const set: Record<string, unknown> = { ...data };
    const unset: Record<string, 1> = {};
    for (const field of ["discountPrice", "brand"] as const) {
        if (data[field] === null) { delete set[field]; unset[field] = 1; }
    }
    // CAS protects validated fields; omitted inventory is never overwritten.
    const filter = {
        _id: id, price: current.price, discountPrice: current.discountPrice ?? null,
        category: current.category, isActive: current.isActive,
        ...(data.stock !== undefined ? { stock: current.stock } : {}),
    };
    try {
        const product = await Product.findOneAndUpdate(filter, {
            $set: set, ...(Object.keys(unset).length ? { $unset: unset } : {}),
        }, { returnDocument: "after", runValidators: true }).populate("category", "name slug");
        if (!product) throw new ApiError(409, "Product changed while updating; please retry");
        return product;
    } catch (error) { return mapDuplicate(error); }
};

export const deleteProduct = async (id: string) => {
    const product = await Product.findByIdAndUpdate(validateObjectId(id, "product"), { isActive: false }, { returnDocument: "after" });
    if (!product) throw new ApiError(404, "Product not found");
    return product;
};
