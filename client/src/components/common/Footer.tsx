import { Link } from "react-router-dom";
import {
    FiCornerDownLeft,
    FiLock,
    FiMail,
    FiPhone,
    FiShield,
    FiTruck,
} from "react-icons/fi";

import { ROUTES } from "../../routes/paths";

const benefits = [
    {
        icon: FiTruck,
        title: "Envío Rápido 24-48h",
        copy: "Gratis en pedidos superiores a $1,000",
    },
    {
        icon: FiCornerDownLeft,
        title: "30 Días de Devolución",
        copy: "Sin complicaciones ni preguntas",
    },
    {
        icon: FiShield,
        title: "Garantía Oficial de 3 Años",
        copy: "Cobertura total ante defectos de fábrica",
    },
    {
        icon: FiLock,
        title: "Pago 100% Protegido",
        copy: "Transacciones cifradas bajo SSL/TLS",
    },
];

export const Footer = () => {
    return (
        <footer className="bg-[#03101f] text-white">
            {/* Top Benefits Banner */}
            <div className="border-b border-white/10">
                <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
                    {benefits.map(({ icon: Icon, title, copy }) => (
                        <div key={title} className="flex items-center gap-4">
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600/15 text-xl text-blue-400">
                                <Icon aria-hidden="true" />
                            </span>
                            <div>
                                <p className="font-extrabold text-sm text-slate-100">{title}</p>
                                <p className="mt-0.5 text-xs text-slate-400">{copy}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Footer Links Columns */}
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
                    {/* Brand Column */}
                    <div className="lg:col-span-2">
                        <Link to={ROUTES.home} className="text-2xl font-black tracking-[-0.04em]" aria-label="KalTech, inicio">
                            <span className="text-blue-500">KAL</span>TECH
                        </Link>
                        <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                            Tecnología que mejora tu día
                        </p>
                        <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
                            Tienda especializada en laptops, smartphones, periféricos y electrónica de consumo. Garantía oficial, envíos rápidos y soporte técnico personalizado.
                        </p>

                        <div className="mt-6 space-y-2">
                            <div className="flex items-center gap-2.5 text-xs text-slate-400">
                                <FiMail className="text-blue-400" aria-hidden="true" />
                                <a href="mailto:soporte@kaltech.com" className="transition hover:text-white">
                                    soporte@kaltech.com
                                </a>
                            </div>
                            <div className="flex items-center gap-2.5 text-xs text-slate-400">
                                <FiPhone className="text-blue-400" aria-hidden="true" />
                                <a href="tel:+34900123456" className="transition hover:text-white">
                                    +34 900 123 456 (L-V 09:00 - 19:00)
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Catálogo */}
                    <div>
                        <p className="text-xs font-black uppercase tracking-wider text-slate-200">
                            Catálogo
                        </p>
                        <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
                            <li>
                                <Link to={ROUTES.products} className="transition hover:text-white">
                                    Todos los Productos
                                </Link>
                            </li>
                            <li>
                                <Link to={ROUTES.categories} className="transition hover:text-white">
                                    Categorías
                                </Link>
                            </li>
                            <li>
                                <Link to={ROUTES.offers} className="transition hover:text-white">
                                    Ofertas y Rebajas
                                </Link>
                            </li>
                            <li>
                                <Link to={ROUTES.wishlist} className="transition hover:text-white">
                                    Lista de Deseos
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Atención al Cliente */}
                    <div>
                        <p className="text-xs font-black uppercase tracking-wider text-slate-200">
                            Atención al Cliente
                        </p>
                        <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
                            <li>
                                <Link to={ROUTES.contact} className="transition hover:text-white">
                                    Contacto y Soporte
                                </Link>
                            </li>
                            <li>
                                <Link to={ROUTES.shipping} className="transition hover:text-white">
                                    Envíos y Entregas
                                </Link>
                            </li>
                            <li>
                                <Link to={ROUTES.shipping} className="transition hover:text-white">
                                    Devoluciones y Cambios
                                </Link>
                            </li>
                            <li>
                                <Link to={ROUTES.orders} className="transition hover:text-white">
                                    Seguimiento de Pedidos
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Legal y Privacidad */}
                    <div>
                        <p className="text-xs font-black uppercase tracking-wider text-slate-200">
                            Legal
                        </p>
                        <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
                            <li>
                                <Link to={ROUTES.terms} className="transition hover:text-white">
                                    Términos y Condiciones
                                </Link>
                            </li>
                            <li>
                                <Link to={ROUTES.privacy} className="transition hover:text-white">
                                    Política de Privacidad
                                </Link>
                            </li>
                            <li>
                                <Link to={ROUTES.shipping} className="transition hover:text-white">
                                    Garantías y Reclamaciones
                                </Link>
                            </li>
                            <li>
                                <Link to={ROUTES.contact} className="transition hover:text-white">
                                    Atención al Consumidor
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar: Copyright & Payment Badges */}
            <div className="border-t border-white/10 bg-[#020b16]">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:px-6 md:flex-row lg:px-8">
                    <p className="text-xs text-slate-400 text-center md:text-left">
                        © {new Date().getFullYear()} KalTech. Todos los derechos reservados. Plataforma de comercio electrónico segura.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
                        <Link to={ROUTES.terms} className="transition hover:text-white">
                            Términos
                        </Link>
                        <span>•</span>
                        <Link to={ROUTES.privacy} className="transition hover:text-white">
                            Privacidad
                        </Link>
                        <span>•</span>
                        <Link to={ROUTES.shipping} className="transition hover:text-white">
                            Envíos
                        </Link>
                        <span>•</span>
                        <Link to={ROUTES.contact} className="transition hover:text-white">
                            Soporte
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
