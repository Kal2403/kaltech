export interface ProductCatgory {
    _id: string;
    name: string;
    slug: string;
}

export interface Product {
    _id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    discountPrice?: number;
    stock: number;
    images: string[];
    brand?: string;
    category: ProductCatgory;
    specs?: Record<string, string>;
    isFeatured: boolean;
    isActive: boolean;
}
