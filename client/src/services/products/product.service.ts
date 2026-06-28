import { api } from "../../api/axios";
import type { Product } from "../../types/product.types";;

interface ProductsResponse {
    success: boolean;
    message: string;
    data: {
        products: Product[];
    };
};

export const getProducts = async (): Promise<Product[]> => {
    const response = await api.get<ProductsResponse>("/products");

    return response.data.data.products;
};
