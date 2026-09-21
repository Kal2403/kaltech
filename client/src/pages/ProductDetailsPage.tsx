import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiCheck, FiShoppingCart } from "react-icons/fi";
import { StarRating } from "../components/common/StarRating";
import { WishlistButton } from "../components/wishlist";
import { useCart } from "../hooks/useCart";
import { useProductDetails } from "../hooks/useProductDetails";

const fallbackImage =
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=85";

const specLabels: Record<string, string> = {
    dummyId: "ID de Fabricante",
    garantia: "Garantía",
    envio: "Envío",
    disponibilidad: "Disponibilidad",
    devolucion: "Política de Devolución",
    peso: "Peso",
};

export const ProductDetailsPage = () => {
    const { id } = useParams();
    const { product, isLoading, error } = useProductDetails(id);
    const { addItem, isMutating, error: cartError } = useCart();
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    if (isLoading) {
        return (
            <main
                className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6"
                aria-busy="true"
            >
                <div className="mx-auto grid max-w-7xl animate-pulse gap-8 rounded-[2rem] border border-slate-200 bg-white p-6 lg:grid-cols-2 lg:p-10">
                    <div className="aspect-square rounded-2xl bg-slate-200" />
                    <div className="space-y-5 py-4">
                        <div className="h-4 w-24 rounded bg-slate-200" />
                        <div className="h-12 w-3/4 rounded bg-slate-200" />
                        <div className="h-20 rounded bg-slate-200" />
                        <div className="h-14 w-40 rounded bg-slate-200" />
                        <div className="h-14 rounded bg-slate-200" />
                    </div>
                </div>
            </main>
        );
    }

    if (error || !product) {
        return (
            <main className="min-h-screen bg-slate-50 px-4 py-16 sm:px-6">
                <div
                    role="alert"
                    className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm"
                >
                    <h1 className="text-2xl font-black text-slate-950">
                        No pudimos mostrar este producto
                    </h1>
                    <p className="mt-3 font-medium text-red-700">
                        {error ?? "El producto no está disponible."}
                    </p>
                    <Link
                        to="/products"
                        className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                        <FiArrowLeft aria-hidden="true" /> Volver al catálogo
                    </Link>
                </div>
            </main>
        );
    }

    const finalPrice = product.discountPrice ?? product.price;
    const hasDiscount =
        product.discountPrice !== undefined &&
        product.discountPrice < product.price;
    const activeImage =
        product.images[selectedImageIndex] ??
        product.images[0] ??
        fallbackImage;

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
            <div className="mx-auto max-w-7xl">
                <Link
                    to="/products"
                    className="mb-6 inline-flex items-center gap-2 rounded-lg font-bold text-blue-600 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
                >
                    <FiArrowLeft aria-hidden="true" /> Volver al catálogo
                </Link>

                {/* Main Product Card */}
                <div className="grid gap-8 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.45)] sm:p-8 lg:grid-cols-2 lg:gap-12 lg:p-10">
                    {/* Left: Gallery */}
                    <div className="flex flex-col">
                        <div className="flex min-h-80 items-center justify-center rounded-2xl bg-slate-50 p-6 sm:min-h-[32rem]">
                            <img
                                src={activeImage}
                                alt={product.name}
                                className="max-h-[30rem] h-full w-full object-contain transition-all duration-300"
                            />
                        </div>

                        {product.images.length > 1 && (
                            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                                {product.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setSelectedImageIndex(idx)}
                                        className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                                            selectedImageIndex === idx
                                                ? "border-blue-600 shadow-md ring-2 ring-blue-600/20"
                                                : "border-slate-200 hover:border-slate-300 bg-slate-50"
                                        }`}
                                        aria-label={`Ver imagen ${idx + 1} de ${product.name}`}
                                    >
                                        <img
                                            src={img}
                                            alt=""
                                            className="h-full w-full object-contain"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Info & Actions */}
                    <div className="flex flex-col py-2">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                            {product.category?.name ?? "Sin categoría"}
                        </p>

                        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                            {product.name}
                        </h1>

                        <div className="mt-3 flex flex-wrap items-center gap-3">
                            {product.rating !== undefined && product.rating > 0 && (
                                <StarRating
                                    rating={product.rating}
                                    size="md"
                                    showValue={true}
                                    reviewsCount={
                                        product.reviewsCount ??
                                        product.reviews?.length
                                    }
                                />
                            )}
                            {product.brand && (
                                <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                                    {product.brand}
                                </span>
                            )}
                        </div>

                        <p className="mt-6 text-base leading-7 text-slate-600 sm:text-lg">
                            {product.description}
                        </p>

                        <div className="mt-7 flex flex-wrap items-baseline gap-3">
                            <span className="text-4xl font-black text-slate-950">
                                ${finalPrice}
                            </span>
                            {hasDiscount && (
                                <span className="text-lg font-bold text-slate-400 line-through">
                                    ${product.price}
                                </span>
                            )}
                        </div>

                        <p
                            className={`mt-4 flex items-center gap-2 font-bold ${
                                product.stock > 0
                                    ? "text-emerald-600"
                                    : "text-red-600"
                            }`}
                        >
                            <span
                                className={`flex h-5 w-5 items-center justify-center rounded-full text-xs text-white ${
                                    product.stock > 0
                                        ? "bg-emerald-500"
                                        : "bg-red-500"
                                }`}
                            >
                                {product.stock > 0 ? (
                                    <FiCheck aria-hidden="true" />
                                ) : (
                                    "!"
                                )}
                            </span>
                            {product.stock > 0
                                ? `Disponible: ${product.stock} unidades`
                                : "Sin stock"}
                        </p>

                        {product.specs && Object.keys(product.specs).length > 0 && (
                            <section className="mt-8" aria-labelledby="specs-title">
                                <h2
                                    id="specs-title"
                                    className="text-xl font-black text-slate-950"
                                >
                                    Especificaciones Técnicas
                                </h2>
                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    {Object.entries(product.specs).map(
                                        ([key, value]) => (
                                            <div
                                                key={key}
                                                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                                            >
                                                <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                                                    {specLabels[key] ?? key}
                                                </p>
                                                <p className="mt-1 font-extrabold text-slate-950">
                                                    {value}
                                                </p>
                                            </div>
                                        )
                                    )}
                                </div>
                            </section>
                        )}

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                            <button
                                disabled={product.stock <= 0 || isMutating}
                                onClick={() => addItem(product._id, 1)}
                                className="inline-flex min-h-14 flex-1 items-center justify-center gap-3 rounded-xl bg-blue-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                            >
                                <FiShoppingCart
                                    className="text-xl"
                                    aria-hidden="true"
                                />
                                {isMutating
                                    ? "Agregando..."
                                    : product.stock <= 0
                                    ? "Producto agotado"
                                    : "Agregar al carrito"}
                            </button>
                            <WishlistButton
                                product={product}
                                variant="button"
                                className="px-6"
                            />
                        </div>
                        {cartError && (
                            <p
                                role="alert"
                                className="mt-3 text-sm font-semibold text-red-700"
                            >
                                {cartError}
                            </p>
                        )}
                    </div>
                </div>

                {/* Reviews Section */}
                <section
                    className="mt-12 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-10"
                    aria-labelledby="reviews-title"
                >
                    <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2
                                id="reviews-title"
                                className="text-2xl font-black text-slate-950"
                            >
                                Opiniones de Clientes
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Comentarios y valoraciones verificadas de compradores.
                            </p>
                        </div>
                        {product.rating !== undefined && product.rating > 0 && (
                            <div className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                                <span className="text-3xl font-black text-amber-700">
                                    {product.rating.toFixed(1)}
                                </span>
                                <div>
                                    <StarRating
                                        rating={product.rating}
                                        size="sm"
                                        showValue={false}
                                    />
                                    <p className="text-xs font-semibold text-amber-800">
                                        {product.reviewsCount ??
                                            product.reviews?.length ??
                                            0}{" "}
                                        valoraciones
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {product.reviews && product.reviews.length > 0 ? (
                        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {product.reviews.map((review, idx) => (
                                <article
                                    key={idx}
                                    className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/50 p-6 shadow-sm transition hover:bg-white hover:shadow-md"
                                >
                                    <div>
                                        <div className="flex items-center justify-between gap-2">
                                            <StarRating
                                                rating={review.rating}
                                                size="sm"
                                                showValue={false}
                                            />
                                            <time
                                                dateTime={review.date}
                                                className="text-xs text-slate-400"
                                            >
                                                {new Date(
                                                    review.date
                                                ).toLocaleDateString("es-ES", {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </time>
                                        </div>
                                        <p className="mt-4 text-sm leading-relaxed text-slate-700">
                                            &ldquo;{review.comment}&rdquo;
                                        </p>
                                    </div>
                                    <div className="mt-6 flex items-center gap-3 border-t border-slate-200/60 pt-4">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                                            {review.reviewerName
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">
                                                {review.reviewerName}
                                            </p>
                                            <p className="text-xs font-semibold text-emerald-600">
                                                Comprador verificado
                                            </p>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-8 rounded-xl border border-dashed border-slate-200 p-8 text-center">
                            <p className="text-sm font-medium text-slate-500">
                                Aún no hay opiniones para este producto. ¡Sé el
                                primero en valorarlo!
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
};
