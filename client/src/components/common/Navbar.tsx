import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
    FiMenu,
    FiSearch,
    FiShoppingCart,
    FiUser,
    FiX,
} from "react-icons/fi";

import { ROUTES } from "../../routes/paths";

const navLinks = [
    { label: "Home", path: ROUTES.home },
    { label: "Products", path: ROUTES.products },
    { label: "My Orders", path: ROUTES.orders },
    { label: "Categories", path: "/categories" },
    { label: "Deals", path: "/deals" },
];

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 bg-white px-4 py-4 shadow-sm">
            <nav className="mx-auto flex max-w-7xl items-center gap-6 rounded-2xl bg-white">
                <Link
                    to={ROUTES.home}
                    className="text-3xl font-black tracking-tight"
                >
                    <span className="text-blue-600">Kal</span>
                    <span className="text-slate-950">Tech</span>
                </Link>

                <div className="hidden items-center gap-10 lg:flex">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) =>
                                `relative text-base font-bold transition hover:text-blue-600 ${isActive
                                    ? "text-blue-600"
                                    : "text-slate-950"
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {link.label}

                                    {isActive && (
                                        <span className="absolute -bottom-7 left-0 h-1 w-full rounded-full bg-blue-600" />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>

                <div className="ml-auto hidden max-w-xl flex-1 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 lg:flex">
                    <FiSearch className="text-xl text-slate-500" />

                    <input
                        type="text"
                        placeholder="Search laptops, phones, accessories..."
                        className="ml-3 w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                    />

                    <FiSearch className="text-xl text-slate-950" />
                </div>

                <div className="hidden items-center gap-4 lg:flex">
                    <Link
                        to={ROUTES.cart}
                        className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-100 text-2xl text-slate-950 shadow-sm transition hover:text-blue-600"
                        aria-label="View shopping cart"
                    >
                        <FiShoppingCart />
                    </Link>

                    <Link
                        to={ROUTES.login}
                        className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white shadow-sm transition hover:bg-blue-700"
                    >
                        <FiUser />
                        Login
                    </Link>
                </div>

                <button
                    type="button"
                    aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
                    className="ml-auto text-3xl lg:hidden"
                    onClick={() => setIsOpen((previousState) => !previousState)}
                >
                    {isOpen ? <FiX /> : <FiMenu />}
                </button>
            </nav>

            {isOpen && (
                <div className="mx-auto mt-4 max-w-7xl rounded-2xl border border-slate-100 bg-white p-4 shadow-lg lg:hidden">
                    <div className="mb-4 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <FiSearch className="text-xl text-slate-500" />

                        <input
                            type="text"
                            placeholder="Search products..."
                            className="ml-3 w-full bg-transparent text-sm outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-3">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className={({ isActive }) =>
                                    `rounded-xl px-4 py-3 font-bold ${isActive
                                        ? "bg-blue-50 text-blue-600"
                                        : "text-slate-900 hover:bg-slate-50"
                                    }`
                                }
                            >
                                {link.label}
                            </NavLink>
                        ))}

                        <Link
                            to={ROUTES.cart}
                            onClick={() => setIsOpen(false)}
                            className="rounded-xl px-4 py-3 font-bold text-slate-900 hover:bg-slate-50"
                        >
                            Cart
                        </Link>

                        <Link
                            to={ROUTES.login}
                            onClick={() => setIsOpen(false)}
                            className="rounded-xl bg-blue-600 px-4 py-3 text-center font-bold text-white"
                        >
                            Login
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
};
