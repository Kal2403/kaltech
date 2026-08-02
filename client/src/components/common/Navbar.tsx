import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { FiMenu, FiShoppingCart, FiUser, FiX } from "react-icons/fi";

import { ROUTES } from "../../routes/paths";

const navLinks = [
    { label: "Inicio", path: ROUTES.home },
    { label: "Productos", path: ROUTES.products },
    { label: "Mis órdenes", path: ROUTES.orders },
];

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    useEffect(() => {
        if (!isOpen) return;
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") setIsOpen(false);
        };
        window.addEventListener("keydown", closeOnEscape);
        return () => window.removeEventListener("keydown", closeOnEscape);
    }, [isOpen]);

    return (
        <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/95 backdrop-blur-xl">
            <nav className="mx-auto flex h-18 max-w-7xl items-center gap-5 px-4 sm:px-6 lg:h-21 lg:px-8" aria-label="Navegación principal">
                <Link to={ROUTES.home} className="shrink-0 text-2xl font-black tracking-[-0.045em] sm:text-3xl" aria-label="KalTech, inicio">
                    <span className="text-blue-600">KAL</span><span className="text-[#071225]">TECH</span>
                </Link>

                <div className="ml-8 hidden h-full items-center gap-8 lg:flex">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            end={link.path === ROUTES.home}
                            className={({ isActive }) => `relative flex h-full items-center text-sm font-extrabold transition-colors ${isActive ? "text-blue-600 after:absolute after:inset-x-0 after:bottom-0 after:h-0.75 after:rounded-full after:bg-blue-600" : "text-slate-700 hover:text-blue-600"}`}
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </div>

                <div className="ml-auto flex items-center gap-2 sm:gap-3">
                    <Link to={ROUTES.cart} className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl text-slate-900 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600" aria-label="Ver carrito">
                        <FiShoppingCart aria-hidden="true" />
                    </Link>
                    <Link to={ROUTES.login} className="hidden h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-extrabold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 sm:flex">
                        <FiUser aria-hidden="true" /> Acceder
                    </Link>
                    <button type="button" aria-label={isOpen ? "Cerrar menú" : "Abrir menú"} aria-expanded={isOpen} aria-controls="mobile-navigation" className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-2xl text-slate-900 lg:hidden" onClick={() => setIsOpen((open) => !open)}>
                        {isOpen ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
                    </button>
                </div>
            </nav>

            {isOpen && (
                <nav id="mobile-navigation" className="border-t border-slate-200 bg-white px-4 py-4 shadow-xl lg:hidden" aria-label="Navegación móvil">
                    <div className="mx-auto flex max-w-7xl flex-col gap-2">
                        {navLinks.map((link) => (
                            <NavLink key={link.path} to={link.path} end={link.path === ROUTES.home} onClick={() => setIsOpen(false)} className={({ isActive }) => `flex min-h-11 items-center rounded-xl px-4 font-bold ${isActive ? "bg-blue-50 text-blue-700" : "text-slate-800 hover:bg-slate-50"}`}>
                                {link.label}
                            </NavLink>
                        ))}
                        <Link to={ROUTES.login} onClick={() => setIsOpen(false)} className="mt-2 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 font-bold text-white sm:hidden">
                            <FiUser aria-hidden="true" /> Acceder
                        </Link>
                    </div>
                </nav>
            )}
        </header>
    );
};
