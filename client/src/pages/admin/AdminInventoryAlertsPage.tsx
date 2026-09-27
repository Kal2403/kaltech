import { useState, useId } from "react";
import { Link } from "react-router-dom";
import {
    FiAlertTriangle,
    FiCheckCircle,
    FiEdit2,
    FiPackage,
    FiRefreshCw,
    FiX,
    FiXCircle,
} from "react-icons/fi";

import { useInventoryAlerts } from "../../hooks/admin/useInventoryAlerts";
import type { InventoryAlertFilter, Product } from "../../types/product.types";

const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR",
    }).format(price);
};

export const AdminInventoryAlertsPage = () => {
    const {
        alerts,
        summary,
        isLoading,
        error,
        filter,
        setFilter,
        refreshAlerts,
        restock,
    } = useInventoryAlerts();

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [additionalStock, setAdditionalStock] = useState<number>(10);
    const [newThreshold, setNewThreshold] = useState<number>(5);
    const [isRestocking, setIsRestocking] = useState(false);
    const [restockError, setRestockError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const additionalStockInputId = useId();
    const thresholdInputId = useId();

    const handleOpenRestockModal = (product: Product) => {
        setSelectedProduct(product);
        setAdditionalStock(10);
        setNewThreshold(product.lowStockThreshold ?? 5);
        setRestockError(null);
    };

    const handleCloseRestockModal = () => {
        if (isRestocking) return;
        setSelectedProduct(null);
        setRestockError(null);
    };

    const handleRestockSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) return;

        if (!additionalStock || additionalStock <= 0 || !Number.isInteger(additionalStock)) {
            setRestockError("La cantidad a añadir debe ser un número entero mayor que 0.");
            return;
        }

        if (newThreshold < 0 || !Number.isInteger(newThreshold)) {
            setRestockError("El umbral de alerta debe ser un número entero mayor o igual que 0.");
            return;
        }

        setIsRestocking(true);
        setRestockError(null);

        const success = await restock(
            selectedProduct._id,
            additionalStock,
            newThreshold
        );

        setIsRestocking(false);

        if (success) {
            setSuccessMessage(
                `¡${selectedProduct.name} reabastecido con éxito! (+${additionalStock} unidades).`
            );
            setSelectedProduct(null);
            setTimeout(() => setSuccessMessage(null), 5000);
        } else {
            setRestockError("No se pudo completar el reabastecimiento. Inténtalo de nuevo.");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Alertas de Inventario
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Supervisa existencias críticas y gestiona reabastecimientos directos.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => void refreshAlerts()}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    <FiRefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                    Actualizar
                </button>
            </div>

            {/* Notification messages */}
            {successMessage && (
                <div
                    role="alert"
                    className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
                >
                    <div className="flex items-center gap-2">
                        <FiCheckCircle className="h-5 w-5 text-emerald-600" />
                        <span>{successMessage}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setSuccessMessage(null)}
                        className="text-emerald-600 hover:text-emerald-800"
                        aria-label="Cerrar aviso"
                    >
                        <FiX className="h-4 w-4" />
                    </button>
                </div>
            )}

            {error && (
                <div
                    role="alert"
                    className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                >
                    <FiAlertTriangle className="h-5 w-5 text-red-600" />
                    <span>{error}</span>
                </div>
            )}

            {/* Metric Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Catálogo Activo
                            </p>
                            <p className="mt-2 text-3xl font-extrabold text-gray-900">
                                {summary?.totalActive ?? 0}
                            </p>
                        </div>
                        <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                            <FiPackage className="h-6 w-6" />
                        </div>
                    </div>
                    <p className="mt-3 text-xs text-gray-500">
                        Total de productos disponibles
                    </p>
                </div>

                <div
                    onClick={() => setFilter("out_of_stock")}
                    className={`cursor-pointer rounded-xl border p-5 shadow-sm transition hover:shadow-md ${
                        filter === "out_of_stock"
                            ? "border-red-500 bg-red-50/50 ring-2 ring-red-500/20"
                            : "border-gray-200 bg-white"
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-red-600">
                                Agotados
                            </p>
                            <p className="mt-2 text-3xl font-extrabold text-red-600">
                                {summary?.outOfStockCount ?? 0}
                            </p>
                        </div>
                        <div className="rounded-xl bg-red-100 p-3 text-red-600">
                            <FiXCircle className="h-6 w-6" />
                        </div>
                    </div>
                    <p className="mt-3 text-xs text-red-600 font-medium">
                        Sin unidades disponibles
                    </p>
                </div>

                <div
                    onClick={() => setFilter("low_stock")}
                    className={`cursor-pointer rounded-xl border p-5 shadow-sm transition hover:shadow-md ${
                        filter === "low_stock"
                            ? "border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20"
                            : "border-gray-200 bg-white"
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                                Stock Bajo
                            </p>
                            <p className="mt-2 text-3xl font-extrabold text-amber-600">
                                {summary?.lowStockCount ?? 0}
                            </p>
                        </div>
                        <div className="rounded-xl bg-amber-100 p-3 text-amber-600">
                            <FiAlertTriangle className="h-6 w-6" />
                        </div>
                    </div>
                    <p className="mt-3 text-xs text-amber-700 font-medium">
                        Por debajo del umbral fijado
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                                Stock Saludable
                            </p>
                            <p className="mt-2 text-3xl font-extrabold text-emerald-600">
                                {summary?.healthyStockCount ?? 0}
                            </p>
                        </div>
                        <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                            <FiCheckCircle className="h-6 w-6" />
                        </div>
                    </div>
                    <p className="mt-3 text-xs text-emerald-700 font-medium">
                        Inventario en nivel óptimo
                    </p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6">
                    {(
                        [
                            { key: "all", label: "Todos los avisos", count: (summary?.outOfStockCount ?? 0) + (summary?.lowStockCount ?? 0) },
                            { key: "out_of_stock", label: "Agotados", count: summary?.outOfStockCount ?? 0 },
                            { key: "low_stock", label: "Stock bajo", count: summary?.lowStockCount ?? 0 },
                        ] as const
                    ).map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setFilter(tab.key as InventoryAlertFilter)}
                            className={`flex items-center gap-2 border-b-2 py-3 text-sm font-semibold transition ${
                                filter === tab.key
                                    ? "border-blue-600 text-blue-600"
                                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                            }`}
                        >
                            <span>{tab.label}</span>
                            <span
                                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                                    filter === tab.key
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-gray-100 text-gray-600"
                                }`}
                            >
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Table or Empty State */}
            {isLoading ? (
                <div className="flex h-64 items-center justify-center rounded-2xl border border-gray-200 bg-white">
                    <div className="flex flex-col items-center gap-3">
                        <FiRefreshCw className="h-8 w-8 animate-spin text-blue-600" />
                        <p className="text-sm font-medium text-gray-500">
                            Cargando alertas de inventario...
                        </p>
                    </div>
                </div>
            ) : alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
                    <div className="rounded-full bg-emerald-50 p-4 text-emerald-600">
                        <FiCheckCircle className="h-10 w-10" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-gray-900">
                        {filter === "all"
                            ? "¡Todo el inventario está en niveles óptimos!"
                            : filter === "out_of_stock"
                            ? "No hay productos agotados"
                            : "No hay productos con stock bajo"}
                    </h3>
                    <p className="mt-1 max-w-md text-sm text-gray-500">
                        {filter === "all"
                            ? "No existen productos activos con existencias iguales o inferiores al umbral de alerta configurado."
                            : "Ningún producto activo coincide con el filtro seleccionado."}
                    </p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="border-b border-gray-200 bg-gray-50/75 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                <tr>
                                    <th scope="col" className="px-6 py-4">Producto</th>
                                    <th scope="col" className="px-6 py-4">Categoría</th>
                                    <th scope="col" className="px-6 py-4">Precio</th>
                                    <th scope="col" className="px-6 py-4">Stock Actual</th>
                                    <th scope="col" className="px-6 py-4">Umbral Alerta</th>
                                    <th scope="col" className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {alerts.map((product) => {
                                    const isOut = product.stock === 0;
                                    const threshold = product.lowStockThreshold ?? 5;

                                    return (
                                        <tr key={product._id} className="transition hover:bg-gray-50/50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={product.images[0] || "https://placehold.co/100"}
                                                        alt={product.name}
                                                        className="h-12 w-12 rounded-lg object-cover border border-gray-200 bg-gray-50"
                                                    />
                                                    <div>
                                                        <p className="font-semibold text-gray-900 line-clamp-1">
                                                            {product.name}
                                                        </p>
                                                        {product.brand && (
                                                            <p className="text-xs text-gray-400">
                                                                {product.brand}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                                {product.category?.name ?? "Sin categoría"}
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                                                {formatPrice(product.price)}
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4">
                                                {isOut ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
                                                        0 uds (Agotado)
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                                                        {product.stock} uds (Crítico)
                                                    </span>
                                                )}
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                                ≤ {threshold} uds
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenRestockModal(product)}
                                                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        Reabastecer
                                                    </button>
                                                    <Link
                                                        to={`/admin/products/${product._id}/edit`}
                                                        className="inline-flex items-center rounded-lg border border-gray-300 bg-white p-1.5 text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
                                                        title="Editar producto"
                                                    >
                                                        <FiEdit2 className="h-3.5 w-3.5" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Quick Restock Modal */}
            {selectedProduct && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="restock-modal-title"
                >
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl transition-all">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                            <div>
                                <h3 id="restock-modal-title" className="text-lg font-bold text-gray-900">
                                    Reabastecer Producto
                                </h3>
                                <p className="text-xs text-gray-500 line-clamp-1">
                                    {selectedProduct.name}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleCloseRestockModal}
                                disabled={isRestocking}
                                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
                            >
                                <FiX className="h-5 w-5" />
                            </button>
                        </div>

                        {restockError && (
                            <div className="mt-4 rounded-lg bg-red-50 p-3 text-xs text-red-700">
                                {restockError}
                            </div>
                        )}

                        <form onSubmit={(e) => void handleRestockSubmit(e)} className="mt-4 space-y-4">
                            <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 flex justify-between">
                                <span>Stock actual: <strong className="text-slate-900">{selectedProduct.stock} uds</strong></span>
                                <span>Umbral actual: <strong className="text-slate-900">{selectedProduct.lowStockThreshold ?? 5} uds</strong></span>
                            </div>

                            <div>
                                <label
                                    htmlFor={additionalStockInputId}
                                    className="block text-xs font-semibold uppercase text-gray-700 mb-1"
                                >
                                    Cantidad a Añadir
                                </label>
                                <input
                                    id={additionalStockInputId}
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={additionalStock}
                                    onChange={(e) => setAdditionalStock(parseInt(e.target.value, 10) || 0)}
                                    disabled={isRestocking}
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor={thresholdInputId}
                                    className="block text-xs font-semibold uppercase text-gray-700 mb-1"
                                >
                                    Nuevo Umbral de Alerta
                                </label>
                                <input
                                    id={thresholdInputId}
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={newThreshold}
                                    onChange={(e) => setNewThreshold(parseInt(e.target.value, 10) || 0)}
                                    disabled={isRestocking}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <p className="mt-1 text-[11px] text-gray-400">
                                    Se enviará un aviso cuando el stock baje a este valor o menos.
                                </p>
                            </div>

                            {/* Preview calculation */}
                            <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-3 text-xs text-blue-900">
                                Nuevo stock resultante:{" "}
                                <strong>{selectedProduct.stock}</strong> +{" "}
                                <strong>{additionalStock > 0 ? additionalStock : 0}</strong> ={" "}
                                <strong className="text-blue-700">
                                    {selectedProduct.stock + (additionalStock > 0 ? additionalStock : 0)} unidades
                                </strong>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleCloseRestockModal}
                                    disabled={isRestocking}
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isRestocking}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {isRestocking && <FiRefreshCw className="h-3.5 w-3.5 animate-spin" />}
                                    Confirmar Reabastecimiento
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
