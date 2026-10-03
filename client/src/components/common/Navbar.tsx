import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
    FiArrowRight,
    FiGrid,
    FiHeart,
    FiLogOut,
    FiMenu,
    FiSearch,
    FiShoppingCart,
    FiUser,
    FiX,
} from "react-icons/fi";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { useWishlist } from "../../hooks/useWishlist";
import { ROUTES } from "../../routes/paths";
import { getProducts } from "../../services/products/product.service";
import type { Product } from "../../types/product.types";

const fallbackImage =
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80";

const publicLinks = [
    { label: "Inicio", path: ROUTES.home },
    { label: "Productos", path: ROUTES.products },
    { label: "Categorías", path: ROUTES.categories },
    { label: "Ofertas", path: ROUTES.offers },
];

export const Navbar = () => {
    const { user, logout } = useAuth();
    const { count: wishlistCount } = useWishlist();
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);

    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const mobileSearchContainerRef = useRef<HTMLDivElement>(null);

    const links = user?.role === "customer"
        ? [...publicLinks, { label: "Mis órdenes", path: ROUTES.orders }]
        : publicLinks;

    // Load products once for instant filtered search
    useEffect(() => {
        let isMounted = true;
        getProducts()
            .then((data) => {
                if (isMounted) setProducts(data);
            })
            .catch(() => {
                // Ignore load error in navbar search
            });
        return () => {
            isMounted = false;
        };
    }, []);

    // Close live search dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                searchContainerRef.current &&
                !searchContainerRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
            if (
                mobileSearchContainerRef.current &&
                !mobileSearchContainerRef.current.contains(event.target as Node)
            ) {
                setIsMobileDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Synchronize navbar search input with URL search parameter on products page
    useEffect(() => {
        if (location.pathname === ROUTES.products) {
            const currentSearch = new URLSearchParams(location.search).get("search") ?? "";
            if (currentSearch !== searchQuery.trim() && currentSearch !== searchQuery) {
                const timer = window.setTimeout(() => {
                    setSearchQuery(currentSearch);
                }, 0);
                return () => window.clearTimeout(timer);
            }
        }
    }, [location.pathname, location.search, searchQuery]);

    // Live search filtered results
    const matchingProducts = useMemo(() => {
        const term = searchQuery.toLowerCase().trim();
        if (!term) return [];
        return products
            .filter((product) => {
                const nameMatch = product.name.toLowerCase().includes(term);
                const brandMatch = product.brand?.toLowerCase().includes(term);
                const categoryMatch = product.category?.name.toLowerCase().includes(term);
                return nameMatch || brandMatch || categoryMatch;
            })
            .sort((a, b) => {
                const aName = a.name.toLowerCase();
                const bName = b.name.toLowerCase();
                const aStarts = aName.startsWith(term);
                const bStarts = bName.startsWith(term);
                if (aStarts && !bStarts) return -1;
                if (!aStarts && bStarts) return 1;
                return aName.localeCompare(bName);
            });
    }, [products, searchQuery]);

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

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setIsDropdownOpen(true);
        setIsMobileDropdownOpen(true);

        if (location.pathname === ROUTES.products) {
            const nextParams = new URLSearchParams(location.search);
            const trimmed = value.trim();
            if (trimmed) {
                nextParams.set("search", trimmed);
            } else {
                nextParams.delete("search");
            }
            navigate(`${ROUTES.products}?${nextParams.toString()}`, { replace: true });
        }
    };

    const handleSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const query = searchQuery.trim();
        setIsDropdownOpen(false);
        setIsMobileDropdownOpen(false);
        setIsOpen(false);
        navigate(query ? `${ROUTES.products}?search=${encodeURIComponent(query)}` : ROUTES.products);
    };

    const handleClearSearch = () => {
        setSearchQuery("");
        setIsDropdownOpen(false);
        setIsMobileDropdownOpen(false);
        if (location.pathname === ROUTES.products && new URLSearchParams(location.search).has("search")) {
            navigate(ROUTES.products);
        }
        searchInputRef.current?.focus();
    };

    const isLinkActive = (path: string) => {
        const [pathname, hash = ""] = path.split("#");
        return location.pathname === pathname && location.hash === (hash ? `#${hash}` : "");
    };

    return (
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
            <nav
                className="mx-auto flex min-h-18 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:min-h-20 lg:gap-6 lg:px-8"
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

                <div ref={searchContainerRef} className="relative ml-auto hidden min-w-0 max-w-sm flex-1 md:block">
                    <form
                        onSubmit={handleSearch}
                        className="flex min-w-0 w-full items-center rounded-2xl border border-slate-200 bg-slate-100/80 px-3 text-slate-500 transition focus-within:border-blue-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100"
                        role="search"
                    >
                        <button
                            type="submit"
                            className="shrink-0 rounded-lg p-1 text-slate-400 transition hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-blue-600"
                            aria-label="Buscar productos"
                            title="Buscar"
                        >
                            <FiSearch className="text-lg" aria-hidden="true" />
                        </button>
                        <label htmlFor="navbar-search" className="sr-only">Buscar productos</label>
                        <input
                            ref={searchInputRef}
                            id="navbar-search"
                            type="search"
                            value={searchQuery}
                            onFocus={() => {
                                if (searchQuery.trim().length > 0) setIsDropdownOpen(true);
                            }}
                            onChange={(event) => handleSearchChange(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Escape") {
                                    setIsDropdownOpen(false);
                                }
                            }}
                            placeholder="Buscar laptops, teléfonos, accesorios..."
                            className="min-h-11 min-w-0 flex-1 bg-transparent px-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
                            autoComplete="off"
                        />
                        {searchQuery.trim().length > 0 && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-blue-600"
                                aria-label="Limpiar búsqueda"
                                title="Limpiar búsqueda"
                            >
                                <FiX className="text-sm" aria-hidden="true" />
                            </button>
                        )}
                    </form>

                    {/* Live search dropdown results */}
                    {isDropdownOpen && searchQuery.trim().length > 0 && (
                        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[26rem] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl ring-1 ring-black/5">
                            <div className="flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                                <span>Productos sugeridos</span>
                                <span className="font-semibold text-slate-500">
                                    {matchingProducts.length} {matchingProducts.length === 1 ? "resultado" : "resultados"}
                                </span>
                            </div>

                            {matchingProducts.length > 0 ? (
                                <div className="flex flex-col gap-1">
                                    {matchingProducts.slice(0, 6).map((product) => {
                                        const finalPrice = product.discountPrice ?? product.price;
                                        const hasDiscount = Boolean(product.discountPrice && product.discountPrice < product.price);
                                        const image = product.images?.[0] || fallbackImage;

                                        return (
                                            <Link
                                                key={product._id}
                                                to={`/products/${product._id}`}
                                                onClick={() => setIsDropdownOpen(false)}
                                                className="group flex items-center gap-3 rounded-xl p-2 transition hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
                                            >
                                                <img
                                                    src={image}
                                                    alt={product.name}
                                                    className="h-12 w-12 shrink-0 rounded-lg object-contain bg-slate-50 p-1 border border-slate-100 group-hover:scale-105 transition-transform"
                                                    loading="lazy"
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                                        {product.name}
                                                    </p>
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                        {product.brand && <span className="truncate max-w-[8rem] font-medium">{product.brand}</span>}
                                                        {product.brand && product.category && <span>•</span>}
                                                        {product.category && <span className="truncate max-w-[8rem]">{product.category.name}</span>}
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-sm font-black text-slate-950">
                                                        ${finalPrice}
                                                    </p>
                                                    {hasDiscount && (
                                                        <p className="text-[0.7rem] font-semibold text-slate-400 line-through">
                                                            ${product.price}
                                                        </p>
                                                    )}
                                                </div>
                                            </Link>
                                        );
                                    })}

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsDropdownOpen(false);
                                            const query = searchQuery.trim();
                                            navigate(query ? `${ROUTES.products}?search=${encodeURIComponent(query)}` : ROUTES.products);
                                        }}
                                        className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2.5 text-xs font-bold text-blue-600 transition hover:bg-blue-50 hover:text-blue-700"
                                    >
                                        <span>Ver todos los resultados ({matchingProducts.length})</span>
                                        <FiArrowRight className="text-xs" aria-hidden="true" />
                                    </button>
                                </div>
                            ) : (
                                <div className="py-6 px-4 text-center">
                                    <p className="text-sm font-semibold text-slate-700">
                                        No se encontraron productos
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        No hay coincidencias para &quot;{searchQuery.trim()}&quot;
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    <Link
                        to={ROUTES.wishlist}
                        className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl text-slate-800 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                        aria-label={`Ver favoritos (${wishlistCount} productos)`}
                    >
                        <FiHeart aria-hidden="true" />
                        {wishlistCount > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[0.65rem] font-black text-white shadow-sm">
                                {wishlistCount > 99 ? "99+" : wishlistCount}
                            </span>
                        )}
                    </Link>

                    <Link
                        to={ROUTES.cart}
                        className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl text-slate-800 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                        aria-label="Ver carrito"
                    >
                        <FiShoppingCart aria-hidden="true" />
                    </Link>

                    <Link
                        to={user ? ROUTES.profile : ROUTES.login}
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
                    <div ref={mobileSearchContainerRef} className="relative mb-4">
                        <form onSubmit={handleSearch} className="flex items-center rounded-xl border border-slate-200 bg-slate-100 px-3" role="search">
                            <button
                                type="submit"
                                className="shrink-0 p-1 text-slate-500 hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-blue-600 rounded"
                                aria-label="Buscar productos"
                                title="Buscar"
                            >
                                <FiSearch className="text-lg" aria-hidden="true" />
                            </button>
                            <label htmlFor="mobile-navbar-search" className="sr-only">Buscar productos</label>
                            <input
                                id="mobile-navbar-search"
                                type="search"
                                value={searchQuery}
                                onFocus={() => {
                                    if (searchQuery.trim().length > 0) setIsMobileDropdownOpen(true);
                                }}
                                onChange={(event) => handleSearchChange(event.target.value)}
                                placeholder="Buscar productos..."
                                className="min-h-12 min-w-0 flex-1 bg-transparent px-2.5 text-sm outline-none [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
                                autoComplete="off"
                            />
                            {searchQuery.trim().length > 0 && (
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                                    aria-label="Limpiar búsqueda"
                                    title="Limpiar búsqueda"
                                >
                                    <FiX className="text-base" aria-hidden="true" />
                                </button>
                            )}
                        </form>

                        {isMobileDropdownOpen && searchQuery.trim().length > 0 && (
                            <div className="mt-2 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                                <div className="flex items-center justify-between px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                                    <span>Productos sugeridos</span>
                                    <span className="font-semibold text-slate-500">
                                        {matchingProducts.length}
                                    </span>
                                </div>
                                {matchingProducts.length > 0 ? (
                                    <div className="flex flex-col gap-1">
                                        {matchingProducts.slice(0, 5).map((product) => {
                                            const finalPrice = product.discountPrice ?? product.price;
                                            const image = product.images?.[0] || fallbackImage;

                                            return (
                                                <Link
                                                    key={product._id}
                                                    to={`/products/${product._id}`}
                                                    onClick={() => {
                                                        setIsMobileDropdownOpen(false);
                                                        setIsOpen(false);
                                                    }}
                                                    className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-slate-50"
                                                >
                                                    <img
                                                        src={image}
                                                        alt={product.name}
                                                        className="h-10 w-10 shrink-0 rounded object-contain bg-slate-50 p-1 border border-slate-100"
                                                        loading="lazy"
                                                    />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-xs font-bold text-slate-900">
                                                            {product.name}
                                                        </p>
                                                        <p className="text-[0.7rem] text-slate-500 truncate">
                                                            {product.category?.name ?? product.brand}
                                                        </p>
                                                    </div>
                                                    <p className="text-xs font-black text-slate-950 shrink-0">
                                                        ${finalPrice}
                                                    </p>
                                                </Link>
                                            );
                                        })}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsMobileDropdownOpen(false);
                                                setIsOpen(false);
                                                const query = searchQuery.trim();
                                                navigate(query ? `${ROUTES.products}?search=${encodeURIComponent(query)}` : ROUTES.products);
                                            }}
                                            className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-50"
                                        >
                                            <span>Ver todos ({matchingProducts.length})</span>
                                            <FiArrowRight className="text-xs" aria-hidden="true" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="py-4 px-3 text-center">
                                        <p className="text-xs font-medium text-slate-600">
                                            Sin coincidencias para &quot;{searchQuery.trim()}&quot;
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
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
                        <NavLink
                            to={ROUTES.wishlist}
                            onClick={() => setIsOpen(false)}
                            className={() => `flex min-h-11 items-center justify-between rounded-xl px-4 font-bold ${
                                isLinkActive(ROUTES.wishlist)
                                    ? "bg-red-50 text-red-600"
                                    : "text-slate-800 hover:bg-slate-50"
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                <FiHeart aria-hidden="true" />
                                Favoritos
                            </span>
                            {wishlistCount > 0 && (
                                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                                    {wishlistCount}
                                </span>
                            )}
                        </NavLink>
                        {user ? (
                            <NavLink
                                to={ROUTES.profile}
                                onClick={() => setIsOpen(false)}
                                className={() => `flex min-h-11 items-center gap-2 rounded-xl px-4 font-bold ${
                                    isLinkActive(ROUTES.profile)
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-slate-800 hover:bg-slate-50"
                                }`}
                            >
                                <FiUser aria-hidden="true" />
                                Mi perfil
                            </NavLink>
                        ) : (
                            <Link
                                to={ROUTES.login}
                                onClick={() => setIsOpen(false)}
                                className="flex min-h-11 items-center gap-2 rounded-xl px-4 font-bold text-slate-800 hover:bg-slate-50 sm:hidden"
                            >
                                <FiUser aria-hidden="true" />
                                Iniciar sesión
                            </Link>
                        )}
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
