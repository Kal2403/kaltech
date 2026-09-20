import { Types } from "mongoose";
import { Product } from "../models/Product.model.js";
import { Category } from "../models/Category.model.js";
import { ApiError } from "../utils/ApiError.js";

export interface DummyProductItem {
    id: number;
    title: string;
    description: string;
    category: string;
    price: number;
    discountPercentage?: number;
    rating?: number;
    stock: number;
    brand?: string;
    images?: string[];
    thumbnail?: string;
    warrantyInformation?: string;
    shippingInformation?: string;
    availabilityStatus?: string;
    returnPolicy?: string;
    weight?: number;
}

export interface DummyCategoryConfig {
    dummySlug: string;
    name: string;
    slug: string;
    description: string;
}

export interface SyncDummyResult {
    success: boolean;
    categoriesSynced: number;
    productsProcessed: number;
    productsInserted: number;
    productsUpdated: number;
    details: Array<{
        category: string;
        count: number;
    }>;
}

export const DUMMY_TECH_CATEGORIES: DummyCategoryConfig[] = [
    {
        dummySlug: "smartphones",
        name: "Smartphones",
        slug: "smartphones",
        description: "Últimos modelos de teléfonos inteligentes y smartphones de alta gama.",
    },
    {
        dummySlug: "laptops",
        name: "Laptops",
        slug: "laptops",
        description: "Portátiles y notebooks para trabajo, estudio y gaming.",
    },
    {
        dummySlug: "tablets",
        name: "Tablets",
        slug: "tablets",
        description: "Tablets y dispositivos táctiles de alta definición para productividad y entretenimiento.",
    },
    {
        dummySlug: "mobile-accessories",
        name: "Accesorios Móviles",
        slug: "mobile-accessories",
        description: "Accesorios, cargadores, cables y fundas para dispositivos móviles.",
    },
];

export const generateProductSlug = (title: string, id: number): string => {
    const base = title
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    return base ? `${base}-${id}` : `product-${id}`;
};

export const mapDummyToProductData = (
    item: DummyProductItem,
    categoryId: Types.ObjectId
) => {
    const slug = generateProductSlug(item.title, item.id);

    let discountPrice: number | undefined;
    if (item.discountPercentage && item.discountPercentage > 0 && item.discountPercentage < 100) {
        const calculated = Math.round(item.price * (1 - item.discountPercentage / 100) * 100) / 100;
        if (calculated < item.price) {
            discountPrice = calculated;
        }
    }

    const images: string[] = [];
    if (item.thumbnail) {
        images.push(item.thumbnail);
    }
    if (Array.isArray(item.images)) {
        for (const img of item.images) {
            if (img && !images.includes(img)) {
                images.push(img);
            }
        }
    }

    const specs: Record<string, string> = {
        dummyId: String(item.id),
    };
    if (item.warrantyInformation) specs.garantia = item.warrantyInformation;
    if (item.shippingInformation) specs.envio = item.shippingInformation;
    if (item.availabilityStatus) specs.disponibilidad = item.availabilityStatus;
    if (item.returnPolicy) specs.devolucion = item.returnPolicy;
    if (item.weight != null) specs.peso = `${item.weight} kg`;

    return {
        name: item.title,
        slug,
        description: item.description || item.title,
        price: Number(item.price),
        ...(discountPrice != null ? { discountPrice } : {}),
        stock: Math.max(0, Math.floor(item.stock ?? 10)),
        images,
        brand: item.brand || "Genérico",
        category: categoryId,
        specs,
        isFeatured: (item.rating ?? 0) >= 4.5,
        isActive: true,
    };
};

export const fetchDummyCategoryProducts = async (
    categorySlug: string
): Promise<DummyProductItem[]> => {
    const url = `https://dummyjson.com/products/category/${categorySlug}?limit=50`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new ApiError(502, `Error fetching from DummyJSON category ${categorySlug}: ${response.statusText}`);
    }

    const data = (await response.json()) as { products?: DummyProductItem[] };
    return data.products ?? [];
};

export const syncDummyTechProducts = async (): Promise<SyncDummyResult> => {
    let productsProcessed = 0;
    let productsInserted = 0;
    let productsUpdated = 0;
    const details: Array<{ category: string; count: number }> = [];

    for (const catConfig of DUMMY_TECH_CATEGORIES) {
        // Upsert Category
        const category = await Category.findOneAndUpdate(
            { slug: catConfig.slug },
            {
                $setOnInsert: {
                    name: catConfig.name,
                    slug: catConfig.slug,
                    description: catConfig.description,
                    isActive: true,
                },
            },
            { upsert: true, returnDocument: "after" }
        );

        if (!category) {
            continue;
        }

        const dummyProducts = await fetchDummyCategoryProducts(catConfig.dummySlug);
        details.push({
            category: catConfig.name,
            count: dummyProducts.length,
        });

        for (const item of dummyProducts) {
            productsProcessed++;
            const productData = mapDummyToProductData(item, category._id as Types.ObjectId);

            const existing = await Product.findOne({ slug: productData.slug });
            if (existing) {
                await Product.updateOne(
                    { _id: existing._id },
                    {
                        $set: {
                            name: productData.name,
                            description: productData.description,
                            price: productData.price,
                            ...(productData.discountPrice != null
                                ? { discountPrice: productData.discountPrice }
                                : {}),
                            stock: productData.stock,
                            images: productData.images,
                            brand: productData.brand,
                            specs: productData.specs,
                            isFeatured: productData.isFeatured,
                            isActive: true,
                        },
                    }
                );
                productsUpdated++;
            } else {
                await Product.create(productData);
                productsInserted++;
            }
        }
    }

    return {
        success: true,
        categoriesSynced: DUMMY_TECH_CATEGORIES.length,
        productsProcessed,
        productsInserted,
        productsUpdated,
        details,
    };
};
