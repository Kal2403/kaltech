import { useCallback, useEffect, useState } from "react";
import axios from "axios";

import {
    deleteProduct as deleteProductRequest,
    getProducts,
} from "../../services/products/product.service";
import type { Product } from "../../types/product.types";

interface ApiErrorResponse {
    message?: string;
}

interface UseAdminProductsReturn {
    products: Product[];
    isLoading: boolean;
    error: string | null;
    deletingProductId: string | null;
    refreshProducts: () => Promise<void>;
    removeProduct: (productId: string) => Promise<boolean>;
}

const getErrorMessage = (
    error: unknown,
    fallbackMessage: string
): string => {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallbackMessage;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return fallbackMessage;
};

export const useAdminProducts = (): UseAdminProductsReturn => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingProductId, setDeletingProductId] = useState<string | null>(
        null
    );

    const refreshProducts = useCallback(async (): Promise<void> => {
        try {
            setIsLoading(true);
            setError(null);

            const productsData = await getProducts();

            setProducts(productsData);
        } catch (error: unknown) {
            setError(
                getErrorMessage(
                    error,
                    "No se pudieron cargar los productos."
                )
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    const removeProduct = useCallback(
        async (productId: string): Promise<boolean> => {
            try {
                setDeletingProductId(productId);
                setError(null);

                await deleteProductRequest(productId);

                setProducts((currentProducts) =>
                    currentProducts.filter(
                        (product) => product._id !== productId
                    )
                );

                return true;
            } catch (error: unknown) {
                setError(
                    getErrorMessage(
                        error,
                        "No se pudo eliminar el producto."
                    )
                );

                return false;
            } finally {
                setDeletingProductId(null);
            }
        },
        []
    );

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void refreshProducts();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [refreshProducts]);

    return {
        products,
        isLoading,
        error,
        deletingProductId,
        refreshProducts,
        removeProduct,
    };
};
