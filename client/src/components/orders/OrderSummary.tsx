import { FiCheckCircle, FiClock, FiCreditCard, FiLock } from "react-icons/fi";
import type { Order } from "../../types/order.types";
import { OrderStatusBadge } from "./OrderStatusBadge";

interface OrderSummaryProps {
    order: Order;
    onPayNow?: () => void;
}

const paymentLabels = {
    cash: "Contra entrega (Efectivo)",
    card: "Tarjeta de crédito o débito",
    paypal: "PayPal",
} as const;

export const OrderSummary = ({ order, onPayNow }: OrderSummaryProps) => {
    const isPaid = order.paymentStatus === "paid";
    const isPending = order.paymentStatus === "pending";
    const isFailed = order.paymentStatus === "failed";
    const canPay = (isPending || isFailed) && order.orderStatus !== "cancelled" && order.paymentMethod !== "cash";

    const formattedPaidAt = order.paidAt
        ? new Intl.DateTimeFormat("es-ES", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
          }).format(new Date(order.paidAt))
        : null;

    return (
        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_70px_-38px_rgba(15,23,42,0.4)] lg:sticky lg:top-24">
            <h2 className="text-xl font-black text-slate-950">Resumen de la orden</h2>

            <dl className="mt-6 space-y-4 text-sm">
                <div className="flex justify-between text-slate-600">
                    <dt>Subtotal</dt>
                    <dd className="font-bold text-slate-900">${order.subtotal.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between text-slate-600">
                    <dt>Impuestos (18%)</dt>
                    <dd className="font-bold text-slate-900">${order.tax.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between text-slate-600">
                    <dt>Envío</dt>
                    <dd className="font-bold text-slate-900">
                        {order.shippingCost === 0 ? "Gratis" : `$${order.shippingCost.toFixed(2)}`}
                    </dd>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-5 text-xl font-black text-slate-950">
                    <dt>Total</dt>
                    <dd className="text-blue-600">${order.total.toFixed(2)}</dd>
                </div>
            </dl>

            <dl className="mt-7 grid gap-5 border-t border-slate-200 pt-6 text-sm">
                <div>
                    <dt className="font-semibold text-slate-500">Método de pago</dt>
                    <dd className="mt-1 font-bold text-slate-950">
                        {paymentLabels[order.paymentMethod] || order.paymentMethod}
                    </dd>
                </div>

                <div>
                    <dt className="font-semibold text-slate-500">Estado del pago</dt>
                    <dd className="mt-1.5">
                        {isPaid && (
                            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-emerald-900">
                                <div className="flex items-center gap-2 font-bold text-emerald-800">
                                    <FiCheckCircle className="text-base text-emerald-600 shrink-0" />
                                    <span>Pagado</span>
                                </div>
                                {formattedPaidAt && (
                                    <p className="mt-1 text-xs text-emerald-700">
                                        Fecha: {formattedPaidAt}
                                    </p>
                                )}
                                {order.paymentResult?.id && (
                                    <p className="mt-0.5 font-mono text-[0.7rem] text-emerald-600 break-all">
                                        ID: {order.paymentResult.id}
                                    </p>
                                )}
                            </div>
                        )}

                        {isPending && (
                            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-3.5 text-amber-900">
                                <div className="flex items-center gap-2 font-bold text-amber-800">
                                    <FiClock className="text-base text-amber-600 shrink-0" />
                                    <span>
                                        {order.paymentMethod === "cash" ? "Pendiente de cobro" : "Pendiente de pago"}
                                    </span>
                                </div>
                                <p className="mt-1 text-xs text-amber-700">
                                    {order.paymentMethod === "cash"
                                        ? "Pagas en efectivo al recibir el paquete en tu domicilio."
                                        : "Esta orden requiere pago para iniciar su preparación."}
                                </p>
                            </div>
                        )}

                        {isFailed && (
                            <div className="rounded-2xl border border-red-200 bg-red-50/80 p-3.5 text-red-900">
                                <p className="font-bold text-red-800">Pago fallido</p>
                                <p className="mt-1 text-xs text-red-700">
                                    No se pudo procesar el pago anterior.
                                </p>
                            </div>
                        )}
                    </dd>
                </div>

                {canPay && onPayNow && (
                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={onPayNow}
                            className="flex w-full min-h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                        >
                            <FiCreditCard className="text-lg" />
                            Pagar orden ahora
                        </button>
                    </div>
                )}

                <div>
                    <dt className="font-semibold text-slate-500">Estado del pedido</dt>
                    <dd className="mt-2">
                        <OrderStatusBadge status={order.orderStatus} />
                    </dd>
                </div>
            </dl>

            <div className="mt-6 flex items-center justify-center gap-2 text-[0.7rem] text-slate-400">
                <FiLock />
                <span>Transacciones seguras y protegidas</span>
            </div>
        </aside>
    );
};
