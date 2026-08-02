import { Link } from "react-router-dom";
import { FiArrowRight, FiPackage } from "react-icons/fi";
import type { Product } from "../../types/product.types";

interface ProductCardProps { product: Product; }

const fallbackImage = "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80";

export const ProductCard = ({ product }: ProductCardProps) => {
    const finalPrice = product.discountPrice ?? product.price;
    const hasDiscount = product.discountPrice !== undefined && product.discountPrice < product.price;
    const discount = hasDiscount ? Math.round((1 - finalPrice / product.price) * 100) : 0;

    return (
        <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/60">
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-50 p-5">
                {hasDiscount && <span className="absolute left-4 top-4 z-10 rounded-md bg-blue-600 px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-wide text-white">-{discount}%</span>}
                <img src={product.images[0] ?? fallbackImage} alt={product.name} className="h-full w-full object-contain transition duration-500 group-hover:scale-105" loading="lazy" />
            </div>
            <div className="flex flex-1 flex-col p-5">
                <p className="text-xs font-black uppercase tracking-wider text-blue-600">{product.category?.name ?? "Tecnología"}</p>
                <h2 className="mt-2 line-clamp-2 text-lg font-black leading-snug text-slate-950">{product.name}</h2>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{product.description}</p>
                <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-950">${finalPrice}</span>
                    {hasDiscount && <span className="text-sm font-semibold text-slate-400 line-through">${product.price}</span>}
                </div>
                <p className={`mt-2 flex items-center gap-1.5 text-xs font-bold ${product.stock > 0 ? "text-emerald-600" : "text-red-600"}`}><FiPackage aria-hidden="true" />{product.stock > 0 ? `${product.stock} disponibles` : "Sin stock"}</p>
                <Link to={`/products/${product._id}`} className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Ver detalles <FiArrowRight aria-hidden="true" /></Link>
            </div>
        </article>
    );
};
