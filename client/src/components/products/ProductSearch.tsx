import { FiSearch } from "react-icons/fi";

interface ProductSearchProps {
    value: string;
    onChange: (value: string) => void;
}

export const ProductSearch = ({ value, onChange}: ProductSearchProps) => {
    return (
        <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <FiSearch className="text-xl text-slate-500" />

            <input 
                type="text"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder="Buscar productos..."
                className="ml-3 w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
        </div>
    );
};
