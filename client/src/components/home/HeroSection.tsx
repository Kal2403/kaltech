import {
    FiArrowRight,
    FiCreditCard,
    FiHeadphones,
    FiShield,
    FiTruck,
} from "react-icons/fi";
import { Link } from "react-router-dom";

import heroStorefront from "../../assets/hero-storefront.png";
import { ROUTES } from "../../routes/paths";

const metrics = [
    { value: "+2.500", label: "Clientes felices" },
    { value: "+180", label: "Productos" },
    { value: "4.8/5", label: "Valoración" },
];

const benefits = [
    { label: "Compra segura", detail: "Pagos cifrados y protegidos", icon: FiCreditCard },
    { label: "Envío rápido", detail: "Entrega en 24–48 horas", icon: FiTruck },
    { label: "Garantía oficial", detail: "Hasta 24 meses de cobertura", icon: FiShield },
    { label: "Soporte 24/7", detail: "Te acompañamos siempre", icon: FiHeadphones },
];

export const HeroSection = () => {
    return (
        <section className="bg-white">
            <div className="relative overflow-hidden bg-[#061637] text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_45%,rgba(37,99,235,0.24),transparent_36%),linear-gradient(110deg,#06132f_0%,#0a1e49_54%,#102b67_100%)]" />

                <div className="relative mx-auto grid min-h-[33.5rem] max-w-6xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-20 xl:min-h-[36rem]">
                    <div className="max-w-xl lg:py-3">
                        <span className="inline-flex rounded-full border border-blue-400/50 bg-blue-500/10 px-4 py-1.5 text-[0.65rem] font-black uppercase tracking-[0.23em] text-blue-400">
                            Nueva temporada 2026
                        </span>

                        <h1 className="mt-6 text-[2.7rem] font-black leading-[1.05] tracking-[-0.045em] sm:text-5xl lg:text-[3.55rem]">
                            Tecnología que
                            <span className="block text-blue-500">mejora tu día</span>
                        </h1>

                        <p className="mt-6 max-w-lg text-base leading-7 text-slate-300 sm:text-lg">
                            Laptops, smartphones, audio y accesorios originales. Precios
                            claros, envío rápido y garantía oficial en cada compra.
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link
                                to={ROUTES.products}
                                className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-blue-600 px-6 text-sm font-extrabold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
                            >
                                Ver catálogo
                                <FiArrowRight className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                            </Link>
                            <Link
                                to={`${ROUTES.home}#offers`}
                                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-blue-300/30 bg-white/5 px-6 text-sm font-extrabold text-white transition hover:border-blue-300/60 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
                            >
                                Ofertas del mes
                            </Link>
                        </div>

                        <dl className="mt-10 grid max-w-md grid-cols-3 gap-6">
                            {metrics.map((metric) => (
                                <div key={metric.label} className="flex flex-col">
                                    <dt className="text-xs text-slate-400">{metric.label}</dt>
                                    <dd className="order-first mb-0.5 text-xl font-black text-blue-500 sm:text-2xl">{metric.value}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>

                    <div className="relative mx-auto w-full max-w-[38rem] lg:justify-self-end">
                        <div className="absolute -inset-5 rounded-[2rem] bg-blue-500/20 blur-3xl" aria-hidden="true" />
                        <img
                            src={heroStorefront}
                            alt="Laptop, auriculares, teléfono y reloj inteligente disponibles en KalTech"
                            className="relative aspect-[4/3] w-full rounded-[1.65rem] border border-white/10 object-cover shadow-[0_32px_80px_-32px_rgba(0,0,0,0.7)]"
                        />
                    </div>
                </div>
            </div>

            <div className="border-b border-slate-200 bg-white">
                <div className="mx-auto grid max-w-6xl grid-cols-1 px-5 py-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:px-8">
                    {benefits.map(({ label, detail, icon: Icon }) => (
                        <div key={label} className="flex items-center gap-4 px-2 py-3 lg:px-4">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg text-blue-600">
                                <Icon aria-hidden="true" />
                            </span>
                            <div>
                                <p className="text-sm font-extrabold text-slate-900">{label}</p>
                                <p className="mt-0.5 text-xs text-slate-500">{detail}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
