import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    FiArrowRight,
    FiPackage,
    FiPercent,
    FiRefreshCw,
    FiTag,
    FiZap,
} from "react-icons/fi";

import { ProductCard } from "../components/products/ProductCard";
import { getProducts } from "../services/products/product.service";
import type { Product } from "../types/product.types";

type OfferSort = "discount-desc" | "price-asc" | "price-desc" | "rating-desc";

export const OffersPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [sortBy, setSortBy] = useState<OfferSort>("discount-desc");

    const loadOffers = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getProducts({ hasDiscount: true });
            setProducts(data);
        } catch {
            setError("No se pudieron cargar las ofertas. Por favor, intenta de nuevo.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void loadOffers();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [loadOffers]);

    // Unique categories from discounted products
    const availableCategories = useMemo(() => {
        const map = new Map<string, { name: string; slug: string }>();
        for (const p of products) {
            if (p.category && typeof p.category !== "string") {
                map.set(p.category.slug, {
                    name: p.category.name,
                    slug: p.category.slug,
                });
            }
        }
        return Array.from(map.values());
    }, [products]);

    // Filter & Sort
    const displayedProducts = useMemo(() => {
        let list = [...products];

        if (selectedCategory !== "all") {
            list = list.filter((p) => {
                if (!p.category) return false;
                const slug = typeof p.category === "string" ? p.category : p.category.slug;
                return slug === selectedCategory;
            });
        }

        list.sort((a, b) => {
            const aFinal = a.discountPrice ?? a.price;
            const bFinal = b.discountPrice ?? b.price;
            const aPercent = a.discountPrice ? (1 - a.discountPrice / a.price) : 0;
            const bPercent = b.discountPrice ? (1 - b.discountPrice / b.price) : 0;

            switch (sortBy) {
                case "discount-desc":
                    return bPercent - aPercent;
                case "price-asc":
                    return aFinal - bFinal;
                case "price-desc":
                    return bFinal - aFinal;
                case "rating-desc":
                    return (b.rating ?? 0) - (a.rating ?? 0);
                default:
                    return 0;
            }
        });

        return list;
    }, [products, selectedCategory, sortBy]);

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <div className="mx-auto max-w-7xl space-y-10">
                {/* Hero Header */}
                <header className="relative overflow-hidden rounded-[2rem] border border-blue-100 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-7 py-10 text-white sm:px-10 lg:px-14">
                    <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-600/30 blur-3xl" />
                    <div className="relative max-w-2xl">
                        <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-blue-300 border border-blue-400/30">
                            <FiZap className="text-yellow-400" />
                            <span>Precios Rebajados</span>
                        </div>
                        <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">
                            Ofertas y Descuentos Exclusivos
                        </h1>
                        <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">
                            Descubre las mejores oportunidades en smartphones, portátiles y accesorios con descuentos aplicados sobre su precio original.
                        </p>
                    </div>

                    <div className="relative mt-8 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-300">
                        <span className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5">
                            <FiTag className="text-blue-400" /> Descuentos de hasta el 40%
                        </span>
                        <span className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5">
                            <FiPercent className="text-emerald-400" /> Garantía de fábrica incluida
                        </span>
                    </div>
                </header>

                {/* Filters and Controls */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    {/* Category Filter Pills */}
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setSelectedCategory("all")}
                            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                                selectedCategory === "all"
                                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            }`}
                        >
                            Todas ({products.length})
                        </button>
                        {availableCategories.map((cat) => (
                            <button
                                key={cat.slug}
                                type="button"
                                onClick={() => setSelectedCategory(cat.slug)}
                                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                                    selectedCategory === cat.slug
                                        ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Sort Dropdown */}
                    <div className="flex items-center gap-2 shrink-0">
                        <label htmlFor="offer-sort" className="text-xs font-bold text-slate-500">
                            Ordenar por:
                        </label>
                        <select
                            id="offer-sort"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as OfferSort)}
                            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="discount-desc">Mayor descuento</option>
                            <option value="price-asc">Precio: de menor a mayor</option>
                            <option value="price-desc">Precio: de mayor a menor</option>
                            <option value="rating-desc">Mejor valorados</option>
                        </select>
                    </div>
                </div>

                {/* Products Grid */}
                {isLoading ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div
                                key={i}
                                className="h-96 animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                            >
                                <div className="h-48 w-full rounded-xl bg-slate-100" />
                                <div className="mt-4 h-4 w-1/3 rounded bg-slate-100" />
                                <div className="mt-2 h-6 w-3/4 rounded bg-slate-100" />
                                <div className="mt-4 h-5 w-1/2 rounded bg-slate-100" />
                                <div className="mt-6 h-10 w-full rounded-xl bg-slate-100" />
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                        <p className="text-sm font-medium text-red-700">{error}</p>
                        <button
                            type="button"
                            onClick={() => void loadOffers()}
                            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
                        >
                            <FiRefreshCw /> Reintentar
                        </button>
                    </div>
                ) : displayedProducts.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                        <FiPackage className="mx-auto text-4xl text-slate-400" />
                        <h2 className="mt-4 text-lg font-bold text-slate-900">
                            No se encontraron ofertas con los filtros seleccionados
                        </h2>
                        <p className="mt-2 text-sm text-slate-500">
                            Prueba seleccionando otra categoría o revisa el catálogo general.
                        </p>
                        <div className="mt-6 flex justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => setSelectedCategory("all")}
                                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                            >
                                Mostrar todas las ofertas
                            </button>
                            <Link
                                to="/products"
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
                            >
                                Ir al catálogo <FiArrowRight />
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {displayedProducts.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
};
