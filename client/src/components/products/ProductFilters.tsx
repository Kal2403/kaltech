import { FiFilter, FiRotateCcw, FiCheck } from "react-icons/fi";
import { StarRating } from "../common/StarRating";
import type {
    BrandFilterOption,
    CategoryFilterOption,
} from "../../hooks/useProducts";

interface ProductFiltersProps {
    availableCategories: CategoryFilterOption[];
    selectedCategory: string;
    onSelectCategory: (category: string) => void;

    availableBrands: BrandFilterOption[];
    selectedBrands: string[];
    onToggleBrand: (brand: string) => void;

    priceBounds: { min: number; max: number };
    minPrice?: number;
    maxPrice?: number;
    onPriceChange: (min?: number, max?: number) => void;

    minRating?: number;
    onRatingChange: (rating?: number) => void;

    inStock: boolean;
    onInStockChange: (inStock: boolean) => void;

    onClearFilters: () => void;
    hasActiveFilters: boolean;
    activeFilterCount: number;
    className?: string;
}

export const ProductFilters = ({
    availableCategories,
    selectedCategory,
    onSelectCategory,
    availableBrands,
    selectedBrands,
    onToggleBrand,
    priceBounds,
    minPrice,
    maxPrice,
    onPriceChange,
    minRating,
    onRatingChange,
    inStock,
    onInStockChange,
    onClearFilters,
    hasActiveFilters,
    activeFilterCount,
    className = "",
}: ProductFiltersProps) => {
    const handleApplyPrice = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const minVal = formData.get("minPrice") as string;
        const maxVal = formData.get("maxPrice") as string;
        const parsedMin = minVal ? Number(minVal) : undefined;
        const parsedMax = maxVal ? Number(maxVal) : undefined;
        onPriceChange(parsedMin, parsedMax);
    };

    return (
        <aside
            className={`flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
            aria-label="Filtros del catálogo"
        >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                    <FiFilter className="text-blue-600" aria-hidden="true" />
                    <h2 className="text-lg font-black text-slate-950">Filtros</h2>
                    {activeFilterCount > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                            {activeFilterCount}
                        </span>
                    )}
                </div>

                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={onClearFilters}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 transition hover:text-blue-800"
                    >
                        <FiRotateCcw className="text-xs" aria-hidden="true" />
                        Limpiar
                    </button>
                )}
            </div>

            {/* Categorías */}
            {availableCategories.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Categorías
                    </h3>
                    <div className="flex flex-col gap-1.5">
                        <button
                            type="button"
                            onClick={() => onSelectCategory("")}
                            className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition ${
                                !selectedCategory
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                            }`}
                        >
                            <span>Todas las categorías</span>
                        </button>
                        {availableCategories.map((cat) => {
                            const isSelected = selectedCategory === cat.slug;
                            return (
                                <button
                                    key={cat.slug}
                                    type="button"
                                    onClick={() => onSelectCategory(cat.slug)}
                                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition ${
                                        isSelected
                                            ? "bg-blue-50 text-blue-700"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                                    }`}
                                >
                                    <span>{cat.name}</span>
                                    <span
                                        className={`text-xs ${
                                            isSelected
                                                ? "text-blue-600 font-bold"
                                                : "text-slate-400"
                                        }`}
                                    >
                                        {cat.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Marcas */}
            {availableBrands.length > 0 && (
                <div className="border-t border-slate-100 pt-5 space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Marcas
                    </h3>
                    <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                        {availableBrands.map(({ brand, count }) => {
                            const isChecked = selectedBrands.some(
                                (b) => b.toLowerCase() === brand.toLowerCase()
                            );
                            return (
                                <label
                                    key={brand}
                                    className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1 text-sm text-slate-700 transition hover:bg-slate-50"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => onToggleBrand(brand)}
                                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="font-medium text-slate-800">
                                            {brand}
                                        </span>
                                    </div>
                                    <span className="text-xs text-slate-400">
                                        {count}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Rango de Precio */}
            <div className="border-t border-slate-100 pt-5 space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Precio ($)
                </h3>
                <form
                    key={`${minPrice ?? ""}-${maxPrice ?? ""}`}
                    onSubmit={handleApplyPrice}
                    className="space-y-2.5"
                >
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label htmlFor="min-price-input" className="sr-only">
                                Precio mínimo
                            </label>
                            <input
                                id="min-price-input"
                                name="minPrice"
                                type="number"
                                min={0}
                                placeholder={`Min ($${priceBounds.min})`}
                                defaultValue={minPrice ?? ""}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="max-price-input" className="sr-only">
                                Precio máximo
                            </label>
                            <input
                                id="max-price-input"
                                name="maxPrice"
                                type="number"
                                min={0}
                                placeholder={`Max ($${priceBounds.max})`}
                                defaultValue={maxPrice ?? ""}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-800 transition hover:bg-slate-200"
                    >
                        Aplicar precio
                    </button>
                </form>
            </div>

            {/* Calificación mínima */}
            <div className="border-t border-slate-100 pt-5 space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Calificación
                </h3>
                <div className="flex flex-col gap-1.5">
                    {[4, 3, 2].map((stars) => {
                        const isSelected = minRating === stars;
                        return (
                            <button
                                key={stars}
                                type="button"
                                onClick={() =>
                                    onRatingChange(isSelected ? undefined : stars)
                                }
                                className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 transition ${
                                    isSelected
                                        ? "bg-amber-50 ring-1 ring-amber-200"
                                        : "hover:bg-slate-50"
                                }`}
                            >
                                <div className="flex items-center gap-1.5">
                                    <StarRating
                                        rating={stars}
                                        size="sm"
                                        showValue={false}
                                    />
                                    <span className="text-xs font-semibold text-slate-700">
                                        y más
                                    </span>
                                </div>
                                {isSelected && (
                                    <FiCheck
                                        className="text-amber-600 text-xs"
                                        aria-hidden="true"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Solo en stock */}
            <div className="border-t border-slate-100 pt-5">
                <label className="flex cursor-pointer items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-slate-800">
                        Solo en stock
                    </span>
                    <input
                        type="checkbox"
                        checked={inStock}
                        onChange={(e) => onInStockChange(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                </label>
            </div>
        </aside>
    );
};
