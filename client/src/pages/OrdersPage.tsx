import { FiShoppingBag } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { OrderCard } from '../components/orders';
import { useOrders } from '../hooks/useOrders';
import { ROUTES } from '../routes/paths';
export const OrdersPage = () => {
 const { orders, isLoading, error, reloadOrders } = useOrders();
 if (isLoading) return <section className="min-h-[70vh] bg-slate-50 px-5 py-14 sm:px-6"><p className="mx-auto max-w-7xl font-semibold text-slate-700">Cargando órdenes…</p></section>;
 return <section className="min-h-screen bg-gradient-to-b from-blue-50/70 via-slate-50 to-white px-5 py-12 sm:px-6 sm:py-16"><div className="mx-auto max-w-7xl"><header className="mb-10"><p className="text-sm font-black uppercase tracking-[0.18em] text-blue-600">Mi cuenta</p><h1 className="mt-2 text-4xl font-black text-slate-950">Mis órdenes</h1><p className="mt-3 max-w-2xl text-slate-600">Consulta el historial y el estado de tus compras.</p></header>{error && <div role="alert" className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-6"><p className="font-semibold text-red-700">{error}</p><button type="button" onClick={() => void reloadOrders()} className="mt-4 min-h-11 rounded-xl bg-red-600 px-5 text-sm font-bold text-white">Intentar nuevamente</button></div>}{!error && orders.length === 0 && <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm"><FiShoppingBag className="mx-auto text-4xl text-blue-600" /><h2 className="mt-5 text-2xl font-black text-slate-950">Todavía no tienes órdenes</h2><p className="mt-3 text-slate-600">Cuando completes una compra, aparecerá en esta sección.</p><Link to={ROUTES.products} className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-blue-600 px-6 font-bold text-white">Explorar productos</Link></div>}{!error && orders.length > 0 && <div className="space-y-5">{orders.map((order) => <OrderCard key={order._id} order={order} />)}</div>}</div></section>;
};
