import { Link } from "react-router-dom";
import { FiExternalLink, FiMenu, FiUser } from "react-icons/fi";

import { ROUTES } from "../../routes/paths";

interface AdminTopbarProps {
    onOpenNavigation: () => void;
}

export const AdminTopbar = ({ onOpenNavigation }: AdminTopbarProps) => {
    return (
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur lg:px-10">
            <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                    <button
                        type="button"
                        onClick={onOpenNavigation}
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
                        <FiExternalLink />
                        Ver tienda
                    </Link>

                    <div
                        className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 transition hover:border-blue-200 hover:bg-blue-50"
                    >
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
                            <FiUser />
                        </span>

                        <span className="hidden text-left sm:block">
                            <span className="block text-sm font-black text-slate-950">
                                Administrador
                            </span>

                            <span className="block text-xs text-slate-500">
                                admin
                            </span>
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
};
