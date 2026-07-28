import type { Category } from "../../../types/category.types";

interface AdminCategoryTableProps {
    categories: Category[];
    deletingCategoryId: string | null;
    onEdit: (categoryId: string) => void;
    onDelete: (category: Category) => void;
}

export const AdminCategoryTable = ({
    categories,
    deletingCategoryId,
    onEdit,
    onDelete,
}: AdminCategoryTableProps) => {
    return (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
                            >
                                Categoría
                            </th>

                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
                            >
                                Slug
                            </th>

                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
                            >
                                Descripción
                            </th>

                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
                            >
                                Estado
                            </th>

                            <th
                                scope="col"
                                className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600"
                            >
                                Acciones
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200 bg-white">
                        {categories.map((category) => {
                            const isDeleting =
                                deletingCategoryId === category._id;

                            return (
                                <tr
                                    key={category._id}
                                    className="transition-colors hover:bg-gray-50"
                                >
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
                                                {category.image ? (
                                                    <img
                                                        src={category.image}
                                                        alt={category.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center px-1 text-center text-xs text-gray-400">
                                                        Sin imagen
                                                    </div>
                                                )}
                                            </div>

                                            <div className="min-w-0">
                                                <p className="max-w-xs truncate text-sm font-medium text-gray-900">
                                                    {category.name}
                                                </p>

                                                {category.createdAt && (
                                                    <p className="text-xs text-gray-500">
                                                        Creada el{" "}
                                                        {new Intl.DateTimeFormat(
                                                            "es-ES",
                                                            {
                                                                day: "2-digit",
                                                                month: "2-digit",
                                                                year: "numeric",
                                                            }
                                                        ).format(
                                                            new Date(
                                                                category.createdAt
                                                            )
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4">
                                        <code className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
                                            {category.slug}
                                        </code>
                                    </td>

                                    <td className="px-6 py-4">
                                        <p className="max-w-md truncate text-sm text-gray-600">
                                            {category.description ||
                                                "Sin descripción"}
                                        </p>
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4">
                                        <span
                                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                category.isActive
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-600"
                                            }`}
                                        >
                                            {category.isActive
                                                ? "Activa"
                                                : "Inactiva"}
                                        </span>
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onEdit(category._id)
                                                }
                                                disabled={isDeleting}
                                                className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                Editar
                                            </button>

                                            {category.isActive && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onDelete(category)
                                                    }
                                                    disabled={isDeleting}
                                                    className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {isDeleting
                                                        ? "Desactivando..."
                                                        : "Desactivar"}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
