import { FiExternalLink, FiLogOut, FiMenu, FiUser } from "react-icons/fi";
import type { RefObject } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { ROUTES } from "../../routes/paths";

interface AdminTopbarProps {
    navigationTriggerRef: RefObject<HTMLButtonElement | null>;
    isNavigationOpen: boolean;
    onOpenNavigation: () => void;
}

export const AdminTopbar = ({ navigationTriggerRef, isNavigationOpen, onOpenNavigation }: AdminTopbarProps) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const handleLogout = () => {
        logout();
        navigate(ROUTES.home, { replace: true });
    };

    return (
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-10">
            <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                    <button
                        ref={navigationTriggerRef}
                        type="button"
                        onClick={onOpenNavigation}
                        aria-controls="admin-navigation"
                        aria-expanded={isNavigationOpen}
                        aria-label="Abrir navegación administrativa"
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-xl text-slate-800 lg:hidden"
                    >
                        <FiMenu aria-hidden="true" />
                    </button>
                    <div className="min-w-0">
                        <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
                            Administración
                        </p>
                        <h1 className="text-xl font-black text-slate-950">
                            Panel KalTech
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        to={ROUTES.home}
                        className="hidden items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 sm:flex"
                    >
                        <FiExternalLink aria-hidden="true" />
                        Ver tienda
                    </Link>
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
                            <FiUser aria-hidden="true" />
                        </span>
                        <span className="hidden min-w-0 text-left sm:block">
                            <span className="block max-w-44 truncate text-sm font-black text-slate-950">
                                {user?.name ?? "Administrador"}
                            </span>
                            <span className="block max-w-44 truncate text-xs text-slate-500">
                                {user?.email ?? "admin"}
                            </span>
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-lg text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                        aria-label="Cerrar sesión"
                    >
                        <FiLogOut aria-hidden="true" />
                    </button>
                </div>
            </div>
        </header>
    );
};
