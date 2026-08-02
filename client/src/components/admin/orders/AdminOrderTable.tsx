import type {
    AdminOrder,
    OrderStatus,
    PaymentStatus,
} from "../../../types/order.types";
import { getAvailableOrderStatuses } from "../../../utils/orderStatus";

interface AdminOrderTableProps {
    orders: AdminOrder[];
    updatingOrderId: string | null;
    onView: (orderId: string) => void;
    onStatusChange: (
        orderId: string,
        orderStatus: OrderStatus
    ) => void;
}

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

const paymentStatusLabels: Record<PaymentStatus, string> = {
    pending: "Pendiente",
    paid: "Pagado",
    failed: "Fallido",
};

const paymentStatusClasses: Record<PaymentStatus, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    paid: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
};

const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR",
    }).format(price);
};

const formatDate = (date: string): string => {
    return new Intl.DateTimeFormat("es-ES", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(date));
};

const getShortOrderId = (orderId: string): string => {
    return orderId.slice(-8).toUpperCase();
};

export const AdminOrderTable = ({
    orders,
    updatingOrderId,
    onView,
    onStatusChange,
}: AdminOrderTableProps) => {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
                            >
                                Pedido
                            </th>

                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
                            >
                                Cliente
                            </th>

                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
                            >
                                Fecha
                            </th>

                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
                            >
                                Total
                            </th>

                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
                            >
                                Pago
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
                        {orders.map((order) => {
                            const isUpdating =
                                updatingOrderId === order._id;

                            return (
                                <tr
                                    key={order._id}
                                    className="transition-colors hover:bg-gray-50"
                                >
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">
                                                #
                                                {getShortOrderId(
                                                    order._id
                                                )}
                                            </p>

                                            <p className="mt-1 text-xs text-gray-500">
                                                {order.items.length}{" "}
                                                {order.items.length === 1
                                                    ? "producto"
                                                    : "productos"}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="min-w-44">
                                            <p className="text-sm font-medium text-gray-900">
                                                {order.user.name}
                                            </p>

                                            <p className="mt-1 text-sm text-gray-500">
                                                {order.user.email}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                        {formatDate(order.createdAt)}
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                                        {formatPrice(order.total)}
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4">
                                        <span
                                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${paymentStatusClasses[
                                                order.paymentStatus
                                                ]
                                                }`}
                                        >
                                            {
                                                paymentStatusLabels[
                                                order.paymentStatus
                                                ]
                                            }
                                        </span>
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4">
                                        <label
                                            htmlFor={`order-status-${order._id}`}
                                            className="sr-only"
                                        >
                                            Estado del pedido #
                                            {getShortOrderId(order._id)}
                                        </label>

                                        <select
                                            id={`order-status-${order._id}`}
                                            value={order.orderStatus}
                                            disabled={isUpdating}
                                            onChange={(event) =>
                                                onStatusChange(
                                                    order._id,
                                                    event.target
                                                        .value as OrderStatus
                                                )
                                            }
                                            className="min-w-36 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-70"
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

                                        {isUpdating && (
                                            <p className="mt-1 text-xs font-medium text-blue-600">
                                                Actualizando...
                                            </p>
                                        )}
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4 text-right">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                onView(order._id)
                                            }
                                            disabled={isUpdating}
                                            className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Ver detalle
                                        </button>
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
