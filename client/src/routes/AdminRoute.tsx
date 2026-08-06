import { Navigate, Outlet, Link, useLocation } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "./paths";

export const AdminRoute = () => {
    const { user, isInitializing } = useAuth();
    const location = useLocation();

    if (isInitializing) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
                <div role="status" aria-live="polite" className="text-center">
                    <span aria-hidden="true" className="mx-auto block h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
                    <p className="mt-4 font-semibold text-slate-600">Verificando permisos…</p>
                </div>
            </main>
        );
    }

    if (!user) return <Navigate to={ROUTES.login} replace state={{ from: location.pathname + location.search }} />;
    if (user.role !== "admin") {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-16">
                <section
                    aria-labelledby="access-denied-title"
                    className="w-full max-w-xl rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-xl shadow-slate-200/60 sm:p-12"
                >
                    <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-700">
                        Acceso restringido
                    </p>
                    <h1
                        id="access-denied-title"
                        className="mt-3 text-3xl font-black text-slate-950"
                    >
                        No tienes permisos de administrador
                    </h1>
                    <p className="mt-4 leading-7 text-slate-600">
                        Tu sesión está activa, pero esta sección está disponible
                        únicamente para cuentas administradoras.
                    </p>
                    <Link
                        to={ROUTES.home}
                        className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-blue-600 px-6 font-extrabold text-white transition hover:bg-blue-700"
                    >
                        Volver a la tienda
                    </Link>
                </section>
            </main>
        );
    }

    return <Outlet />;
};
