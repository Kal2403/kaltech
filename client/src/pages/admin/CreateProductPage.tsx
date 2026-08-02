import { useNavigate } from "react-router-dom";

import { ProductForm } from "../../components/admin/products/ProductFrom";
import { useProductCategories } from "../../hooks/admin/useProductCategories";
import { useProductMutation } from "../../hooks/admin/useProductMutation";
import { ROUTES } from "../../routes/paths";
import type { CreateProductPayload } from "../../types/product.types";

export const CreateProductPage = () => {
    const navigate = useNavigate();

    const {
        categories,
        isLoading: categoriesLoading,
        error: categoriesError,
        refreshCategories,
    } = useProductCategories();

    const {
        isSubmitting,
        error: mutationError,
        create,
        clearError,
    } = useProductMutation();

    const handleSubmit = async (
        payload: CreateProductPayload
    ): Promise<void> => {
        const createdProduct = await create(payload);

        if (!createdProduct) {
            return;
        }

        navigate(ROUTES.adminProducts, {
            replace: true,
            state: {
                successMessage: `El producto "${createdProduct.name}" fue creado correctamente.`,
            },
        });
    };

    const handleCancel = (): void => {
        clearError();
        navigate(ROUTES.adminProducts);
    };

    const handleRetryCategories = (): void => {
        void refreshCategories();
    };

    return (
        <section className="space-y-6">
            <header>
                <button
                    type="button"
                    onClick={handleCancel}
                    className="mb-4 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
                >
                    Volver a productos
                </button>

                <h1 className="text-3xl font-black tracking-tight text-slate-950">
                    Crear producto
                </h1>

                <p className="mt-1 text-sm text-gray-600">
                    Agrega un nuevo producto al catálogo de la tienda.
                </p>
            </header>

            <ProductForm
                categories={categories}
                isSubmitting={isSubmitting}
                submitLabel="Crear producto"
                categoriesLoading={categoriesLoading}
                categoriesError={categoriesError}
                serverError={mutationError}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                onRetryCategories={handleRetryCategories}
            />
        </section>
    );
};
