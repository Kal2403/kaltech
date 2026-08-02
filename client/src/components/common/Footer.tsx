import { Link } from "react-router-dom";
import { FiBox, FiShield, FiTruck } from "react-icons/fi";

import { ROUTES } from "../../routes/paths";

const benefits = [
    { icon: FiTruck, title: "Carrito y checkout", copy: "Completa el flujo de tu compra" },
    { icon: FiShield, title: "Gestión de pedidos", copy: "Consulta el estado registrado" },
    { icon: FiBox, title: "Catálogo organizado", copy: "Explora productos disponibles" },
];

export const Footer = () => {
    return (
        <footer className="bg-[#03101f] text-white">
            <div className="border-b border-white/10">
                <div className="mx-auto grid max-w-7xl gap-6 px-5 py-9 sm:px-6 md:grid-cols-3 lg:px-8">
                    {benefits.map(({ icon: Icon, title, copy }) => (
                        <div key={title} className="flex items-center gap-4">
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600/15 text-xl text-blue-400">
                                <Icon aria-hidden="true" />
                            </span>
                            <div>
                                <p className="font-extrabold">{title}</p>
                                <p className="mt-1 text-sm text-slate-400">{copy}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-9 sm:px-6 md:flex-row md:items-end md:justify-between lg:px-8">
                <div>
                    <Link to={ROUTES.home} className="text-2xl font-black tracking-[-0.04em]" aria-label="KalTech, inicio">
                        <span className="text-blue-500">KAL</span>TECH
                    </Link>
                    <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">
                        Tecnología que mejora tu día. Una experiencia e-commerce construida con el stack MERN.
                    </p>
                </div>
                <p className="text-sm text-slate-400">
                    © {new Date().getFullYear()} KalTech. Todos los derechos reservados.
                </p>
            </div>
        </footer>
    );
};
