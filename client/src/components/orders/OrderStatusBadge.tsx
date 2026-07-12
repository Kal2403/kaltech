import type { Order } from "../../types/order.types";

interface OrderStatusBadgeProps {
    status: Order["orderStatus"];
}

const statusStyles: Record<
    Order["orderStatus"],
    {
        label: string;
        className: string;
    }
> = {
    pending: {
        label: "Pendiente",
        className: "bg-amber-100 text-amber-700",
    },
    processing: {
        label: "Procesando",
        className: "bg-blue-100 text-blue-700",
    },
    shipped: {
        label: "Enviado",
        className: "bg-purple-100 text-purple-700",
    },
    delivered: {
        label: "Entregado",
        className: "bg-emerald-100 text-emerald-700",
    },
    cancelled: {
        label: "Cancelado",
        className: "bg-red-100 text-red-700",
    },
};

export const OrderStatusBadge = ({
    status,
}: OrderStatusBadgeProps) => {
    const currentStatus = statusStyles[status];

    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${currentStatus.className}`}
        >
            {currentStatus.label}
        </span>
    );
};
