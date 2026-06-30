import { Link, useParams } from "react-router-dom";

import { useProductDetails } from "../hooks/useProductDetails";

export const ProductDetailsPage = () => {
    const { id } = useParams();
    const { product, isLoading, error } = useProductDetails(id);

    if (isLoading) {
        return (
            <section className="bg-slate-50 px-6 py-16">
                <div className="mx-auto max-w-7xl">
                    <p className="text-lg font-semibold text-slate-700">
                        Cargando producto...
                    </p>
                </div>
            </section>
        );
    }

    if (error || !product) {
        return (
            <section className="bg-slate-50 px-6 py-16">
                <div className="mx-auto max-w-7xl">
                    <p className="font-semibold text-red-600">{error}</p>
                    <Link to="/products" className="mt-4 inline-block font-bold text-blue-600 underline">
                        Volver al catalogo
                    </Link>
                </div>
            </section>
        );
    }

    const finalPrice = product.discountPrice ?? product.price;

    return (
        <section className="bg-slate-50 px-6 py-16">
            <div className="mx-auto max-w-7xl">
                <Link
                    to="/products"
                    className="mb-8 inline-block font-bold text-blue-600 hover:underline"
                >
                    ← Volver al catálogo
                </Link>

                <div className="grid gap-10 rounded-3xl bg-white p-6 shadow-sm lg:grid-cols-2 lg:p-10">
                    <div className="rounded-2xl bg-slate-100 p-6">
                        <img
                            src={product.images[0] ?? "https://placehold.co/800x800"}
                            alt={product.name}
                            className="h-full max-h-130 w-full rounded-xl object-cover"
                        />
                    </div>

                    <div>
                        <p className="text-sm font-black uppercase tracking-wide text-blue-600">
                            {product.category?.name}
                        </p>

                        <h1 className="mt-3 text-4xl font-black text-slate-950">
                            {product.name}
                        </h1>

                        {product.brand && (
                            <p className="mt-2 text-slate-500">Marca: {product.brand}</p>
                        )}

                        <p className="mt-6 text-lg leading-relaxed text-slate-700">
                            {product.description}
                        </p>

                        <div className="mt-6 flex items-center gap-4">
                            <span className="text-4xl font-black text-slate-950">
                                ${finalPrice}
                            </span>

                            {product.discountPrice && (
                                <span className="text-lg font-semibold text-slate-400 line-through">
                                    ${product.price}
                                </span>
                            )}
                        </div>

                        <p
                            className={`mt-4 font-bold ${product.stock > 0 ? "text-emerald-600" : "text-red-600"
                                }`}
                        >
                            {product.stock > 0
                                ? `Disponible: ${product.stock} unidades`
                                : "Sin stock"}
                        </p>

                        {product.specs && Object.keys(product.specs).length > 0 && (
                            <div className="mt-8">
                                <h2 className="text-xl font-black text-slate-950">
                                    Especificaciones
                                </h2>

                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    {Object.entries(product.specs).map(([key, value]) => (
                                        <div
                                            key={key}
                                            className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                                        >
                                            <p className="text-xs font-black uppercase text-slate-500">
                                                {key}
                                            </p>
                                            <p className="mt-1 font-bold text-slate-950">{value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            disabled={product.stock <= 0}
                            className="mt-8 w-full rounded-xl bg-blue-600 px-6 py-4 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                            Agregar al carrito
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};
