import { api } from "../../api/axios";
import type { Product } from "../../types/product.types";;

interface ProductsResponse {
    success: boolean;
    message: string;
    data: {
        products: Product[];
    };
};

interface ProductResponse {
  success: boolean;
  message: string;
  data: {
    product: Product;
  };
}

export const getProducts = async (): Promise<Product[]> => {
    const response = await api.get<ProductsResponse>("/products");

    return response.data.data.products;
};

export const getProductById = async (id: string): Promise<Product> => {
  const response = await api.get<ProductResponse>(`/products/${id}`);

  return response.data.data.product;
};
