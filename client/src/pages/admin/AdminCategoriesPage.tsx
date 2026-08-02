import { useEffect, useState } from "react";
import {
    useLocation,
    useNavigate,
    type Location,
} from "react-router-dom";

import { AdminCategoryTable } from "../../components/admin/categories";
import { useAdminCategories } from "../../hooks/admin/useAdminCategories";
import { ROUTES } from "../../routes/paths";
import type { Category } from "../../types/category.types";

interface AdminCategoriesLocationState {
    successMessage?: string;
}

export const AdminCategoriesPage = () => {
    const navigate = useNavigate();

    const location =
        useLocation() as Location<AdminCategoriesLocationState | null>;

    const {
        categories,
        isLoading,
        error,
        deletingCategoryId,
        refreshCategories,
        removeCategory,
    } = useAdminCategories();

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

    const handleCreateCategory = (): void => {
        setSuccessMessage(null);
        navigate(`${ROUTES.adminCategories}/new`);
    };

    const handleEditCategory = (categoryId: string): void => {
        setSuccessMessage(null);
        navigate(`${ROUTES.adminCategories}/${categoryId}/edit`);
    };

    const handleDeleteCategory = async (
        category: Category
    ): Promise<void> => {
        const shouldDelete = window.confirm(
            `¿Estás seguro de desactivar la categoría "${category.name}"?`
        );

        if (!shouldDelete) {
            return;
        }

        setSuccessMessage(null);

        const wasDeleted = await removeCategory(category._id);

        if (wasDeleted) {
            setSuccessMessage(
                `La categoría "${category.name}" fue desactivada correctamente.`
            );
        }
    };

    const handleRefresh = async (): Promise<void> => {
        setSuccessMessage(null);
        await refreshCategories();
    };

    return (
        <section className="space-y-6">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-950">
                        Categorías
                    </h1>

                    <p className="mt-1 text-sm text-gray-600">
                        Administra las categorías disponibles en el catálogo.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleCreateCategory}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                    Crear categoría
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
                <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm" aria-busy="true">
                    <p className="text-sm font-medium text-gray-500">
                        Cargando categorías...
                    </p>
                </div>
            ) : categories.length === 0 ? (
                <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white px-6 text-center">
                    <h2 className="text-lg font-semibold text-gray-900">
                        No hay categorías
                    </h2>

                    <p className="mt-2 max-w-md text-sm text-gray-500">
                        Crea la primera categoría para comenzar a organizar los
                        productos del catálogo.
                    </p>

                    <button
                        type="button"
                        onClick={handleCreateCategory}
                        className="mt-5 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                    >
                        Crear primera categoría
                    </button>
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            {categories.length}{" "}
                            {categories.length === 1
                                ? "categoría registrada"
                                : "categorías registradas"}
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

                    <AdminCategoryTable
                        categories={categories}
                        deletingCategoryId={deletingCategoryId}
                        onEdit={handleEditCategory}
                        onDelete={(category) => {
                            void handleDeleteCategory(category);
                        }}
                    />
                </>
            )}
        </section>
    );
};
