import { useState } from "react";
import { FiGrid, FiSearch, FiSliders, FiFilter } from "react-icons/fi";
import {
    EmtyProducts,
    ProductGrid,
    ProductSearch,
    ProductSkeleton,
    ProductSort,
    ProductFilters,
} from "../components/products";
import { useProducts } from "../hooks/useProducts";

const assurances = [
    { title: "Catálogo real", detail: "Datos desde la API", icon: FiGrid },
    { title: "Búsqueda", detail: "Resultados al instante", icon: FiSearch },
    { title: "Orden flexible", detail: "Compara el catálogo", icon: FiSliders },
];

export const ProductCatalogPage = () => {
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    const {
        filteredProducts,
        search,
        setSearch,
        selectedCategory,
        setSelectedCategory,
        selectedBrands,
        toggleBrand,
        minPrice,
        maxPrice,
        setPriceRange,
        minRating,
        setMinRating,
        inStock,
        setInStock,
        sort,
        setSort,
        clearFilters,
        hasActiveFilters,
        activeFilterCount,
        availableBrands,
        availableCategories,
        priceBounds,
        isLoading,
        error,
    } = useProducts();

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <div className="mx-auto max-w-7xl">
                {/* Header Hero */}
                <header className="relative overflow-hidden rounded-[2rem] border border-blue-100 bg-white px-7 py-10 sm:px-10 lg:px-14">
                    <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-100/70 blur-2xl" />
                    <div className="relative max-w-2xl">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                            Catálogo KalTech
                        </p>
                        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                            Tecnología para cada objetivo
                        </h1>
                        <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
                            Explora productos reales cargados desde nuestro
                            catálogo y encuentra el equipo ideal para ti.
                        </p>
                    </div>
                    <div className="relative mt-9 grid gap-3 sm:grid-cols-3">
                        {assurances.map(({ title, detail, icon: Icon }) => (
                            <div
                                key={title}
                                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-4"
                            >
                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-lg text-blue-600">
                                    <Icon aria-hidden="true" />
                                </span>
                                <div>
                                    <p className="text-sm font-extrabold text-slate-950">
                                        {title}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {detail}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </header>

                {/* Catalog Grid with Filters */}
                <div className="mt-8 grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)]">
                    {/* Desktop Sidebar Filters */}
                    <div className="hidden lg:block lg:sticky lg:top-24 h-fit">
                        <ProductFilters
                            availableCategories={availableCategories}
                            selectedCategory={selectedCategory}
                            onSelectCategory={setSelectedCategory}
                            availableBrands={availableBrands}
                            selectedBrands={selectedBrands}
                            onToggleBrand={toggleBrand}
                            priceBounds={priceBounds}
                            minPrice={minPrice}
                            maxPrice={maxPrice}
                            onPriceChange={setPriceRange}
                            minRating={minRating}
                            onRatingChange={setMinRating}
                            inStock={inStock}
                            onInStockChange={setInStock}
                            onClearFilters={clearFilters}
                            hasActiveFilters={hasActiveFilters}
                            activeFilterCount={activeFilterCount}
                        />
                    </div>

                    {/* Main Products Content */}
                    <section aria-labelledby="products-heading">
                        <h2 id="products-heading" className="sr-only">
                            Productos
                        </h2>

                        {/* Search, Sort and Mobile Filter Button */}
                        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="flex-1">
                                <ProductSearch
                                    value={search}
                                    onChange={setSearch}
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsMobileFiltersOpen(true)}
                                    className="flex min-h-12 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 lg:hidden"
                                >
                                    <FiFilter
                                        className="text-blue-600"
                                        aria-hidden="true"
                                    />
                                    <span>Filtros</span>
                                    {activeFilterCount > 0 && (
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                                            {activeFilterCount}
                                        </span>
                                    )}
                                </button>

                                <ProductSort value={sort} onChange={setSort} />
                            </div>
                        </div>

                        {/* Results Count & Active Filters Indicator */}
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
                            <p>
                                Mostrando{" "}
                                <span className="font-bold text-slate-900">
                                    {filteredProducts.length}
                                </span>{" "}
                                {filteredProducts.length === 1
                                    ? "producto"
                                    : "productos"}
                            </p>

                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="text-xs font-bold text-blue-600 transition hover:text-blue-800"
                                >
                                    Restablecer todos los filtros
                                </button>
                            )}
                        </div>

                        {isLoading && <ProductSkeleton count={6} />}

                        {!isLoading && error && (
                            <div
                                role="alert"
                                className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8"
                            >
                                <p className="font-semibold text-red-700">
                                    {error}
                                </p>
                            </div>
                        )}

                        {!isLoading && !error && filteredProducts.length === 0 && (
                            <EmtyProducts />
                        )}

                        {!isLoading &&
                            !error &&
                            filteredProducts.length > 0 && (
                                <ProductGrid products={filteredProducts} />
                            )}
                    </section>
                </div>

                {/* Mobile Filters Drawer Modal */}
                {isMobileFiltersOpen && (
                    <div
                        className="fixed inset-0 z-50 flex lg:hidden"
                        role="dialog"
                        aria-modal="true"
                    >
                        <div
                            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
                            onClick={() => setIsMobileFiltersOpen(false)}
                            aria-hidden="true"
                        />
                        <div className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white p-5 shadow-2xl">
                            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
                                <h3 className="text-lg font-black text-slate-950">
                                    Filtros
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setIsMobileFiltersOpen(false)}
                                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                    aria-label="Cerrar filtros"
                                >
                                    ✕
                                </button>
                            </div>
                            <ProductFilters
                                availableCategories={availableCategories}
                                selectedCategory={selectedCategory}
                                onSelectCategory={setSelectedCategory}
                                availableBrands={availableBrands}
                                selectedBrands={selectedBrands}
                                onToggleBrand={toggleBrand}
                                priceBounds={priceBounds}
                                minPrice={minPrice}
                                maxPrice={maxPrice}
                                onPriceChange={setPriceRange}
                                minRating={minRating}
                                onRatingChange={setMinRating}
                                inStock={inStock}
                                onInStockChange={setInStock}
                                onClearFilters={clearFilters}
                                hasActiveFilters={hasActiveFilters}
                                activeFilterCount={activeFilterCount}
                                className="border-0 p-0 shadow-none"
                            />
                            <div className="mt-6 border-t border-slate-100 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsMobileFiltersOpen(false)}
                                    className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                                >
                                    Ver {filteredProducts.length} productos
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
};
