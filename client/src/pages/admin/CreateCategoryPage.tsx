import { useNavigate } from "react-router-dom";

import { CategoryForm } from "../../components/admin/categories";
import { useCategoryMutation } from "../../hooks/admin/useCategoryMutation";
import { ROUTES } from "../../routes/paths";
import type { CreateCategoryPayload } from "../../types/category.types";

export const CreateCategoryPage = () => {
    const navigate = useNavigate();

    const {
        isSubmitting,
        error,
        create,
        clearError,
    } = useCategoryMutation();

    const handleSubmit = async (
        payload: CreateCategoryPayload
    ): Promise<void> => {
        const createdCategory = await create(payload);

        if (!createdCategory) {
            return;
        }

        navigate(ROUTES.adminCategories, {
            replace: true,
            state: {
                successMessage: `La categoría "${createdCategory.name}" fue creada correctamente.`,
            },
        });
    };

    const handleCancel = (): void => {
        clearError();
        navigate(ROUTES.adminCategories);
    };

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
                    Crear categoría
                </h1>

                <p className="mt-1 text-sm text-gray-600">
                    Agrega una nueva categoría al catálogo de la tienda.
                </p>
            </header>

            <CategoryForm
                isSubmitting={isSubmitting}
                submitLabel="Crear categoría"
                serverError={error}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
            />
        </section>
    );
};
