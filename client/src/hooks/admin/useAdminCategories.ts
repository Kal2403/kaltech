import { useCallback, useEffect, useState } from "react";
import axios from "axios";

import {
    deleteCategory as deleteCategoryRequest,
    getAdminCategories,
} from "../../services/category/category.service";
import type { Category } from "../../types/category.types";

interface ApiErrorResponse {
    message?: string;
}

interface UseAdminCategoriesReturn {
    categories: Category[];
    isLoading: boolean;
    error: string | null;
    deletingCategoryId: string | null;
    refreshCategories: () => Promise<void>;
    removeCategory: (categoryId: string) => Promise<boolean>;
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

export const useAdminCategories = (): UseAdminCategoriesReturn => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingCategoryId, setDeletingCategoryId] = useState<
        string | null
    >(null);

    const refreshCategories = useCallback(async (): Promise<void> => {
        try {
            setIsLoading(true);
            setError(null);

            const categoriesData = await getAdminCategories();

            setCategories(categoriesData);
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

    const removeCategory = useCallback(
        async (categoryId: string): Promise<boolean> => {
            try {
                setDeletingCategoryId(categoryId);
                setError(null);

                const deactivatedCategory =
                    await deleteCategoryRequest(categoryId);

                setCategories((currentCategories) =>
                    currentCategories.map((category) =>
                        category._id === deactivatedCategory._id
                            ? deactivatedCategory
                            : category
                    )
                );

                return true;
            } catch (error: unknown) {
                setError(
                    getErrorMessage(
                        error,
                        "No se pudo desactivar la categoría."
                    )
                );

                return false;
            } finally {
                setDeletingCategoryId(null);
            }
        },
        []
    );

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
        deletingCategoryId,
        refreshCategories,
        removeCategory,
    };
};
