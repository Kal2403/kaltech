import { Link } from "react-router-dom";

import { OrderCard } from "../components/orders";
import { useOrders } from "../hooks/useOrders";
import { ROUTES } from "../routes/paths";

export const OrdersPage = () => {
    const {
        orders,
        isLoading,
        error,
        reloadOrders,
    } = useOrders();

    if (isLoading) {
        return (
            <section className="bg-slate-50 px-6 py-16">
                <div className="mx-auto max-w-7xl">
                    <p className="text-lg font-semibold text-slate-700">
                        Cargando órdenes...
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="min-h-screen bg-slate-50 px-6 py-16">
            <div className="mx-auto max-w-7xl">
                <div className="mb-10">
                    <p className="text-sm font-black uppercase tracking-wide text-blue-600">
                        Mi cuenta
                    </p>

                    <h1 className="mt-2 text-4xl font-black text-slate-950">
                        Mis órdenes
                    </h1>

                    <p className="mt-3 max-w-2xl text-slate-600">
                        Consulta el historial y el estado de tus compras.
                    </p>
                </div>

                {error && (
                    <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-6">
                        <p className="font-semibold text-red-600">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={() => void reloadOrders()}
                            className="mt-4 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
                        >
                            Intentar nuevamente
                        </button>
                    </div>
                )}

                {!error && orders.length === 0 && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                        <h2 className="text-2xl font-black text-slate-950">
                            Todavía no tienes órdenes
                        </h2>

                        <p className="mt-3 text-slate-600">
                            Cuando completes una compra, aparecerá en esta sección.
                        </p>

                        <Link
                            to={ROUTES.products}
                            className="mt-6 inline-flex rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700"
                        >
                            Explorar productos
                        </Link>
                    </div>
                )}

                {!error && orders.length > 0 && (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <OrderCard
                                key={order._id}
                                order={order}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};
