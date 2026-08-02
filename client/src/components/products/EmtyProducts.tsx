import { Link } from "react-router-dom";
import { FiSearch } from "react-icons/fi";

export const EmtyProducts = () => (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-2xl text-blue-600"><FiSearch aria-hidden="true" /></span>
        <h3 className="mt-5 text-2xl font-black text-slate-950">No encontramos productos</h3>
        <p className="mx-auto mt-3 max-w-md text-slate-600">Prueba con otra búsqueda o vuelve al catálogo completo.</p>
        <Link to="/products" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Ver catálogo</Link>
    </div>
);
