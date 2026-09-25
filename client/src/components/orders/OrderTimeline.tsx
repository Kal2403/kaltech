import { useState } from "react";
import {
    FiAlertCircle,
    FiCheck,
    FiCheckCircle,
    FiClock,
    FiCopy,
    FiCreditCard,
    FiPackage,
    FiTruck,
} from "react-icons/fi";
import type { AdminOrder, Order, OrderStatus, OrderTimelineEvent } from "../../types/order.types";

interface OrderTimelineProps {
    order: Order | AdminOrder;
}

interface StepConfig {
    key: string;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    isCompleted: (order: Order | AdminOrder) => boolean;
    isCurrent: (order: Order | AdminOrder) => boolean;
}

const steps: StepConfig[] = [
    {
        key: "placed",
        label: "Pedido recibido",
        description: "Registrado en el sistema",
        icon: FiClock,
        isCompleted: () => true,
        isCurrent: (order) => order.orderStatus === "pending" && order.paymentStatus !== "paid",
    },
    {
        key: "paid",
        label: "Pago verificado",
        description: "Transacción confirmada",
        icon: FiCreditCard,
        isCompleted: (order) => order.paymentStatus === "paid" || order.orderStatus !== "pending",
        isCurrent: (order) => order.paymentStatus === "paid" && order.orderStatus === "pending",
    },
    {
        key: "processing",
        label: "En preparación",
        description: "Empaque y almacén",
        icon: FiPackage,
        isCompleted: (order) => ["processing", "shipped", "delivered"].includes(order.orderStatus),
        isCurrent: (order) => order.orderStatus === "processing",
    },
    {
        key: "shipped",
        label: "En camino",
        description: "En tránsito con el courier",
        icon: FiTruck,
        isCompleted: (order) => ["shipped", "delivered"].includes(order.orderStatus),
        isCurrent: (order) => order.orderStatus === "shipped",
    },
    {
        key: "delivered",
        label: "Entregado",
        description: "En destino final",
        icon: FiCheckCircle,
        isCompleted: (order) => order.orderStatus === "delivered",
        isCurrent: (order) => order.orderStatus === "delivered",
    },
];

const getStatusBadgeStyle = (status: OrderStatus): string => {
    switch (status) {
        case "delivered":
            return "bg-emerald-100 text-emerald-800 border-emerald-200";
        case "shipped":
            return "bg-purple-100 text-purple-800 border-purple-200";
        case "processing":
            return "bg-blue-100 text-blue-800 border-blue-200";
        case "cancelled":
            return "bg-red-100 text-red-800 border-red-200";
        case "pending":
        default:
            return "bg-amber-100 text-amber-800 border-amber-200";
    }
};

const formatEventDate = (dateStr: string): string => {
    try {
        return new Intl.DateTimeFormat("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(dateStr));
    } catch {
        return dateStr;
    }
};

const formatEstimatedDate = (dateStr: string): string => {
    try {
        return new Intl.DateTimeFormat("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric",
        }).format(new Date(dateStr));
    } catch {
        return dateStr;
    }
};

export const OrderTimeline = ({ order }: OrderTimelineProps) => {
    const [copied, setCopied] = useState(false);

    const isCancelled = order.orderStatus === "cancelled";

    const handleCopyTracking = () => {
        if (!order.trackingNumber) return;
        void navigator.clipboard.writeText(order.trackingNumber).then(() => {
            setCopied(true);
            window.setTimeout(() => {
                setCopied(false);
            }, 2000);
        });
    };

    const timelineEvents: OrderTimelineEvent[] = order.timeline && order.timeline.length > 0
        ? [...order.timeline].sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        : [];

    return (
        <section
            aria-label="Seguimiento de envío"
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
        >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
                <div>
                    <h2 className="text-xl font-black text-slate-900 sm:text-2xl">
                        Seguimiento del Envío
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                        Estado y evolución en tiempo real de tu pedido
                    </p>
                </div>

                {isCancelled && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                        <FiAlertCircle className="h-4 w-4" />
                        Pedido cancelado
                    </span>
                )}
            </div>

            {/* Stepper Progress Bar (when not cancelled) */}
            {!isCancelled ? (
                <div className="mt-8 mb-6">
                    <ol className="grid grid-cols-1 gap-4 sm:grid-cols-5">
                        {steps.map((step, idx) => {
                            const completed = step.isCompleted(order);
                            const current = step.isCurrent(order);
                            const IconComponent = step.icon;

                            return (
                                <li
                                    key={step.key}
                                    className="relative flex items-center sm:flex-col sm:items-center text-left sm:text-center"
                                >
                                    {/* Connector line for desktop */}
                                    {idx < steps.length - 1 && (
                                        <div
                                            aria-hidden="true"
                                            className={`hidden sm:block absolute top-5 left-1/2 w-full h-1 -z-0 transition-colors ${
                                                steps[idx + 1] && steps[idx + 1]!.isCompleted(order)
                                                    ? "bg-blue-600"
                                                    : "bg-slate-200"
                                            }`}
                                        />
                                    )}

                                    {/* Circle Icon Badge */}
                                    <div
                                        className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                                            completed
                                                ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-100"
                                                : current
                                                ? "border-blue-600 bg-white text-blue-600 ring-4 ring-blue-50"
                                                : "border-slate-200 bg-slate-50 text-slate-400"
                                        }`}
                                    >
                                        {completed && !current ? (
                                            <FiCheck className="h-5 w-5 stroke-[2.5]" />
                                        ) : (
                                            <IconComponent className="h-5 w-5" />
                                        )}
                                    </div>

                                    {/* Text Info */}
                                    <div className="ml-4 sm:ml-0 sm:mt-3">
                                        <p
                                            className={`text-sm font-bold ${
                                                completed || current ? "text-slate-900" : "text-slate-400"
                                            }`}
                                        >
                                            {step.label}
                                        </p>
                                        <p className="text-xs text-slate-500 hidden sm:block mt-0.5">
                                            {step.description}
                                        </p>
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                </div>
            ) : (
                <div
                    role="alert"
                    className="mt-6 flex items-start gap-4 rounded-2xl border border-red-200 bg-red-50/70 p-5 text-red-900"
                >
                    <FiAlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-red-600" />
                    <div>
                        <h3 className="font-bold text-red-950">Este pedido ha sido cancelado</h3>
                        <p className="mt-1 text-sm text-red-800">
                            El pedido ya no está en tránsito y el inventario correspondiente fue retornado al catálogo.
                            Si tienes alguna consulta adicional, por favor contacta a nuestro equipo de atención al cliente.
                        </p>
                    </div>
                </div>
            )}

            {/* Carrier & Tracking Card (if tracking info exists) */}
            {(order.trackingNumber || order.carrier || order.estimatedDelivery) && (
                <div className="mt-6 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-slate-50 p-5 sm:p-6">
                    <div className="grid gap-4 sm:grid-cols-3 sm:items-center">
                        {order.carrier && (
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                                    <FiTruck className="h-5 w-5" />
                                </div>
                                <div>
                                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Empresa Courier
                                    </span>
                                    <p className="font-bold text-slate-900 text-base">{order.carrier}</p>
                                </div>
                            </div>
                        )}

                        {order.trackingNumber && (
                            <div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Número de Guía
                                </span>
                                <div className="mt-1 flex items-center gap-2">
                                    <code className="rounded-lg bg-white px-2.5 py-1 text-sm font-bold text-slate-800 border border-slate-200 shadow-2xs">
                                        {order.trackingNumber}
                                    </code>
                                    <button
                                        type="button"
                                        onClick={handleCopyTracking}
                                        title="Copiar guía de seguimiento"
                                        aria-label="Copiar guía de seguimiento"
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 active:scale-95"
                                    >
                                        <FiCopy className="h-3.5 w-3.5 text-slate-500" />
                                        {copied ? "¡Copiado!" : "Copiar"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {order.estimatedDelivery && (
                            <div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Entrega Estimada
                                </span>
                                <p className="mt-1 font-bold text-emerald-700 text-sm">
                                    {formatEstimatedDate(order.estimatedDelivery)}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Detailed History Timeline (Events list) */}
            {timelineEvents.length > 0 && (
                <div className="mt-8 border-t border-slate-100 pt-6">
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 mb-4">
                        Historial de Movimientos
                    </h3>
                    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                        {timelineEvents.map((event, idx) => (
                            <div key={`${event.timestamp}-${idx}`} className="relative flex items-start gap-4">
                                <div
                                    aria-hidden="true"
                                    className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-blue-600 ring-2 ring-blue-100"
                                />
                                <div className="flex-1 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition-colors hover:bg-slate-50">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-bold ${getStatusBadgeStyle(
                                                    event.status
                                                )}`}
                                            >
                                                {event.title}
                                            </span>
                                            {event.location && (
                                                <span className="text-xs font-medium text-slate-500">
                                                    • {event.location}
                                                </span>
                                            )}
                                        </div>
                                        <time
                                            dateTime={event.timestamp}
                                            className="text-xs font-medium text-slate-400"
                                        >
                                            {formatEventDate(event.timestamp)}
                                        </time>
                                    </div>
                                    {event.description && (
                                        <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                                            {event.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
};
