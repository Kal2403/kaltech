import { api } from "../../api/axios";

import type {
    CreateProductPayload,
    Product,
    UpdateProductPayload,
} from "../../types/product.types";

interface ProductsResponse {
    success: boolean;
    message: string;
    data: {
        products: Product[];
    };
}

interface ProductResponse {
    success: boolean;
    message: string;
    data: {
        product: Product;
    };
}

interface DeleteProductResponse {
    success: boolean;
    message: string;
}

export const getProducts = async (): Promise<Product[]> => {
    const response = await api.get<ProductsResponse>("/products");

    return response.data.data.products;
};

export const getProductById = async (id: string): Promise<Product> => {
    const response = await api.get<ProductResponse>(`/products/${id}`);

    return response.data.data.product;
};

export const createProduct = async (
    payload: CreateProductPayload
): Promise<Product> => {
    const response = await api.post<ProductResponse>(
        "/products",
        payload
    );

    return response.data.data.product;
};

export const updateProduct = async (
    productId: string,
    payload: UpdateProductPayload
): Promise<Product> => {
    const response = await api.patch<ProductResponse>(
        `/products/${productId}`,
        payload
    );

    return response.data.data.product;
};

export const deleteProduct = async (
    productId: string
): Promise<void> => {
    await api.delete<DeleteProductResponse>(
        `/products/${productId}`
    );
};
