import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { AdminOrderTable } from "../../components/admin/orders";
import { useAdminOrders } from "../../hooks/admin/useAdminOrders";
import { ROUTES } from "../../routes/paths";
import type { OrderStatus } from "../../types/order.types";

const orderStatusLabels: Record<OrderStatus, string> = {
    pending: "pendiente",
    processing: "procesando",
    shipped: "enviado",
    delivered: "entregado",
    cancelled: "cancelado",
};

export const AdminOrdersPage = () => {
    const navigate = useNavigate();

    const {
        orders,
        isLoading,
        error,
        updatingOrderId,
        pagination,
        goToPage,
        refreshOrders,
        changeOrderStatus,
    } = useAdminOrders();

    const [successMessage, setSuccessMessage] = useState<
        string | null
    >(null);

    const handleViewOrder = (orderId: string): void => {
        setSuccessMessage(null);
        navigate(`${ROUTES.adminOrders}/${orderId}`);
    };

    const handleStatusChange = async (
        orderId: string,
        orderStatus: OrderStatus
    ): Promise<void> => {
        setSuccessMessage(null);

        const wasUpdated = await changeOrderStatus(
            orderId,
            orderStatus
        );

        if (!wasUpdated) {
            return;
        }

        const shortOrderId = orderId.slice(-8).toUpperCase();

        setSuccessMessage(
            `El pedido #${shortOrderId} fue actualizado a "${orderStatusLabels[orderStatus]}".`
        );
    };

    const handleRefresh = async (): Promise<void> => {
        setSuccessMessage(null);
        await refreshOrders();
    };

    return (
        <section className="space-y-6">
            <header>
                <h1 className="text-3xl font-black tracking-tight text-slate-950">
                    Pedidos
                </h1>

                <p className="mt-1 text-sm text-gray-600">
                    Consulta los pedidos y actualiza su estado de
                    preparación y envío.
                </p>
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
                        className="min-h-11 rounded-md px-3 font-semibold text-green-700 transition-colors hover:bg-green-100 hover:text-green-900"
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
                    <p className="text-sm text-red-700">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() => void handleRefresh()}
                        className="min-h-11 self-start rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 sm:self-auto"
                    >
                        Reintentar
                    </button>
                </div>
            )}

            {isLoading ? (
                <div role="status" className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm" aria-busy="true">
                    <p className="text-sm font-medium text-gray-500">
                        Cargando pedidos...
                    </p>
                </div>
            ) : orders.length === 0 ? (
                <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white px-6 text-center">
                    <h2 className="text-lg font-semibold text-gray-900">
                        No hay pedidos
                    </h2>

                    <p className="mt-2 max-w-md text-sm text-gray-500">
                        Los nuevos pedidos realizados por los
                        clientes aparecerán aquí.
                    </p>

                    <button
                        type="button"
                        onClick={() => void handleRefresh()}
                        className="mt-5 rounded-md border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
                    >
                        Actualizar
                    </button>
                </div>
            ) : (
                <>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-gray-600">
                            {pagination.total}{" "}
                            {pagination.total === 1
                                ? "pedido registrado"
                                : "pedidos registrados"}
                        </p>

                        <button
                            type="button"
                            onClick={() => void handleRefresh()}
                            disabled={
                                isLoading ||
                                updatingOrderId !== null
                            }
                            className="self-start rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
                        >
                            Actualizar
                        </button>
                    </div>

                    <AdminOrderTable
                        orders={orders}
                        updatingOrderId={updatingOrderId}
                        onView={handleViewOrder}
                        onStatusChange={(
                            orderId,
                            orderStatus
                        ) => {
                            void handleStatusChange(
                                orderId,
                                orderStatus
                            );
                        }}
                    />
                    {pagination.totalPages > 1 && (
                        <nav aria-label="Paginación de pedidos" className="flex flex-wrap items-center justify-between gap-3">
                            <button type="button" disabled={!pagination.hasPreviousPage || isLoading} onClick={() => goToPage(pagination.page - 1)} className="min-h-11 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50">
                                Anterior
                            </button>
                            <p className="order-first w-full text-center text-sm text-gray-600 sm:order-none sm:w-auto">
                                Página {pagination.page} de {pagination.totalPages}
                            </p>
                            <button type="button" disabled={!pagination.hasNextPage || isLoading} onClick={() => goToPage(pagination.page + 1)} className="min-h-11 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50">
                                Siguiente
                            </button>
                        </nav>
                    )}
                </>
            )}
        </section>
    );
};
