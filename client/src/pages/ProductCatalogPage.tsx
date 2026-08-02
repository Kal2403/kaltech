import { FiGrid, FiSearch, FiSliders } from "react-icons/fi";
import { EmtyProducts, ProductGrid, ProductSearch, ProductSkeleton, ProductSort } from "../components/products";
import { useProducts } from "../hooks/useProducts";

const assurances = [
    { title: "Catálogo real", detail: "Datos desde la API", icon: FiGrid },
    { title: "Búsqueda", detail: "Resultados al instante", icon: FiSearch },
    { title: "Orden flexible", detail: "Compara el catálogo", icon: FiSliders },
];

export const ProductCatalogPage = () => {
    const { filteredProducts, search, setSearch, sort, setSort, isLoading, error } = useProducts();

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <div className="mx-auto max-w-7xl">
                <header className="relative overflow-hidden rounded-[2rem] border border-blue-100 bg-white px-7 py-10 sm:px-10 lg:px-14">
                    <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-100/70 blur-2xl" />
                    <div className="relative max-w-2xl">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Catálogo KalTech</p>
                        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">Tecnología para cada objetivo</h1>
                        <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">Explora productos reales cargados desde nuestro catálogo y encuentra el equipo ideal para ti.</p>
                    </div>
                    <div className="relative mt-9 grid gap-3 sm:grid-cols-3">
                        {assurances.map(({ title, detail, icon: Icon }) => (
                            <div key={title} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-lg text-blue-600"><Icon aria-hidden="true" /></span>
                                <div><p className="text-sm font-extrabold text-slate-950">{title}</p><p className="text-xs text-slate-500">{detail}</p></div>
                            </div>
                        ))}
                    </div>
                </header>

                <div className="mt-8 grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
                    <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-24">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Tu búsqueda</p>
                        <h2 className="mt-2 text-xl font-black text-slate-950">Encuentra tu equipo</h2>
                        <p className="mt-3 text-sm leading-6 text-slate-600">Usa la búsqueda y el orden para comparar rápidamente los productos disponibles.</p>
                        <div className="mt-5 border-t border-slate-100 pt-5">
                            <p className="text-sm font-bold text-slate-950">Resultados</p>
                            <p className="mt-1 text-3xl font-black text-blue-600">{isLoading ? "—" : filteredProducts.length}</p>
                            <p className="text-xs text-slate-500">productos encontrados</p>
                        </div>
                    </aside>

                    <section aria-labelledby="products-heading">
                        <h2 id="products-heading" className="sr-only">Productos</h2>
                        <div className="mb-6 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                            <ProductSearch value={search} onChange={setSearch} />
                            <ProductSort value={sort} onChange={setSort} />
                        </div>
                        {isLoading && <ProductSkeleton count={6} />}
                        {!isLoading && error && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8"><p className="font-semibold text-red-700">{error}</p></div>}
                        {!isLoading && !error && filteredProducts.length === 0 && <EmtyProducts />}
                        {!isLoading && !error && filteredProducts.length > 0 && <ProductGrid products={filteredProducts} />}
                    </section>
                </div>
            </div>
        </main>
    );
};
