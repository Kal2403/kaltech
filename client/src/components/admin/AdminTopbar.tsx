import { Link } from "react-router-dom";
import { FiBell, FiExternalLink, FiUser } from "react-icons/fi";

import { ROUTES } from "../../routes/paths";

export const AdminTopbar = () => {
    return (
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur lg:px-10">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
                        Administration
                    </p>

                    <h1 className="text-xl font-black text-slate-950">
                        KalTech Dashboard
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        to={ROUTES.home}
                        className="hidden items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 sm:flex"
                    >
                        <FiExternalLink />
                        View store
                    </Link>

                    <button
                        type="button"
                        aria-label="View notifications"
                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-xl text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                    >
                        <FiBell />
                    </button>

                    <button
                        type="button"
                        aria-label="Open administrator profile"
                        className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 transition hover:border-blue-200 hover:bg-blue-50"
                    >
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
                            <FiUser />
                        </span>

                        <span className="hidden text-left sm:block">
                            <span className="block text-sm font-black text-slate-950">
                                Administrator
                            </span>

                            <span className="block text-xs text-slate-500">
                                admin
                            </span>
                        </span>
                    </button>
                </div>
            </div>
        </header>
    );
};
