import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "./paths";

export const PublicOnlyRoute = () => {
    const { user, isInitializing } = useAuth();

    if (isInitializing) return <main className="flex min-h-[70vh] items-center justify-center"><div role="status" aria-live="polite" className="text-center"><span aria-hidden="true" className="mx-auto block h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" /><p className="mt-4 font-semibold text-slate-600">Verificando tu sesión…</p></div></main>;
    if (user) {
        return <Navigate to={user.role === "admin" ? ROUTES.admin : ROUTES.home} replace />;
    }

    return <Outlet />;
};
