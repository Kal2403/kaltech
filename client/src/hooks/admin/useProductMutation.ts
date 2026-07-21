import { useCallback, useState } from "react";
import axios from "axios";

import {
    createProduct,
    updateProduct,
} from "../../services/products/product.service";
import type {
    CreateProductPayload,
    Product,
    UpdateProductPayload,
} from "../../types/product.types";

interface ApiErrorResponse {
    message?: string;
}

interface UseProductMutationReturn {
    isSubmitting: boolean;
    error: string | null;
    create: (
        payload: CreateProductPayload
    ) => Promise<Product | null>;
    update: (
        productId: string,
        payload: UpdateProductPayload
    ) => Promise<Product | null>;
    clearError: () => void;
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

export const useProductMutation =
    (): UseProductMutationReturn => {
        const [isSubmitting, setIsSubmitting] = useState(false);
        const [error, setError] = useState<string | null>(null);

        const clearError = useCallback((): void => {
            setError(null);
        }, []);

        const create = useCallback(
            async (
                payload: CreateProductPayload
            ): Promise<Product | null> => {
                try {
                    setIsSubmitting(true);
                    setError(null);

                    return await createProduct(payload);
                } catch (error: unknown) {
                    setError(
                        getErrorMessage(
                            error,
                            "No se pudo crear el producto."
                        )
                    );

                    return null;
                } finally {
                    setIsSubmitting(false);
                }
            },
            []
        );

        const update = useCallback(
            async (
                productId: string,
                payload: UpdateProductPayload
            ): Promise<Product | null> => {
                try {
                    setIsSubmitting(true);
                    setError(null);

                    return await updateProduct(productId, payload);
                } catch (error: unknown) {
                    setError(
                        getErrorMessage(
                            error,
                            "No se pudo actualizar el producto."
                        )
                    );

                    return null;
                } finally {
                    setIsSubmitting(false);
                }
            },
            []
        );

        return {
            isSubmitting,
            error,
            create,
            update,
            clearError,
        };
    };
