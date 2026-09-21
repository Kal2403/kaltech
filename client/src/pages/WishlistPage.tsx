import { useState } from "react";
import { Link } from "react-router-dom";
import {
    FiHeart,
    FiTrash2,
    FiShoppingCart,
    FiArrowRight,
    FiPackage,
    FiRotateCcw,
} from "react-icons/fi";
import { useWishlist } from "../hooks/useWishlist";
import { useCart } from "../hooks/useCart";
import { StarRating } from "../components/common/StarRating";
import { ROUTES } from "../routes/paths";

const fallbackImage =
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80";

export const WishlistPage = () => {
    const { items, count, removeItem, clearAll, isLoading } = useWishlist();
    const { addItem: addToCart } = useCart();
    const [movingId, setMovingId] = useState<string | null>(null);

    const handleMoveToCart = async (productId: string) => {
        try {
            setMovingId(productId);
            await addToCart(productId, 1);
            await removeItem(productId);
        } finally {
            setMovingId(null);
        }
    };

    if (isLoading) {
        return (
            <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="flex h-64 items-center justify-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-red-600" />
                </div>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
            {/* Header */}
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                            <FiHeart className="text-xl fill-red-600" aria-hidden="true" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-950 sm:text-4xl">
                            Mis Favoritos
                        </h1>
                        {count > 0 && (
                            <span className="flex h-7 items-center justify-center rounded-full bg-red-100 px-3 text-xs font-black text-red-700">
                                {count} {count === 1 ? "producto" : "productos"}
                            </span>
                        )}
                    </div>
                    <p className="mt-2 text-sm text-slate-500 sm:text-base">
                        Guarda los productos tecnológicos que te interesan y muévelos al carrito cuando estés listo.
                    </p>
                </div>

                {count > 0 && (
                    <button
                        type="button"
                        onClick={clearAll}
                        className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:self-auto"
                    >
                        <FiRotateCcw className="text-sm" aria-hidden="true" />
                        Vaciar favoritos
                    </button>
                )}
            </div>

            {/* Empty State */}
            {items.length === 0 ? (
                <div className="my-16 flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-20 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-red-100 text-3xl text-red-600 shadow-inner">
                        <FiHeart aria-hidden="true" />
                    </div>
                    <h2 className="mt-6 text-2xl font-black text-slate-950">
                        Tu lista de favoritos está vacía
                    </h2>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
                        Aún no has guardado ningún producto. Explora nuestro catálogo tecnológico y haz clic en el icono del corazón para guardar lo que más te guste.
                    </p>
                    <Link
                        to={ROUTES.products}
                        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                        Explorar catálogo
                        <FiArrowRight aria-hidden="true" />
                    </Link>
                </div>
            ) : (
                /* Products Grid */
                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {items.map((product) => {
                        const finalPrice = product.discountPrice ?? product.price;
                        const hasDiscount =
                            product.discountPrice !== undefined &&
                            product.discountPrice < product.price;
                        const discount = hasDiscount
                            ? Math.round((1 - finalPrice / product.price) * 100)
                            : 0;
                        const isMoving = movingId === product._id;

                        return (
                            <article
                                key={product._id}
                                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-red-200 hover:shadow-xl hover:shadow-slate-200/60"
                            >
                                {/* Image Container */}
                                <div className="relative aspect-[4/3] overflow-hidden bg-slate-50 p-5">
                                    {hasDiscount && (
                                        <span className="absolute left-4 top-4 z-10 rounded-md bg-blue-600 px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-wide text-white">
                                            -{discount}%
                                        </span>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => removeItem(product._id)}
                                        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-400 shadow-sm transition hover:bg-red-50 hover:text-red-600"
                                        aria-label={`Eliminar ${product.name} de favoritos`}
                                    >
                                        <FiTrash2 className="text-sm" aria-hidden="true" />
                                    </button>

                                    <img
                                        src={product.images[0] ?? fallbackImage}
                                        alt={product.name}
                                        className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                </div>

                                {/* Content */}
                                <div className="flex flex-1 flex-col p-5">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="truncate text-xs font-black uppercase tracking-wider text-blue-600">
                                            {product.category?.name ?? "Tecnología"}
                                        </p>
                                        {product.rating !== undefined && product.rating > 0 && (
                                            <StarRating
                                                rating={product.rating}
                                                size="sm"
                                                showValue={true}
                                            />
                                        )}
                                    </div>

                                    {product.brand && (
                                        <p className="mt-0.5 text-xs font-medium text-slate-500">
                                            {product.brand}
                                        </p>
                                    )}

                                    <Link
                                        to={`/products/${product._id}`}
                                        className="mt-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                    >
                                        <h2 className="line-clamp-2 text-base font-black leading-snug text-slate-950 transition group-hover:text-blue-600">
                                            {product.name}
                                        </h2>
                                    </Link>

                                    <div className="mt-3 flex items-baseline gap-2">
                                        <span className="text-xl font-black text-slate-950">
                                            ${finalPrice}
                                        </span>
                                        {hasDiscount && (
                                            <span className="text-xs font-semibold text-slate-400 line-through">
                                                ${product.price}
                                            </span>
                                        )}
                                    </div>

                                    <p
                                        className={`mt-2 flex items-center gap-1.5 text-xs font-bold ${
                                            product.stock > 0
                                                ? "text-emerald-600"
                                                : "text-red-600"
                                        }`}
                                    >
                                        <FiPackage aria-hidden="true" />
                                        {product.stock > 0
                                            ? `${product.stock} disponibles`
                                            : "Sin stock"}
                                    </p>

                                    {/* Action Buttons */}
                                    <div className="mt-5 flex flex-col gap-2">
                                        <button
                                            type="button"
                                            disabled={product.stock <= 0 || isMoving}
                                            onClick={() => handleMoveToCart(product._id)}
                                            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                                        >
                                            <FiShoppingCart aria-hidden="true" />
                                            {isMoving
                                                ? "Moviendo..."
                                                : product.stock <= 0
                                                ? "Sin stock"
                                                : "Mover al carrito"}
                                        </button>
                                        <Link
                                            to={`/products/${product._id}`}
                                            className="inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                                        >
                                            Ver detalles
                                            <FiArrowRight aria-hidden="true" />
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </main>
    );
};
