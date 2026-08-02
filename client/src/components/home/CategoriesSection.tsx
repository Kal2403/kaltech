import { Link } from "react-router-dom";
import { FiArrowUpRight, FiHeadphones, FiMonitor, FiSmartphone, FiWatch } from "react-icons/fi";
import { IoGameControllerOutline } from "react-icons/io5";

const categories = [
    { name: "Celulares", icon: FiSmartphone },
    { name: "Audio", icon: FiHeadphones },
    { name: "Computadores", icon: FiMonitor },
    { name: "Smartwatch", icon: FiWatch },
    { name: "Accesorios", icon: IoGameControllerOutline },
];

export const CategoriesSection = () => (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Categorías</p>
                    <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Encuentra lo que necesitas</h2>
                    <p className="mt-3 max-w-xl text-slate-600">Explora tecnología para cada momento de tu día.</p>
                </div>
                <Link to="/products" className="font-bold text-blue-600 hover:text-blue-700 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600">Ver todos los productos</Link>
            </div>

            <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {categories.map(({ name, icon: Icon }) => (
                    <Link
                        key={name}
                        to="/products"
                        className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:border-blue-300 hover:bg-white hover:shadow-xl hover:shadow-slate-200/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl text-blue-600 shadow-sm transition group-hover:bg-blue-600 group-hover:text-white"><Icon aria-hidden="true" /></span>
                        <span className="mt-5 flex items-center justify-between gap-2 font-extrabold text-slate-900">
                            {name}<FiArrowUpRight className="text-blue-600 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    </section>
);
