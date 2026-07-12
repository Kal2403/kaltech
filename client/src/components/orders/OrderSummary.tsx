import type { Order } from "../../types/order.types";

import { OrderStatusBadge } from "./OrderStatusBadge";

interface OrderSummaryProps {
    order: Order;
}

export const OrderSummary = ({ order }: OrderSummaryProps) => {
    return (
        <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900">
                Resumen de la orden
            </h2>

            <div className="mt-6 space-y-4">
                <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                    <span>Impuestos</span>
                    <span>${order.tax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                    <span>Envío</span>
                    <span>
                        {order.shippingCost === 0
                            ? "Gratis"
                            : `$${order.shippingCost.toFixed(2)}`}
                    </span>
                </div>

                <div className="border-t border-slate-200 pt-4">
                    <div className="flex justify-between text-xl font-black text-slate-950">
                        <span>Total</span>
                        <span>${order.total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="mt-8 space-y-5 border-t border-slate-200 pt-6">
                <div>
                    <p className="text-sm font-semibold text-slate-500">
                        Método de pago
                    </p>

                    <p className="mt-1 font-bold capitalize text-slate-900">
                        {order.paymentMethod}
                    </p>
                </div>

                <div>
                    <p className="text-sm font-semibold text-slate-500">
                        Estado del pago
                    </p>

                    <p className="mt-1 font-bold capitalize text-slate-900">
                        {order.paymentStatus}
                    </p>
                </div>

                <div>
                    <p className="text-sm font-semibold text-slate-500">
                        Estado de la orden
                    </p>

                    <div className="mt-2">
                        <OrderStatusBadge status={order.orderStatus} />
                    </div>
                </div>
            </div>
        </aside>
    );
};
