import { useEffect, useState } from "react";

import { getProducts } from "../services/products/product.service";
import type { Product } from "../types/product.types";

export const ProductCatalogPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const productsData = await getProducts();
                setProducts(productsData);
            } catch {
                setError("No se pudieron cargar los productos.");
            } finally {
                setIsLoading(false);
            }
        }

        loadProducts();
    }, []);

    if (isLoading) {
        return (
            <section className="mx-auto max-w-7xl px-6 py-16">
                <p className="text-lg font-semibold text-slate-700">
                    Cargando Productos...
                </p>
            </section>
        )
    }

    if (error) {
        return (
            <section className="mx-auto max-w-7xl px-6 py-16">
                <p className="text-lg font-semibold text-red-600">{error}</p>
            </section>
        )
    }

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

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {products.map((product) => {
                        const finalPrice = product.discountPrice ?? product.price;

                        return (
                            <article key={product._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                                <div className="aspect-square bg-slate-100 p-5">
                                    <img src={product.images[0] ?? "https://placehold.co/600x600"} alt={product.name} className="h-full w-full rounded-xl object-cover" />
                                </div>

                                <div className="p-5">
                                    <p className="text-sm font-bold text-blue-600">
                                        {product.category?.name}
                                    </p>

                                    <h2 className="mt-2 text-lg font-black text-slate-950">
                                        {product.name}
                                    </h2>

                                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                                        {product.description}
                                    </p>

                                    <div className="mt-4 flex items-center gap-3">
                                        <span className="text-xl font-black text-slate-950">
                                            ${finalPrice}
                                        </span>
                                        {product.discountPrice && (
                                            <span className="text-sm font-semibold text-slate-400 line-through">
                                                ${product.price}
                                            </span>
                                        )}
                                    </div>

                                    <button className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700">
                                        Ver Detalles
                                    </button>
                                </div>

                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
