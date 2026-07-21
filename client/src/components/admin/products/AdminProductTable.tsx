import type { Product } from "../../../types/product.types";

interface AdminProductTableProps {
    products: Product[];
    deletingProductId: string | null;
    onEdit: (productId: string) => void;
    onDelete: (product: Product) => void;
}

const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR",
    }).format(price);
};

export const AdminProductTable = ({
    products,
    deletingProductId,
    onEdit,
    onDelete,
}: AdminProductTableProps) => {
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
                                Producto
                            </th>

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
                                Precio
                            </th>

                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
                            >
                                Stock
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
                        {products.map((product) => {
                            const isDeleting =
                                deletingProductId === product._id;

                            return (
                                <tr
                                    key={product._id}
                                    className="transition-colors hover:bg-gray-50"
                                >
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
                                                {product.images[0] ? (
                                                    <img
                                                        src={product.images[0]}
                                                        alt={product.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                                                        Sin imagen
                                                    </div>
                                                )}
                                            </div>

                                            <div className="min-w-0">
                                                <p className="max-w-xs truncate text-sm font-medium text-gray-900">
                                                    {product.name}
                                                </p>

                                                {product.brand && (
                                                    <p className="text-sm text-gray-500">
                                                        {product.brand}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                        {product.category.name}
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="flex flex-col">
                                            {product.discountPrice !==
                                            undefined ? (
                                                <>
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {formatPrice(
                                                            product.discountPrice
                                                        )}
                                                    </span>

                                                    <span className="text-xs text-gray-400 line-through">
                                                        {formatPrice(
                                                            product.price
                                                        )}
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-sm font-medium text-gray-900">
                                                    {formatPrice(product.price)}
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4">
                                        <span
                                            className={`text-sm font-medium ${
                                                product.stock > 0
                                                    ? "text-gray-700"
                                                    : "text-red-600"
                                            }`}
                                        >
                                            {product.stock}
                                        </span>
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4">
                                        <span
                                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                product.isActive
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-600"
                                            }`}
                                        >
                                            {product.isActive
                                                ? "Activo"
                                                : "Inactivo"}
                                        </span>
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onEdit(product._id)
                                                }
                                                disabled={isDeleting}
                                                className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                Editar
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onDelete(product)
                                                }
                                                disabled={isDeleting}
                                                className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {isDeleting
                                                    ? "Eliminando..."
                                                    : "Eliminar"}
                                            </button>
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
