import { useState } from "react";
import {
    useNavigate,
    useParams,
} from "react-router-dom";

import { useAdminOrderDetails } from "../../hooks/admin/useAdminOrderDetails";
import { ROUTES } from "../../routes/paths";
import type {
    AdminOrder,
    OrderItem,
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
} from "../../types/order.types";
import { getAvailableOrderStatuses } from "../../utils/orderStatus";

const orderStatusOptions: Array<{
    value: OrderStatus;
    label: string;
}> = [
    {
        value: "pending",
        label: "Pendiente",
    },
    {
        value: "processing",
        label: "Procesando",
    },
    {
        value: "shipped",
        label: "Enviado",
    },
    {
        value: "delivered",
        label: "Entregado",
    },
    {
        value: "cancelled",
        label: "Cancelado",
    },
];

const orderStatusLabels: Record<
    OrderStatus,
    string
> = {
    pending: "Pendiente",
    processing: "Procesando",
    shipped: "Enviado",
    delivered: "Entregado",
    cancelled: "Cancelado",
};

const orderStatusClasses: Record<
    OrderStatus,
    string
> = {
    pending: "bg-yellow-100 text-yellow-700",
    processing: "bg-blue-100 text-blue-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
};

const paymentStatusLabels: Record<
    PaymentStatus,
    string
> = {
    pending: "Pendiente",
    paid: "Pagado",
    failed: "Fallido",
};

const paymentStatusClasses: Record<
    PaymentStatus,
    string
> = {
    pending: "bg-yellow-100 text-yellow-700",
    paid: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
};

const paymentMethodLabels: Record<
    PaymentMethod,
    string
> = {
    card: "Tarjeta",
    paypal: "PayPal",
    cash: "Pago contra entrega",
};

const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR",
    }).format(price);
};

const formatDate = (date: string): string => {
    return new Intl.DateTimeFormat("es-ES", {
        dateStyle: "long",
        timeStyle: "short",
    }).format(new Date(date));
};

const getShortOrderId = (
    orderId: string
): string => {
    return orderId.slice(-8).toUpperCase();
};

const getProductImage = (
    item: OrderItem
): string | undefined => {
    if (item.image) {
        return item.image;
    }

    if (
        typeof item.product !== "string" &&
        item.product.images?.length
    ) {
        return item.product.images[0];
    }

    return undefined;
};

interface OrderItemsSectionProps {
    order: AdminOrder;
}

const OrderItemsSection = ({
    order,
}: OrderItemsSectionProps) => {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                    Productos
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    {order.items.length}{" "}
                    {order.items.length === 1
                        ? "producto incluido"
                        : "productos incluidos"}
                </p>
            </div>

            <div className="divide-y divide-gray-200">
                {order.items.map((item, index) => {
                    const image =
                        getProductImage(item);

                    return (
                        <article
                            key={`${order._id}-${index}-${item.name}`}
                            className="flex gap-4 py-5 first:pt-0 last:pb-0"
                        >
                            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
                                {image ? (
                                    <img
                                        src={image}
                                        alt={item.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center px-2 text-center text-xs text-gray-400">
                                        Sin imagen
                                    </div>
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-gray-900">
                                    {item.name}
                                </h3>

                                <p className="mt-1 text-sm text-gray-500">
                                    Cantidad: {item.quantity}
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                    Precio unitario:{" "}
                                    {formatPrice(item.price)}
                                </p>
                            </div>

                            <p className="shrink-0 text-sm font-semibold text-gray-900">
                                {formatPrice(
                                    item.price *
                                        item.quantity
                                )}
                            </p>
                        </article>
                    );
                })}
            </div>
        </section>
    );
};

export const AdminOrderDetailsPage = () => {
    const navigate = useNavigate();
    const { id: orderId } =
        useParams<{ id: string }>();

    const {
        order,
        isLoading,
        isUpdatingStatus,
        error,
        reloadOrder,
        changeOrderStatus,
    } = useAdminOrderDetails(orderId);

    const [successMessage, setSuccessMessage] =
        useState<string | null>(null);

    const handleBack = (): void => {
        navigate(ROUTES.adminOrders);
    };

    const handleStatusChange = async (
        orderStatus: OrderStatus
    ): Promise<void> => {
        setSuccessMessage(null);

        const wasUpdated =
            await changeOrderStatus(orderStatus);

        if (!wasUpdated) {
            return;
        }

        setSuccessMessage(
            `El estado del pedido fue actualizado a "${orderStatusLabels[orderStatus]}".`
        );
    };

    if (isLoading) {
        return (
            <section className="space-y-6">
                <header>
                    <button
                        type="button"
                        onClick={handleBack}
                        className="mb-4 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
                    >
                        Volver a pedidos
                    </button>

                    <h1 className="text-3xl font-black tracking-tight text-slate-950">
                        Detalle del pedido
                    </h1>
                </header>

                <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm" aria-busy="true">
                    <p className="text-sm font-medium text-gray-500">
                        Cargando pedido...
                    </p>
                </div>
            </section>
        );
    }

    if (error || !order) {
        return (
            <section className="space-y-6">
                <header>
                    <button
                        type="button"
                        onClick={handleBack}
                        className="mb-4 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
                    >
                        Volver a pedidos
                    </button>

                    <h1 className="text-3xl font-black tracking-tight text-slate-950">
                        Detalle del pedido
                    </h1>
                </header>

                <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 p-6"
                >
                    <p className="text-sm text-red-700">
                        {error ??
                            "No se encontró el pedido solicitado."}
                    </p>

                    {orderId && (
                        <button
                            type="button"
                            onClick={() =>
                                void reloadOrder()
                            }
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
            <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <button
                        type="button"
                        onClick={handleBack}
                        className="mb-4 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
                    >
                        Volver a pedidos
                    </button>

                    <h1 className="text-3xl font-black tracking-tight text-slate-950">
                        Pedido #
                        {getShortOrderId(order._id)}
                    </h1>

                    <p className="mt-1 text-sm text-gray-600">
                        Realizado el{" "}
                        {formatDate(order.createdAt)}
                    </p>
                </div>

                <span
                    className={`inline-flex self-start rounded-full px-3 py-1.5 text-sm font-semibold ${
                        orderStatusClasses[
                            order.orderStatus
                        ]
                    }`}
                >
                    {
                        orderStatusLabels[
                            order.orderStatus
                        ]
                    }
                </span>
            </header>

            {successMessage && (
                <div
                    role="status"
                    className="flex items-start justify-between gap-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
                >
                    <p>{successMessage}</p>

                    <button
                        type="button"
                        onClick={() =>
                            setSuccessMessage(null)
                        }
                        className="font-semibold text-green-700 transition-colors hover:text-green-900"
                    >
                        Cerrar
                    </button>
                </div>
            )}

            {error && (
                <div
                    role="alert"
                    className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {error}
                </div>
            )}

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="space-y-6">
                    <OrderItemsSection order={order} />

                    <section className="grid gap-6 md:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Cliente
                            </h2>

                            <div className="mt-4 space-y-2 text-sm text-gray-600">
                                <p className="font-semibold text-gray-900">
                                    {order.user.name}
                                </p>

                                <p>{order.user.email}</p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Dirección de envío
                            </h2>

                            <div className="mt-4 space-y-2 text-sm text-gray-600">
                                <p className="font-semibold text-gray-900">
                                    {
                                        order
                                            .shippingAddress
                                            .fullName
                                    }
                                </p>

                                <p>
                                    {
                                        order
                                            .shippingAddress
                                            .address
                                    }
                                </p>

                                <p>
                                    {
                                        order
                                            .shippingAddress
                                            .city
                                    }
                                    ,{" "}
                                    {
                                        order
                                            .shippingAddress
                                            .postalCode
                                    }
                                </p>

                                <p>
                                    {
                                        order
                                            .shippingAddress
                                            .country
                                    }
                                </p>

                                <p>
                                    {
                                        order
                                            .shippingAddress
                                            .phone
                                    }
                                </p>
                            </div>
                        </div>
                    </section>
                </div>

                <aside className="space-y-6">
                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Estado del pedido
                        </h2>

                        <label
                            htmlFor="orderStatus"
                            className="mt-5 block text-sm font-medium text-gray-700"
                        >
                            Actualizar estado
                        </label>

                        <select
                            id="orderStatus"
                            value={order.orderStatus}
                            disabled={isUpdatingStatus}
                            onChange={(event) => {
                                void handleStatusChange(
                                    event.target
                                        .value as OrderStatus
                                );
                            }}
                            className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                        >
                            {orderStatusOptions
                                .filter((option) =>
                                    getAvailableOrderStatuses(order.orderStatus).includes(option.value)
                                )
                                .map(
                                (option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                )
                            )}
                        </select>

                        {isUpdatingStatus && (
                            <p className="mt-2 text-sm font-medium text-blue-600">
                                Actualizando estado...
                            </p>
                        )}
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Pago
                        </h2>

                        <div className="mt-5 space-y-4">
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-sm text-gray-500">
                                    Método
                                </span>

                                <span className="text-sm font-medium text-gray-900">
                                    {
                                        paymentMethodLabels[
                                            order
                                                .paymentMethod
                                        ]
                                    }
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <span className="text-sm text-gray-500">
                                    Estado
                                </span>

                                <span
                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                        paymentStatusClasses[
                                            order
                                                .paymentStatus
                                        ]
                                    }`}
                                >
                                    {
                                        paymentStatusLabels[
                                            order
                                                .paymentStatus
                                        ]
                                    }
                                </span>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Resumen
                        </h2>

                        <dl className="mt-5 space-y-4">
                            <div className="flex items-center justify-between gap-4 text-sm">
                                <dt className="text-gray-500">
                                    Subtotal
                                </dt>

                                <dd className="font-medium text-gray-900">
                                    {formatPrice(
                                        order.subtotal
                                    )}
                                </dd>
                            </div>

                            <div className="flex items-center justify-between gap-4 text-sm">
                                <dt className="text-gray-500">
                                    Impuestos
                                </dt>

                                <dd className="font-medium text-gray-900">
                                    {formatPrice(
                                        order.tax
                                    )}
                                </dd>
                            </div>

                            <div className="flex items-center justify-between gap-4 text-sm">
                                <dt className="text-gray-500">
                                    Envío
                                </dt>

                                <dd className="font-medium text-gray-900">
                                    {formatPrice(
                                        order.shippingCost
                                    )}
                                </dd>
                            </div>

                            <div className="flex items-center justify-between gap-4 border-t border-gray-200 pt-4">
                                <dt className="font-semibold text-gray-900">
                                    Total
                                </dt>

                                <dd className="text-lg font-bold text-gray-900">
                                    {formatPrice(order.total)}
                                </dd>
                            </div>
                        </dl>
                    </section>
                </aside>
            </div>
        </section>
    );
};
