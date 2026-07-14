import { NavLink } from "react-router-dom";
import {
    FiBox,
    FiGrid,
    FiHome,
    FiLayers,
    FiShoppingBag,
} from "react-icons/fi";

import { ROUTES } from "../../routes/paths";

const adminLinks = [
    {
        label: "Dashboard",
        path: ROUTES.admin,
        icon: FiHome,
    },
    {
        label: "Products",
        path: ROUTES.adminProducts,
        icon: FiBox,
    },
    {
        label: "Categories",
        path: ROUTES.adminCategories,
        icon: FiLayers,
    },
    {
        label: "Orders",
        path: ROUTES.adminOrders,
        icon: FiShoppingBag,
    },
];

export const AdminSidebar = () => {
    return (
        <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-slate-950 px-6 py-8 lg:block">
            <div className="flex h-full flex-col">
                <NavLink
                    to={ROUTES.admin}
                    className="text-3xl font-black tracking-tight"
                >
                    <span className="text-blue-500">KAL</span>
                    <span className="text-white">TECH</span>
                </NavLink>

                <div className="mt-10">
                    <p className="px-3 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                        Administration
                    </p>

                    <nav className="mt-4 space-y-2">
                        {adminLinks.map((link) => {
                            const Icon = link.icon;

                            return (
                                <NavLink
                                    key={link.path}
                                    to={link.path}
                                    end={link.path === ROUTES.admin}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 rounded-xl px-4 py-3 font-bold transition ${
                                            isActive
                                                ? "bg-blue-600 text-white"
                                                : "text-slate-300 hover:bg-slate-900 hover:text-white"
                                        }`
                                    }
                                >
                                    <Icon className="text-xl" />
                                    {link.label}
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-auto rounded-2xl border border-slate-800 bg-slate-900 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                            <FiGrid />
                        </div>

                        <div>
                            <p className="font-bold text-white">
                                KalTech Admin
                            </p>

                            <p className="text-sm text-slate-400">
                                Management panel
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};
