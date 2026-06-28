import { 
    EmtyProducts,
    ProductGrid,
    ProductSearch,
    ProductSkeleton,
    ProductSort
} from "../components/products";
import { useProducts } from "../hooks/useProducts";

export const ProductCatalogPage = () => {
    const {
        filteredProducts,
        search,
        setSearch,
        sort,
        setSort,
        isLoading,
        error,
    } = useProducts()

    return (
        <section className="bg-slate-50 px-6 py-16">
            <div className="mx-auto max-w-7xl">
                <div className="mb-10">
                    <p className="text-sm font-black uppercase tracking-wide text-blue-600">
                        Catalog
                    </p>
                    <h1 className="mt-2 text-4xl font-black text-slate-950">
                        Products KalTech
                    </h1>
                    <p className="mt-3 max-w-xl text-lg text-slate-600">
                        Explore real products charged from MongoDB.
                    </p>
                </div>

                <div className="mb-8 grid gap-4 lg:grid-col-[1fr_auto]">
                    <ProductSearch value={search} onChange={setSearch} />
                    <ProductSort value={sort} onChange={setSort} />
                </div>

                {isLoading && <ProductSkeleton count={8} />}

                {!isLoading && error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8">
                        <p className="font-semibold text-red-600">{error}</p>
                    </div>
                )}

                {!isLoading && !error && filteredProducts.length === 0 && (
                    <EmtyProducts />
                )}

                {!isLoading && !error && filteredProducts.length > 0 && (
                    <ProductGrid products={filteredProducts} />
                )} 
            </div>
        </section>
    );
};
