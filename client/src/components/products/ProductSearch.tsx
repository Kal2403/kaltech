import { FiSearch, FiX } from "react-icons/fi";

interface ProductSearchProps { value: string; onChange: (value: string) => void; }

export const ProductSearch = ({ value, onChange }: ProductSearchProps) => (
    <div className="relative flex min-h-12 items-center rounded-xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
        <FiSearch className="shrink-0 text-xl text-slate-400" aria-hidden="true" />
        <label htmlFor="product-search" className="sr-only">Buscar productos</label>
        <input id="product-search" type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder="Buscar por nombre o descripción..." className="ml-3 min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400" />
        {value && <button type="button" onClick={() => onChange("")} className="ml-2 rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-blue-600" aria-label="Limpiar búsqueda"><FiX aria-hidden="true" /></button>}
    </div>
);
