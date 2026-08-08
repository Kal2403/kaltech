import { useEffect, useRef, useState } from "react";
import {
    FiGrid,
    FiLogOut,
    FiMenu,
    FiShoppingCart,
    FiUser,
    FiX,
} from "react-icons/fi";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { ROUTES } from "../../routes/paths";

const publicLinks = [
    { label: "Inicio", path: ROUTES.home },
    { label: "Productos", path: ROUTES.products },
];

export const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const links = user?.role === "customer"
        ? [...publicLinks, { label: "Mis órdenes", path: ROUTES.orders }]
        : publicLinks;

    useEffect(() => {
        if (!isOpen) return;

        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") setIsOpen(false);
        };

        window.addEventListener("keydown", closeOnEscape);
        const previousOverflow = document.body.style.overflow;
        const menuButton = menuButtonRef.current;
        document.body.style.overflow = "hidden";

        return () => {
            window.removeEventListener("keydown", closeOnEscape);
            document.body.style.overflow = previousOverflow;
            menuButton?.focus();
        };
    }, [isOpen]);

    const handleLogout = () => {
        logout();
        setIsOpen(false);
        navigate(ROUTES.home, { replace: true });
    };

    return (
        <header className="sticky top-0 z-50 bg-slate-50/95 px-3 pt-3 backdrop-blur-xl sm:px-5 sm:pt-4">
            <nav
                className="mx-auto flex h-17 max-w-360 items-center rounded-2xl border border-slate-200/80 bg-white px-4 shadow-[0_12px_35px_-24px_rgba(15,23,42,0.35)] sm:h-20 sm:px-6 lg:h-24 lg:px-8"
                aria-label="Navegación principal"
            >
                <Link
                    to={ROUTES.home}
                    className="shrink-0 text-[1.65rem] font-black tracking-[-0.055em] sm:text-3xl xl:text-[2rem]"
                    aria-label="KalTech, inicio"
                >
                    <span className="text-blue-600">KAL</span>
                    <span className="text-[#071225]">TECH</span>
                </Link>

                <div className="ml-9 hidden h-full items-center gap-7 lg:flex xl:ml-12 xl:gap-10">
                    {links.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            end={link.path === ROUTES.home}
                            className={({ isActive }) =>
                                `relative flex h-full items-center text-sm font-extrabold transition-colors ${
                                    isActive
                                        ? "text-blue-600 after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:rounded-t-full after:bg-blue-600"
                                        : "text-slate-700 hover:text-blue-600"
                                }`
                            }
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </div>

                <div className="ml-auto flex items-center gap-2 sm:gap-3">
                    {user ? (
                        <Link
                            to={ROUTES.cart}
                            className="relative flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-slate-900 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 sm:px-4"
                            aria-label="Ver carrito"
                        >
                            <FiShoppingCart className="text-xl" aria-hidden="true" />
                            <span className="hidden text-sm font-extrabold xl:inline">Carrito</span>
                        </Link>
                    ) : null}

                    {user ? (
                        <span className="hidden max-w-32 truncate text-sm font-bold text-slate-700 2xl:block">
                            {user.name}
                        </span>
                    ) : null}

                    {!user ? (
                        <Link
                            to={ROUTES.login}
                            className="hidden h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-extrabold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 sm:flex lg:h-12 lg:px-6"
                        >
                            <FiUser aria-hidden="true" />
                            Acceder
                        </Link>
                    ) : null}

                    {user?.role === "admin" ? (
                        <Link
                            to={ROUTES.admin}
                            className="hidden h-11 items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-extrabold text-blue-700 transition hover:bg-blue-100 sm:flex"
                        >
                            <FiGrid aria-hidden="true" />
                            Panel
                        </Link>
                    ) : null}

                    {user ? (
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="hidden h-11 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-extrabold text-white transition hover:bg-slate-700 sm:flex"
                            aria-label={`Cerrar sesión de ${user.name}`}
                        >
                            <FiLogOut aria-hidden="true" />
                            Salir
                        </button>
                    ) : null}

                    <button
                        ref={menuButtonRef}
                        type="button"
                        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
                        aria-expanded={isOpen}
                        aria-controls="mobile-navigation"
                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-2xl text-slate-900 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 lg:hidden"
                        onClick={() => setIsOpen((open) => !open)}
                    >
                        {isOpen ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
                    </button>
                </div>
            </nav>

            {isOpen ? (
                <nav
                    id="mobile-navigation"
                    className="mx-auto mt-2 max-w-360 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-xl lg:hidden"
                    aria-label="Navegación móvil"
                >
                    <div className="flex flex-col gap-2">
                        {links.map((link) => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                end={link.path === ROUTES.home}
                                onClick={() => setIsOpen(false)}
                                className={({ isActive }) =>
                                    `flex min-h-11 items-center rounded-xl px-4 font-bold ${
                                        isActive
                                            ? "bg-blue-50 text-blue-700"
                                            : "text-slate-800 hover:bg-slate-50"
                                    }`
                                }
                            >
                                {link.label}
                            </NavLink>
                        ))}
                        {!user ? (
                            <Link
                                to={ROUTES.login}
                                onClick={() => setIsOpen(false)}
                                className="mt-2 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 font-bold text-white sm:hidden"
                            >
                                <FiUser aria-hidden="true" />
                                Acceder
                            </Link>
                        ) : null}
                        {user?.role === "admin" ? (
                            <Link
                                to={ROUTES.admin}
                                onClick={() => setIsOpen(false)}
                                className="mt-2 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-50 px-4 font-bold text-blue-700"
                            >
                                <FiGrid aria-hidden="true" />
                                Panel administrativo
                            </Link>
                        ) : null}
                        {user ? (
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="mt-2 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 font-bold text-white"
                            >
                                <FiLogOut aria-hidden="true" />
                                Cerrar sesión
                            </button>
                        ) : null}
                    </div>
                </nav>
            ) : null}
        </header>
    );
};
