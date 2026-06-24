import { FiCreditCard, FiHeadphones, FiShield, FiTruck } from "react-icons/fi";

import heroImage from "../../assets/hero.png";

const benefits = [
    {
        label: "Garantía asegurada",
        icon: <FiShield />,
    },
    {
        label: "Atención al cliente",
        icon: <FiHeadphones />,
    },
    {
        label: "Pagos 100% seguros",
        icon: <FiCreditCard />,
    },
    {
        label: "Envíos rápidos y seguros",
        icon: <FiTruck />,
    },
];

export const HeroSection = () => {
    return (
        <section className="bg-slate-50 px-4 pb-6">
            <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
                <div className="grid lg:grid-cols-[1fr_1.15fr]">
                    <div className="relative px-8 py-14 lg:px-20 lg:py-20">
                        <div className="mb-8 grid w-28 grid-cols-6 gap-2">
                            {Array.from({ length: 36 }).map((_, index) => (
                                <span
                                    key={index}
                                    className="h-1.5 w-1.5 rounded-full bg-blue-500"
                                />
                            ))}
                        </div>

                        <h1 className="text-4xl font-black uppercase leading-tight text-slate-950 md:text-5xl">
                            Los mejores productos
                            <span className="block text-5xl text-blue-600 md:text-6xl">
                                de tecnología
                            </span>
                        </h1>

                        <p className="mt-5 text-xl font-black uppercase tracking-wide text-slate-950">
                            Calidad <span className="mx-2">•</span> Innovación{" "}
                            <span className="mx-2">•</span> Confianza
                        </p>

                        <p className="mt-8 max-w-md border-l-4 border-blue-600 pl-5 text-xl leading-snug text-slate-800">
                            Descubre lo último en tecnología con garantía, seguridad y el
                            mejor servicio.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-4">
                            <a
                                href="/products"
                                className="rounded-lg bg-blue-600 px-7 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
                            >
                                Ver productos
                            </a>

                            <a
                                href="/deals"
                                className="rounded-lg border border-blue-200 bg-white px-7 py-3 text-sm font-bold text-slate-950 shadow-sm transition hover:border-blue-600 hover:text-blue-600"
                            >
                                Conocer ofertas
                            </a>
                        </div>
                    </div>

                    <div className="relative flex min-h-105 items-center justify-center overflow-hidden bg-slate-950 px-8 py-12">
                        <div className="absolute inset-y-0 -left-20 w-56 -skew-x-12 bg-blue-600 md:-left-20 md:w-72" />
                        <div className="absolute inset-0 bg-linear-to-br from-blue-950 via-slate-950 to-slate-900" />

                        <div className="absolute right-8 top-10 z-10 hidden items-center gap-8 text-sm font-black uppercase text-white md:flex">
                            <span>Compra segura</span>
                            <span>Productos de calidad</span>
                        </div>

                        <div className="relative z-10">
                            <img
                                src={heroImage}
                                alt="Productos destacados de KalTech"
                                className="max-h-90 w-full object-contain drop-shadow-2xl"
                            />
                        </div>

                        <div className="absolute bottom-16 left-20 right-10 h-16 rounded-sm bg-white/90" />
                    </div>
                </div>

                <div className="grid gap-6 bg-slate-950 px-8 py-8 text-white md:grid-cols-2 lg:grid-cols-5 lg:px-16">
                    {benefits.map((benefit) => (
                        <div key={benefit.label} className="flex items-center gap-4">
                            <div className="text-4xl text-white">{benefit.icon}</div>
                            <p className="text-sm font-black uppercase leading-tight">
                                {benefit.label}
                            </p>
                        </div>
                    ))}

                    <div className="lg:text-right">
                        <p className="text-3xl font-black uppercase">KalTech</p>
                        <p className="text-sm uppercase tracking-wide text-slate-300">
                            Tu tienda de tecnología de confianza
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};
