export interface ProductCategory {
    _id: string;
    name: string;
    slug: string;
}

export interface ProductSpecs {
    [key: string]: string;
}

export interface ProductReview {
    rating: number;
    comment: string;
    date: string;
    reviewerName: string;
    reviewerEmail?: string;
}

export interface Product {
    _id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    discountPrice?: number;
    stock: number;
    lowStockThreshold?: number;
    images: string[];
    brand?: string;
    category: ProductCategory | null;
    specs?: ProductSpecs;
    rating?: number;
    reviewsCount?: number;
    reviews?: ProductReview[];
    isFeatured: boolean;
    isActive: boolean;
}

export interface CreateProductPayload {
    name: string;
    slug?: string;
    description: string;
    price: number;
    discountPrice?: number | null;
    stock: number;
    lowStockThreshold?: number;
    images: string[];
    brand?: string | null;
    category: string;
    specs?: ProductSpecs;
    isFeatured: boolean;
    isActive: boolean;
}

export type UpdateProductPayload = Partial<CreateProductPayload>;

export interface InventorySummary {
    totalActive: number;
    outOfStockCount: number;
    lowStockCount: number;
    healthyStockCount: number;
}

export type InventoryAlertFilter = "all" | "low_stock" | "out_of_stock";

export interface InventoryAlertsResponse {
    summary: InventorySummary;
    alerts: Product[];
}
