import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
    FiBox,
    FiGrid,
    FiHome,
    FiLayers,
    FiShoppingBag,
    FiX,
} from "react-icons/fi";

import { ROUTES } from "../../routes/paths";

const adminLinks = [
    {
        label: "Resumen",
        path: ROUTES.admin,
        icon: FiHome,
    },
    {
        label: "Productos",
        path: ROUTES.adminProducts,
        icon: FiBox,
    },
    {
        label: "Categorías",
        path: ROUTES.adminCategories,
        icon: FiLayers,
    },
    {
        label: "Órdenes",
        path: ROUTES.adminOrders,
        icon: FiShoppingBag,
    },
];

interface AdminSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AdminSidebar = ({ isOpen, onClose }: AdminSidebarProps) => {
    const [isDesktop, setIsDesktop] = useState(() =>
        window.matchMedia("(min-width: 1024px)").matches
    );

    useEffect(() => {
        const mediaQuery = window.matchMedia("(min-width: 1024px)");
        const handleChange = (event: MediaQueryListEvent) => setIsDesktop(event.matches);
        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        window.addEventListener("keydown", closeOnEscape);
        return () => window.removeEventListener("keydown", closeOnEscape);
    }, [isOpen, onClose]);

    return (
        <>
        {isOpen && <button type="button" aria-label="Cerrar navegación administrativa" onClick={onClose} className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-sm lg:hidden" />}
        <aside id="admin-navigation" aria-label="Navegación administrativa" aria-hidden={!isOpen && !isDesktop} inert={!isOpen && !isDesktop} className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[calc(100vw-2rem)] border-r border-white/10 bg-[#03101f] px-6 py-7 shadow-2xl transition-transform lg:max-w-none lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
            <div className="flex h-full flex-col">
                <div className="flex items-center justify-between">
                <NavLink
                    to={ROUTES.admin}
                    onClick={onClose}
                    className="text-3xl font-black tracking-tight"
                >
                    <span className="text-blue-500">KAL</span>
                    <span className="text-white">TECH</span>
                </NavLink>
                <button type="button" onClick={onClose} aria-label="Cerrar navegación" className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-xl text-white lg:hidden"><FiX /></button>
                </div>

                <div className="mt-10">
                    <p className="px-3 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                        Administración
                    </p>

                    <nav className="mt-4 space-y-2">
                        {adminLinks.map((link) => {
                            const Icon = link.icon;

                            return (
                                <NavLink
                                    key={link.path}
                                    to={link.path}
                                    onClick={onClose}
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
                                Panel de gestión
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
        </>
    );
};
