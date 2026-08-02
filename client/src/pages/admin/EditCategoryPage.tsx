import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

import { CategoryForm } from "../../components/admin/categories";
import { useCategoryMutation } from "../../hooks/admin/useCategoryMutation";
import { ROUTES } from "../../routes/paths";
import { getCategoryById } from "../../services/category/category.service";
import type {
    Category,
    CreateCategoryPayload,
} from "../../types/category.types";

interface ApiErrorResponse {
    message?: string;
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

export const EditCategoryPage = () => {
    const navigate = useNavigate();
    const { id: categoryId } = useParams<{ id: string }>();

    const [category, setCategory] = useState<Category | null>(null);
    const [isLoadingCategory, setIsLoadingCategory] = useState(true);
    const [categoryError, setCategoryError] = useState<string | null>(
        null
    );

    const {
        isSubmitting,
        error: mutationError,
        update,
        clearError,
    } = useCategoryMutation();

    const loadCategory = useCallback(async (): Promise<void> => {
        if (!categoryId) {
            setCategoryError(
                "El identificador de la categoría no es válido."
            );
            setIsLoadingCategory(false);
            return;
        }

        try {
            setIsLoadingCategory(true);
            setCategoryError(null);

            const categoryData = await getCategoryById(categoryId);

            setCategory(categoryData);
        } catch (error: unknown) {
            setCategoryError(
                getErrorMessage(
                    error,
                    "No se pudo cargar la categoría."
                )
            );
        } finally {
            setIsLoadingCategory(false);
        }
    }, [categoryId]);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void loadCategory();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [loadCategory]);

    const handleSubmit = async (
        payload: CreateCategoryPayload
    ): Promise<void> => {
        if (!categoryId) {
            return;
        }

        const updatedCategory = await update(
            categoryId,
            payload
        );

        if (!updatedCategory) {
            return;
        }

        navigate(ROUTES.adminCategories, {
            replace: true,
            state: {
                successMessage: `La categoría "${updatedCategory.name}" fue actualizada correctamente.`,
            },
        });
    };

    const handleCancel = (): void => {
        clearError();
        navigate(ROUTES.adminCategories);
    };

    if (isLoadingCategory) {
        return (
            <section className="space-y-6">
                <header>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Editar categoría
                    </h1>
                </header>

                <div className="flex min-h-64 items-center justify-center rounded-lg border border-gray-200 bg-white">
                    <p className="text-sm font-medium text-gray-500">
                        Cargando categoría...
                    </p>
                </div>
            </section>
        );
    }

    if (categoryError || !category) {
        return (
            <section className="space-y-6">
                <header>
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="mb-4 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
                    >
                        Volver a categorías
                    </button>

                    <h1 className="text-2xl font-bold text-gray-900">
                        Editar categoría
                    </h1>
                </header>

                <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 p-6"
                >
                    <p className="text-sm text-red-700">
                        {categoryError ??
                            "No se encontró la categoría solicitada."}
                    </p>

                    {categoryId && (
                        <button
                            type="button"
                            onClick={() => void loadCategory()}
                            className="mt-4 rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
                        >
                            Reintentar
                        </button>
                    )}
                </div>
            </section>
        );
    }

    return (
        <section className="space-y-6">
            <header>
                <button
                    type="button"
                    onClick={handleCancel}
                    className="mb-4 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
                >
                    Volver a categorías
                </button>

                <h1 className="text-2xl font-bold text-gray-900">
                    Editar categoría
                </h1>

                <p className="mt-1 text-sm text-gray-600">
                    Actualiza la información de {category.name}.
                </p>
            </header>

            <CategoryForm
                initialCategory={category}
                isSubmitting={isSubmitting}
                submitLabel="Guardar cambios"
                serverError={mutationError}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
            />
        </section>
    );
};
