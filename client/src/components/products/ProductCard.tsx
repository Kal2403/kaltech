import type { Product } from "../../types/product.types";
import { Link } from "react-router-dom";

interface ProductCardProps {
    product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
    const finalPrice = product.discountPrice ?? product.price;
    const hasDiscount = Boolean(product.discountPrice);

    return (
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-blue-500 hover:shadow-xl">
            <div className="aspect-square bg-slate-100 p-5">
                <img
                    src={product.images[0] ?? "https://placehold.co/600x600"}
                    alt={product.name}
                    className="h-full w-full rounded-xl object-cover"
                />
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

                    {hasDiscount && (
                        <span className="text-sm font-semibold text-slate-400 line-through">
                            ${product.price}
                        </span>
                    )}
                </div>

                <Link to={`/products/${product._id}`} className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700">
                    Ver detalles
                </Link>
            </div>
        </article>
    );
};
