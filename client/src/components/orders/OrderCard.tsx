import { FiArrowRight, FiBox } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { Order } from '../../types/order.types';
import { OrderStatusBadge } from './OrderStatusBadge';
export const OrderCard = ({ order }: { order: Order }) => {
    const date = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(order.createdAt));
    const count = order.items.reduce((total, item) => total + item.quantity, 0);
    return <article className="group grid gap-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.35)] transition hover:border-blue-200 hover:shadow-[0_22px_65px_-38px_rgba(37,99,235,0.3)] sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600"><FiBox /></span><div className="min-w-0"><div className="flex flex-wrap items-center gap-3"><h2 className="truncate text-lg font-black text-slate-950">Orden #{order._id}</h2><OrderStatusBadge status={order.orderStatus} /></div><p className="mt-2 text-sm text-slate-500">{date} · {count} {count === 1 ? 'producto' : 'productos'}</p><p className="mt-2 font-black text-slate-950">Total: ${order.total.toFixed(2)}</p></div><Link to={`/orders/${order._id}`} aria-label={`Ver detalles de la orden ${order._id}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-blue-600 transition group-hover:border-blue-200 group-hover:bg-blue-50">Ver detalles <FiArrowRight /></Link>
    </article>;
};
