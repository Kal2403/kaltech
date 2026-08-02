import { useCallback, useEffect, useState } from "react";
import axios from "axios";

import { getCategories } from "../../services/category/category.service";
import type { Category } from "../../types/category.types";

interface ApiErrorResponse {
    message?: string;
}

interface UseProductCategoriesReturn {
    categories: Category[];
    isLoading: boolean;
    error: string | null;
    refreshCategories: () => Promise<void>;
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

export const useProductCategories =
    (): UseProductCategoriesReturn => {
        const [categories, setCategories] = useState<Category[]>([]);
        const [isLoading, setIsLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);

        const refreshCategories = useCallback(async (): Promise<void> => {
            try {
                setIsLoading(true);
                setError(null);

                const categoriesData = await getCategories();

                const activeCategories = categoriesData.filter(
                    (category) => category.isActive
                );

                setCategories(activeCategories);
            } catch (error: unknown) {
                setError(
                    getErrorMessage(
                        error,
                        "No se pudieron cargar las categorías."
                    )
                );
            } finally {
                setIsLoading(false);
            }
        }, []);

        useEffect(() => {
            const timeoutId = window.setTimeout(() => {
                void refreshCategories();
            }, 0);

            return () => window.clearTimeout(timeoutId);
        }, [refreshCategories]);

        return {
            categories,
            isLoading,
            error,
            refreshCategories,
        };
    };
