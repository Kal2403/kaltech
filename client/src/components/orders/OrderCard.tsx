import { Link } from "react-router-dom";

import type { Order } from "../../types/order.types";
import { OrderStatusBadge } from "./OrderStatusBadge";

interface OrderCardProps {
    order: Order;
}

export const OrderCard = ({ order }: OrderCardProps) => {
    const formattedDate = new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(order.createdAt));

    const totalProducts = order.items.reduce(
        (accumulator, item) => accumulator + item.quantity,
        0
    );

    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
                        Orden
                    </p>

                    <h2 className="mt-1 text-xl font-black text-slate-950">
                        #{order._id}
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        Realizada el {formattedDate}
                    </p>
                </div>

                <OrderStatusBadge status={order.orderStatus} />
            </div>

            <div className="mt-6 grid gap-4 border-y border-slate-200 py-5 sm:grid-cols-3">
                <div>
                    <p className="text-sm text-slate-500">
                        Productos
                    </p>

                    <p className="mt-1 font-bold text-slate-900">
                        {totalProducts}
                    </p>
                </div>

                <div>
                    <p className="text-sm text-slate-500">
                        Método de pago
                    </p>

                    <p className="mt-1 font-bold capitalize text-slate-900">
                        {order.paymentMethod}
                    </p>
                </div>

                <div>
                    <p className="text-sm text-slate-500">
                        Total
                    </p>

                    <p className="mt-1 font-black text-slate-950">
                        ${order.total.toFixed(2)}
                    </p>
                </div>
            </div>

            <div className="mt-6 flex justify-end">
                <Link
                    to={`/orders/${order._id}`}
                    className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                    Ver detalles
                </Link>
            </div>
        </article>
    );
};
