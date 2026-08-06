import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "./paths";

const SessionLoader = () => (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <div role="status" aria-live="polite" className="text-center">
            <span aria-hidden="true" className="mx-auto block h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
            <p className="mt-4 font-semibold text-slate-600">Verificando tu sesión…</p>
        </div>
    </main>
);

export const ProtectedRoute = () => {
    const { isAuthenticated, isInitializing } = useAuth();
    const location = useLocation();

    if (isInitializing) return <SessionLoader />;

    if (!isAuthenticated) {
        return (
            <Navigate
                to={ROUTES.login}
                replace
                state={{ from: location.pathname + location.search }}
            />
        );
    }

    return <Outlet />;
};
