import { useEffect, useState } from "react";
import {
    useLocation,
    useNavigate,
    type Location,
} from "react-router-dom";

import { AdminProductTable } from "../../components/admin/products";
import { useAdminProducts } from "../../hooks/admin/useAdminProducts";
import { ROUTES } from "../../routes/paths";
import type { Product } from "../../types/product.types";

interface AdminProductsLocationState {
    successMessage?: string;
}

export const AdminProductsPage = () => {
    const navigate = useNavigate();

    const location =
        useLocation() as Location<AdminProductsLocationState | null>;

    const {
        products,
        isLoading,
        error,
        deletingProductId,
        refreshProducts,
        removeProduct,
    } = useAdminProducts();

    const [successMessage, setSuccessMessage] = useState<string | null>(
        location.state?.successMessage ?? null
    );

    useEffect(() => {
        if (!location.state?.successMessage) {
            return;
        }

        navigate(location.pathname, {
            replace: true,
            state: null,
        });
    }, [
        location.pathname,
        location.state?.successMessage,
        navigate,
    ]);

    const handleCreateProduct = (): void => {
        setSuccessMessage(null);
        navigate(`${ROUTES.adminProducts}/new`);
    };

    const handleEditProduct = (productId: string): void => {
        setSuccessMessage(null);
        navigate(`${ROUTES.adminProducts}/${productId}/edit`);
    };

    const handleDeleteProduct = async (
        product: Product
    ): Promise<void> => {
        const shouldDelete = window.confirm(
            `¿Estás seguro de eliminar el producto "${product.name}"?`
        );

        if (!shouldDelete) {
            return;
        }

        setSuccessMessage(null);

        const wasDeleted = await removeProduct(product._id);

        if (wasDeleted) {
            setSuccessMessage(
                `El producto "${product.name}" fue eliminado correctamente.`
            );
        }
    };

    const handleRefresh = async (): Promise<void> => {
        setSuccessMessage(null);
        await refreshProducts();
    };

    return (
        <section className="space-y-6">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Productos
                    </h1>

                    <p className="mt-1 text-sm text-gray-600">
                        Administra el catálogo de productos de la tienda.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleCreateProduct}
                    className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Crear producto
                </button>
            </header>

            {successMessage && (
                <div
                    role="status"
                    className="flex items-start justify-between gap-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
                >
                    <p>{successMessage}</p>

                    <button
                        type="button"
                        onClick={() => setSuccessMessage(null)}
                        aria-label="Cerrar mensaje"
                        className="font-semibold text-green-700 transition-colors hover:text-green-900"
                    >
                        Cerrar
                    </button>
                </div>
            )}

            {error && (
                <div
                    role="alert"
                    className="flex flex-col gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                    <p className="text-sm text-red-700">{error}</p>

                    <button
                        type="button"
                        onClick={() => void handleRefresh()}
                        className="self-start rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 sm:self-auto"
                    >
                        Reintentar
                    </button>
                </div>
            )}

            {isLoading ? (
                <div className="flex min-h-64 items-center justify-center rounded-lg border border-gray-200 bg-white">
                    <p className="text-sm font-medium text-gray-500">
                        Cargando productos...
                    </p>
                </div>
            ) : products.length === 0 ? (
                <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white px-6 text-center">
                    <h2 className="text-lg font-semibold text-gray-900">
                        No hay productos
                    </h2>

                    <p className="mt-2 max-w-md text-sm text-gray-500">
                        Crea el primer producto para comenzar a construir el
                        catálogo de la tienda.
                    </p>

                    <button
                        type="button"
                        onClick={handleCreateProduct}
                        className="mt-5 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                    >
                        Crear primer producto
                    </button>
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            {products.length}{" "}
                            {products.length === 1
                                ? "producto registrado"
                                : "productos registrados"}
                        </p>

                        <button
                            type="button"
                            onClick={() => void handleRefresh()}
                            disabled={isLoading}
                            className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Actualizar
                        </button>
                    </div>

                    <AdminProductTable
                        products={products}
                        deletingProductId={deletingProductId}
                        onEdit={handleEditProduct}
                        onDelete={(product) => {
                            void handleDeleteProduct(product);
                        }}
                    />
                </>
            )}
        </section>
    );
};
