import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { OrderItem, OrderSummary, OrderTimeline, PaymentModal } from "../components/orders";
import { useOrderDetails } from "../hooks/useOrderDetails";
import { ROUTES } from "../routes/paths";

export const OrderDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const { order, isLoading, error, reloadOrder } = useOrderDetails(id);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const paymentFailed = searchParams.get("payment_failed") === "true";

    if (isLoading) {
        return (
            <section className="min-h-[70vh] bg-slate-50 px-5 py-14 sm:px-6">
                <div
                    role="status"
                    aria-busy="true"
                    className="mx-auto flex min-h-64 max-w-7xl items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                    <span
                        aria-hidden="true"
                        className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"
                    />
                    <p className="font-semibold text-slate-700">Cargando detalle de la orden…</p>
                </div>
            </section>
        );
    }

    if (error || !order) {
        return (
            <section className="min-h-[70vh] bg-slate-50 px-5 py-14 sm:px-6">
                <div role="alert" className="mx-auto max-w-7xl rounded-2xl border border-red-200 bg-red-50 p-6">
                    <p className="font-semibold text-red-700">{error ?? "No se encontró la orden solicitada."}</p>
                    <div className="mt-5 flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={() => void reloadOrder()}
                            className="min-h-11 rounded-xl bg-red-600 px-5 font-bold text-white"
                        >
                            Intentar nuevamente
                        </button>
                        <Link
                            to={ROUTES.orders}
                            className="inline-flex min-h-11 items-center rounded-xl border border-slate-300 bg-white px-5 font-bold text-slate-700"
                        >
                            Volver a mis órdenes
                        </Link>
                    </div>
                </div>
            </section>
        );
    }

    const date = new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(order.createdAt));

    return (
        <section className="min-h-screen bg-gradient-to-b from-blue-50/70 via-slate-50 to-white px-5 py-12 sm:px-6 sm:py-16">
            <div className="mx-auto max-w-7xl">
                <header className="mb-10">
                    <Link to={ROUTES.orders} className="text-sm font-bold text-blue-600 hover:text-blue-700">
                        ← Volver a mis órdenes
                    </Link>
                    <p className="mt-6 text-sm font-black uppercase tracking-[0.18em] text-blue-600">
                        Detalle de la orden
                    </p>
                    <h1 className="mt-2 break-all text-3xl font-black text-slate-950 md:text-4xl">
                        Orden #{order._id}
                    </h1>
                    <p className="mt-3 text-slate-600">Realizada el {date}</p>
                </header>

                {paymentFailed && order.paymentStatus !== "paid" && (
                    <div
                        role="alert"
                        className="mb-8 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-900 shadow-sm"
                    >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-base font-bold text-amber-900">
                                    El pedido fue registrado, pero el pago quedó pendiente
                                </h3>
                                <p className="mt-1 text-sm text-amber-800">
                                    No pudimos procesar el cobro automático. Puedes reintentar el pago ahora con tu tarjeta o PayPal para que comencemos a preparar tu pedido.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsPaymentModalOpen(true)}
                                className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-amber-600 px-5 font-bold text-white shadow-md transition hover:bg-amber-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
                            >
                                Pagar ahora
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
                    <div className="space-y-8">
                        <OrderTimeline order={order} />

                        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <h2 className="mb-5 text-2xl font-black text-slate-950">Productos</h2>
                            <div className="space-y-4">
                                {order.items.map((item) => (
                                    <OrderItem
                                        key={`${typeof item.product === "string" ? item.product : item.product._id}-${item.name}`}
                                        item={item}
                                    />
                                ))}
                            </div>
                        </section>

                        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-2xl font-black text-slate-950">Dirección de envío</h2>
                            <address className="mt-5 space-y-2 not-italic text-slate-600">
                                <p className="font-bold text-slate-900">{order.shippingAddress.fullName}</p>
                                <p>{order.shippingAddress.address}</p>
                                <p>
                                    {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                                </p>
                                <p>{order.shippingAddress.country}</p>
                                <p>{order.shippingAddress.phone}</p>
                            </address>
                        </section>
                    </div>

                    <OrderSummary
                        order={order}
                        onPayNow={() => setIsPaymentModalOpen(true)}
                    />
                </div>
            </div>

            <PaymentModal
                order={order}
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onSuccess={() => void reloadOrder()}
            />
        </section>
    );
};
