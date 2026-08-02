export type SortOption =
    | "featured"
    | "price-asc"
    | "price-desc"
    | "name-asc"
    | "name-desc";

interface ProductSortProps {
    value: SortOption;
    onChange: (value: SortOption) => void;
}

const sortOptions: Array<{
    value: SortOption;
    label: string;
}> = [
        { value: "featured", label: "Destacados" },
        { value: "price-asc", label: "Precio: menor a mayor" },
        { value: "price-desc", label: "Precio: mayor a menor" },
        { value: "name-asc", label: "Nombre (A-Z)" },
        { value: "name-desc", label: "Nombre (Z-A)" },
    ];

export const ProductSort = ({ value, onChange }: ProductSortProps) => {
    return (
        <select
            aria-label="Ordenar productos"
            value={value}
            onChange={(event) => onChange(event.target.value as SortOption)}
            className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        >
            {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
};
