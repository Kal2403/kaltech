import { useCallback, useState } from "react";
import axios from "axios";

import {
    createCategory,
    updateCategory,
} from "../../services/category/category.service";
import type {
    Category,
    CreateCategoryPayload,
    UpdateCategoryPayload,
} from "../../types/category.types";

interface ApiErrorResponse {
    message?: string;
}

interface UseCategoryMutationReturn {
    isSubmitting: boolean;
    error: string | null;
    create: (
        payload: CreateCategoryPayload
    ) => Promise<Category | null>;
    update: (
        categoryId: string,
        payload: UpdateCategoryPayload
    ) => Promise<Category | null>;
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

export const useCategoryMutation =
    (): UseCategoryMutationReturn => {
        const [isSubmitting, setIsSubmitting] = useState(false);
        const [error, setError] = useState<string | null>(null);

        const clearError = useCallback((): void => {
            setError(null);
        }, []);

        const create = useCallback(
            async (
                payload: CreateCategoryPayload
            ): Promise<Category | null> => {
                try {
                    setIsSubmitting(true);
                    setError(null);

                    return await createCategory(payload);
                } catch (error: unknown) {
                    setError(
                        getErrorMessage(
                            error,
                            "No se pudo crear la categoría."
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
                categoryId: string,
                payload: UpdateCategoryPayload
            ): Promise<Category | null> => {
                try {
                    setIsSubmitting(true);
                    setError(null);

                    return await updateCategory(
                        categoryId,
                        payload
                    );
                } catch (error: unknown) {
                    setError(
                        getErrorMessage(
                            error,
                            "No se pudo actualizar la categoría."
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
