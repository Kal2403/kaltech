import { Link, NavLink } from "react-router-dom";
import { ROUTES } from "../../routes/paths";

const navLinks = [
    { label: "Home", path: ROUTES.home },
    { label: "Products", path: ROUTES.products },
    { label: "Cart", path: ROUTES.cart },
];

export const Navbar = () => {
    return (
        <header className="border-b bg-white">
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                <Link to={ROUTES.home} className="text-2xl font-bold text-slate-900">
                    KalTech
                </Link>

                <div className="flex items-center gap-6">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) =>
                                isActive
                                    ? "font-medium text-blue-600"
                                    : "font-medium text-slate-700 hover:text-blue-500"
                            }
                        >
                            {link.label}
                        </NavLink>
                    ))}

                    <Link
                        to={ROUTES.login}
                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                    >
                        Login
                    </Link>
                </div>
            </nav>
        </header>
    )
}
