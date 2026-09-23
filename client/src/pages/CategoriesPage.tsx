import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    FiArrowRight,
    FiCpu,
    FiGrid,
    FiHeadphones,
    FiMonitor,
    FiPackage,
    FiRefreshCw,
    FiSmartphone,
    FiTablet,
} from "react-icons/fi";
import type { IconType } from "react-icons";

import { getCategories } from "../services/category/category.service";
import type { Category } from "../types/category.types";

const getCategoryIcon = (slug: string): IconType => {
    switch (slug.toLowerCase()) {
        case "smartphones":
        case "celulares":
            return FiSmartphone;
        case "laptops":
        case "computadores":
            return FiMonitor;
        case "tablets":
            return FiTablet;
        case "mobile-accessories":
        case "accesorios":
            return FiHeadphones;
        default:
            return FiCpu;
    }
};

const getCategoryColor = (slug: string): { bg: string; text: string; border: string } => {
    switch (slug.toLowerCase()) {
        case "smartphones":
            return { bg: "bg-blue-500/10", text: "text-blue-600", border: "border-blue-200" };
        case "laptops":
            return { bg: "bg-indigo-500/10", text: "text-indigo-600", border: "border-indigo-200" };
        case "tablets":
            return { bg: "bg-cyan-500/10", text: "text-cyan-600", border: "border-cyan-200" };
        case "mobile-accessories":
            return { bg: "bg-purple-500/10", text: "text-purple-600", border: "border-purple-200" };
        default:
            return { bg: "bg-slate-500/10", text: "text-slate-600", border: "border-slate-200" };
    }
};

export const CategoriesPage = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadCategories = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getCategories();
            setCategories(data);
        } catch {
            setError("No se pudieron cargar las categorías. Por favor, intenta de nuevo.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void loadCategories();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [loadCategories]);

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <div className="mx-auto max-w-7xl space-y-10">
                {/* Hero Header */}
                <header className="relative overflow-hidden rounded-[2rem] border border-blue-100 bg-white px-7 py-10 sm:px-10 lg:px-14">
                    <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-100/70 blur-2xl" />
                    <div className="relative max-w-2xl">
                        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-blue-600">
                            <FiGrid className="text-sm" />
                            <span>Catálogo Organizado</span>
                        </div>
                        <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                            Explora por Categoría
                        </h1>
                        <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
                            Descubre nuestra selección de tecnología de última generación agrupada en departamentos especializados para tu trabajo, entretenimiento y productividad.
                        </p>
                    </div>
                </header>

                {/* Content */}
                {isLoading ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                            >
                                <div className="h-12 w-12 rounded-xl bg-slate-100" />
                                <div className="mt-5 h-6 w-3/4 rounded bg-slate-100" />
                                <div className="mt-3 h-4 w-full rounded bg-slate-100" />
                                <div className="mt-2 h-4 w-2/3 rounded bg-slate-100" />
                                <div className="mt-6 h-10 w-full rounded-xl bg-slate-100" />
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                        <p className="text-sm font-medium text-red-700">{error}</p>
                        <button
                            type="button"
                            onClick={() => void loadCategories()}
                            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
                        >
                            <FiRefreshCw /> Reintentar
                        </button>
                    </div>
                ) : categories.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                        <FiPackage className="mx-auto text-4xl text-slate-400" />
                        <h2 className="mt-4 text-lg font-bold text-slate-900">No hay categorías disponibles</h2>
                        <p className="mt-2 text-sm text-slate-500">Pronto agregaremos nuevas líneas de productos a la tienda.</p>
                        <Link
                            to="/products"
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
                        >
                            Ver todos los productos <FiArrowRight />
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {categories.map((cat) => {
                            const Icon = getCategoryIcon(cat.slug);
                            const colors = getCategoryColor(cat.slug);
                            const count = cat.productCount ?? 0;

                            return (
                                <article
                                    key={cat._id}
                                    className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:shadow-slate-200/60"
                                >
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <span
                                                className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${colors.border} ${colors.bg} text-2xl ${colors.text} shadow-sm transition duration-300 group-hover:scale-105`}
                                            >
                                                <Icon aria-hidden="true" />
                                            </span>
                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                                                {count} {count === 1 ? "producto" : "productos"}
                                            </span>
                                        </div>

                                        <h2 className="mt-5 text-xl font-black tracking-tight text-slate-950">
                                            {cat.name}
                                        </h2>

                                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                                            {cat.description || "Explora los mejores dispositivos y equipos de esta categoría."}
                                        </p>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-slate-100">
                                        <Link
                                            to={`/products?category=${encodeURIComponent(cat.slug)}`}
                                            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition group-hover:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                        >
                                            <span>Ver productos</span>
                                            <FiArrowRight className="transition duration-300 group-hover:translate-x-1" aria-hidden="true" />
                                        </Link>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
};
