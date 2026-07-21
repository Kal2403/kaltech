import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

import { ProductForm } from "../../components/admin/products/ProductFrom";
import { useProductCategories } from "../../hooks/admin/useProductCategories";
import { useProductMutation } from "../../hooks/admin/useProductMutation";
import { ROUTES } from "../../routes/paths";
import { getProductById } from "../../services/products/product.service";
import type {
    CreateProductPayload,
    Product,
} from "../../types/product.types";

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

export const EditProductPage = () => {
    const navigate = useNavigate();
    const { id: productId } = useParams<{ id: string }>();

    const [product, setProduct] = useState<Product | null>(null);
    const [isLoadingProduct, setIsLoadingProduct] = useState(true);
    const [productError, setProductError] = useState<string | null>(null);

    const {
        categories,
        isLoading: categoriesLoading,
        error: categoriesError,
        refreshCategories,
    } = useProductCategories();

    const {
        isSubmitting,
        error: mutationError,
        update,
        clearError,
    } = useProductMutation();

    const loadProduct = useCallback(async (): Promise<void> => {
        if (!productId) {
            setProductError("El identificador del producto no es válido.");
            setIsLoadingProduct(false);
            return;
        }

        try {
            setIsLoadingProduct(true);
            setProductError(null);

            const productData = await getProductById(productId);

            setProduct(productData);
        } catch (error: unknown) {
            setProductError(
                getErrorMessage(
                    error,
                    "No se pudo cargar el producto."
                )
            );
        } finally {
            setIsLoadingProduct(false);
        }
    }, [productId]);

    useEffect(() => {
        void loadProduct();
    }, [loadProduct]);

    const handleSubmit = async (
        payload: CreateProductPayload
    ): Promise<void> => {
        if (!productId) {
            return;
        }

        const updatedProduct = await update(productId, payload);

        if (!updatedProduct) {
            return;
        }

        navigate(ROUTES.adminProducts, {
            replace: true,
            state: {
                successMessage: `El producto "${updatedProduct.name}" fue actualizado correctamente.`,
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

    if (isLoadingProduct) {
        return (
            <section className="space-y-6">
                <header>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Editar producto
                    </h1>
                </header>

                <div className="flex min-h-64 items-center justify-center rounded-lg border border-gray-200 bg-white">
                    <p className="text-sm font-medium text-gray-500">
                        Cargando producto...
                    </p>
                </div>
            </section>
        );
    }

    if (productError || !product) {
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

                    <h1 className="text-2xl font-bold text-gray-900">
                        Editar producto
                    </h1>
                </header>

                <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 p-6"
                >
                    <p className="text-sm text-red-700">
                        {productError ??
                            "No se encontró el producto solicitado."}
                    </p>

                    {productId && (
                        <button
                            type="button"
                            onClick={() => void loadProduct()}
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
                    Volver a productos
                </button>

                <h1 className="text-2xl font-bold text-gray-900">
                    Editar producto
                </h1>

                <p className="mt-1 text-sm text-gray-600">
                    Actualiza la información de {product.name}.
                </p>
            </header>

            <ProductForm
                categories={categories}
                initialProduct={product}
                isSubmitting={isSubmitting}
                submitLabel="Guardar cambios"
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
