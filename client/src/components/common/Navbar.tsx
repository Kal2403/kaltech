import { type FormEvent, useEffect, useRef, useState } from "react";
import {
    FiGrid,
    FiLogOut,
    FiMenu,
    FiSearch,
    FiShoppingCart,
    FiUser,
    FiX,
} from "react-icons/fi";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { ROUTES } from "../../routes/paths";

const publicLinks = [
    { label: "Inicio", path: ROUTES.home },
    { label: "Productos", path: ROUTES.products },
    { label: "Categorías", path: `${ROUTES.home}#categories` },
    { label: "Ofertas", path: `${ROUTES.home}#offers` },
];

export const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
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

    const handleSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const query = searchQuery.trim();
        navigate(query ? `${ROUTES.products}?search=${encodeURIComponent(query)}` : ROUTES.products);
        setIsOpen(false);
    };

    const isLinkActive = (path: string) => {
        const [pathname, hash = ""] = path.split("#");
        return location.pathname === pathname && location.hash === (hash ? `#${hash}` : "");
    };

    return (
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
            <nav
                className="mx-auto flex min-h-18 max-w-6xl items-center gap-4 px-4 sm:px-6 lg:min-h-20 lg:gap-6 xl:px-8"
                aria-label="Navegación principal"
            >
                <Link
                    to={ROUTES.home}
                    className="shrink-0 rounded-md py-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
                    aria-label="KalTech, inicio"
                >
                    <span className="block text-xl font-black leading-none tracking-[-0.055em] sm:text-2xl">
                        <span className="text-blue-600">KAL</span>
                        <span className="text-slate-900">TECH</span>
                    </span>
                    <span className="mt-1 hidden text-[0.4rem] font-extrabold uppercase tracking-[0.22em] text-slate-400 sm:block">
                        Tecnología que mejora tu día
                    </span>
                </Link>

                <div className="hidden items-center gap-5 lg:flex xl:gap-7">
                    {links.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            end={link.path === ROUTES.home}
                            className={() => {
                                const isActive = isLinkActive(link.path);
                                return `relative flex min-h-20 items-center whitespace-nowrap text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 ${
                                    isActive
                                        ? "text-blue-600 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-blue-600"
                                        : "text-slate-700 hover:text-blue-600"
                                }`;
                            }}
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </div>

                <form
                    onSubmit={handleSearch}
                    className="ml-auto hidden min-w-0 max-w-sm flex-1 items-center rounded-2xl border border-slate-200 bg-slate-100/80 px-4 text-slate-500 transition focus-within:border-blue-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 md:flex"
                    role="search"
                >
                    <FiSearch className="shrink-0 text-lg" aria-hidden="true" />
                    <label htmlFor="navbar-search" className="sr-only">Buscar productos</label>
                    <input
                        id="navbar-search"
                        type="search"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="Buscar laptops, teléfonos, accesorios..."
                        className="min-h-11 min-w-0 flex-1 bg-transparent px-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                    />
                    <kbd className="hidden rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[0.65rem] font-semibold text-slate-400 xl:inline">
                        ⌘K
                    </kbd>
                </form>

                <div className="flex shrink-0 items-center gap-2">
                    <Link
                        to={ROUTES.cart}
                        className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl text-slate-800 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                        aria-label="Ver carrito"
                    >
                        <FiShoppingCart aria-hidden="true" />
                    </Link>

                    <Link
                        to={user ? ROUTES.orders : ROUTES.login}
                        className="hidden min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-extrabold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:flex"
                    >
                        <FiUser aria-hidden="true" />
                        <span className="max-w-24 truncate">{user ? user.name : "Mi cuenta"}</span>
                    </Link>

                    {user?.role === "admin" ? (
                        <Link
                            to={ROUTES.admin}
                            className="hidden h-11 w-11 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-700 transition hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 xl:flex"
                            aria-label="Panel administrativo"
                        >
                            <FiGrid aria-hidden="true" />
                        </Link>
                    ) : null}

                    {user ? (
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="hidden h-11 w-11 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 xl:flex"
                            aria-label={`Cerrar sesión de ${user.name}`}
                        >
                            <FiLogOut aria-hidden="true" />
                        </button>
                    ) : null}

                    <button
                        ref={menuButtonRef}
                        type="button"
                        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
                        aria-expanded={isOpen}
                        aria-controls="mobile-navigation"
                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-2xl text-slate-900 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 lg:hidden"
                        onClick={() => setIsOpen((open) => !open)}
                    >
                        {isOpen ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
                    </button>
                </div>
            </nav>

            {isOpen ? (
                <nav
                    id="mobile-navigation"
                    className="border-t border-slate-200 bg-white px-4 py-4 shadow-xl lg:hidden"
                    aria-label="Navegación móvil"
                >
                    <form onSubmit={handleSearch} className="mb-4 flex items-center rounded-xl border border-slate-200 bg-slate-100 px-3" role="search">
                        <FiSearch className="text-lg text-slate-500" aria-hidden="true" />
                        <label htmlFor="mobile-navbar-search" className="sr-only">Buscar productos</label>
                        <input
                            id="mobile-navbar-search"
                            type="search"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Buscar productos..."
                            className="min-h-12 min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
                        />
                    </form>
                    <div className="flex flex-col gap-1">
                        {links.map((link) => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className={() => `flex min-h-11 items-center rounded-xl px-4 font-bold ${
                                    isLinkActive(link.path)
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-slate-800 hover:bg-slate-50"
                                }`}
                            >
                                {link.label}
                            </NavLink>
                        ))}
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
