import {
    FiArrowRight,
    FiBox,
    FiGrid,
    FiSearch,
    FiShoppingBag,
} from "react-icons/fi";
import { Link } from "react-router-dom";

import heroImage from "../../assets/hero.png";
import { ROUTES } from "../../routes/paths";

const capabilities = [
    { label: "Catálogo conectado", detail: "Productos disponibles", icon: FiGrid },
    { label: "Búsqueda sencilla", detail: "Encuentra tu equipo", icon: FiSearch },
    { label: "Carrito integrado", detail: "Organiza tu compra", icon: FiShoppingBag },
    { label: "Órdenes visibles", detail: "Consulta tus pedidos", icon: FiBox },
];

export const HeroSection = () => {
    return (
        <section className="bg-slate-50 px-3 pb-16 pt-5 sm:px-5 sm:pb-20 lg:pt-6">
            <div className="mx-auto max-w-[1380px] pb-18 sm:pb-20">
                <div className="relative min-h-[42rem] overflow-hidden rounded-[1.75rem] border border-blue-950/40 bg-[#020f23] shadow-[0_32px_80px_-42px_rgba(2,15,35,0.9)] sm:min-h-[46rem] lg:min-h-[48rem]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_35%,rgba(14,91,255,0.48),transparent_36%),linear-gradient(120deg,#020b19_5%,#03152f_55%,#062b68_100%)]" />
                    <div className="absolute -right-24 top-14 h-96 w-[44rem] rotate-[-24deg] bg-blue-500/10 blur-3xl" />

                    <div className="relative z-10 grid min-h-[36rem] lg:min-h-[42rem] lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
                        <div className="px-7 pb-6 pt-12 sm:px-12 sm:pt-16 lg:px-16 lg:py-20 xl:px-18">
                            <span className="inline-flex items-center gap-3 rounded-full border border-blue-400/60 bg-blue-500/10 px-4 py-2 text-[0.68rem] font-black uppercase tracking-[0.2em] text-blue-300 sm:text-xs">
                                <span className="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_14px_rgba(96,165,250,0.9)]" />
                                Tecnología para tu día
                            </span>

                            <h1 className="mt-8 max-w-2xl text-[2.65rem] font-black leading-[1.04] tracking-[-0.045em] text-white sm:text-6xl lg:text-[4rem] xl:text-[4.5rem]">
                                Tecnología que mejora tu día a día
                            </h1>
                            <p className="mt-6 max-w-lg text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
                                Descubre equipos y accesorios seleccionados para trabajar,
                                crear y disfrutar con confianza.
                            </p>

                            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                <Link
                                    to={ROUTES.products}
                                    className="group inline-flex min-h-13 items-center justify-center gap-4 rounded-xl bg-blue-600 px-7 py-3 text-sm font-extrabold text-white shadow-xl shadow-blue-950/40 transition hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
                                >
                                    Ver productos
                                    <FiArrowRight className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                                </Link>
                                <Link
                                    to={ROUTES.products}
                                    className="group inline-flex min-h-13 items-center justify-center gap-4 rounded-xl border border-white/30 bg-white/5 px-7 py-3 text-sm font-extrabold text-white transition hover:border-white/60 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
                                >
                                    Explorar catálogo
                                    <FiArrowRight className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                                </Link>
                            </div>
                        </div>

                        <div className="relative flex min-h-80 items-center justify-center px-5 pb-26 sm:min-h-96 sm:px-10 lg:min-h-[42rem] lg:px-5 lg:pb-10 lg:pr-10">
                            <div className="absolute h-64 w-64 rounded-full bg-blue-500/35 blur-[90px] sm:h-96 sm:w-96 lg:h-[30rem] lg:w-[30rem]" />
                            <div className="absolute bottom-24 h-18 w-4/5 rounded-[50%] bg-cyan-400/25 blur-2xl lg:bottom-24" />
                            <img
                                src={heroImage}
                                alt="Computador, teléfono y accesorios disponibles en KalTech"
                                className="relative w-full max-w-3xl object-contain drop-shadow-[0_38px_32px_rgba(0,0,0,0.55)] lg:scale-110 xl:scale-[1.16]"
                            />
                        </div>
                    </div>

                    <div className="pointer-events-none absolute inset-x-8 bottom-24 hidden h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent lg:block" />
                </div>

                <div className="relative z-20 -mt-26 mx-4 grid overflow-hidden rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.35)] sm:-mt-24 sm:mx-7 sm:grid-cols-2 sm:px-7 lg:mx-7 lg:grid-cols-4 lg:px-8 lg:py-7">
                    {capabilities.map(({ label, detail, icon: Icon }, index) => (
                        <div
                            key={label}
                            className={`flex items-center gap-4 px-2 py-4 sm:px-4 ${
                                index % 2 === 1 ? "sm:border-l sm:border-slate-200" : ""
                            } ${index > 1 ? "sm:border-t lg:border-t-0" : ""} ${
                                index > 0 ? "lg:border-l lg:border-slate-200" : "lg:border-l-0"
                            }`}
                        >
                            <span className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[1.45rem] text-blue-600 sm:h-15 sm:w-15">
                                <Icon aria-hidden="true" />
                            </span>
                            <div>
                                <p className="text-sm font-black text-slate-950 sm:text-base">{label}</p>
                                <p className="mt-1 text-xs text-slate-500 sm:text-sm">{detail}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
