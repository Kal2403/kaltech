import { Link } from "react-router-dom";
import { FiBox, FiGrid, FiSearch, FiShoppingBag } from "react-icons/fi";

import heroImage from "../../assets/hero.png";

const benefits = [
    { label: "Catálogo conectado", detail: "Productos disponibles", icon: FiGrid },
    { label: "Búsqueda sencilla", detail: "Encuentra tu equipo", icon: FiSearch },
    { label: "Carrito integrado", detail: "Organiza tu compra", icon: FiShoppingBag },
    { label: "Órdenes visibles", detail: "Consulta tus pedidos", icon: FiBox },
];

export const HeroSection = () => {
    return (
        <section className="bg-slate-50 px-4 pb-10 pt-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-blue-100 bg-[#061426] shadow-[0_24px_70px_-36px_rgba(15,23,42,0.7)]">
                <div className="relative grid min-h-[34rem] overflow-hidden lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_30%,rgba(37,99,235,0.3),transparent_34%)]" />
                    <div className="relative z-10 px-7 py-14 sm:px-12 lg:px-16 lg:py-20">
                        <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-300">
                            <span className="h-2 w-2 rounded-full bg-blue-400" />
                            Tecnología para tu día
                        </span>

                        <h1 className="mt-7 max-w-xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                            Tecnología que mejora tu día a día
                        </h1>
                        <p className="mt-6 max-w-lg text-base leading-7 text-slate-300 sm:text-lg">
                            Descubre equipos y accesorios seleccionados para trabajar,
                            crear y disfrutar con confianza.
                        </p>

                        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                            <Link
                                to="/products"
                                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-blue-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
                            >
                                Ver productos
                            </Link>
                            <Link
                                to="/products"
                                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/20 bg-white/5 px-7 py-3 text-sm font-bold text-white transition hover:border-white/40 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
                            >
                                Explorar categorías
                            </Link>
                        </div>
                    </div>

                    <div className="relative z-10 flex min-h-80 items-center justify-center px-6 pb-12 lg:min-h-[34rem] lg:px-10 lg:py-12">
                        <div className="absolute h-72 w-72 rounded-full bg-blue-600/25 blur-3xl sm:h-96 sm:w-96" />
                        <img
                            src={heroImage}
                            alt="Computador, teléfono y accesorios disponibles en KalTech"
                            className="relative max-h-[27rem] w-full object-contain drop-shadow-[0_32px_30px_rgba(0,0,0,0.45)]"
                        />
                    </div>
                </div>

                <div className="relative z-20 grid border-t border-white/10 bg-white px-6 py-6 sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
                    {benefits.map(({ label, detail, icon: Icon }, index) => (
                        <div
                            key={label}
                            className={`flex items-center gap-4 px-3 py-4 ${index > 0 ? "lg:border-l lg:border-slate-200" : ""}`}
                        >
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xl text-blue-600">
                                <Icon aria-hidden="true" />
                            </span>
                            <div>
                                <p className="text-sm font-extrabold text-slate-950">{label}</p>
                                <p className="mt-0.5 text-xs text-slate-500">{detail}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
