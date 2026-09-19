export interface ProductCategory {
    _id: string;
    name: string;
    slug: string;
}

export interface ProductSpecs {
    [key: string]: string;
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
    category: ProductCategory | null;
    specs?: ProductSpecs;
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
    images: string[];
    brand?: string | null;
    category: string;
    specs?: ProductSpecs;
    isFeatured: boolean;
    isActive: boolean;
}

export type UpdateProductPayload = Partial<CreateProductPayload>;
