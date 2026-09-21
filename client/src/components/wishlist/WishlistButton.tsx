import { type MouseEvent } from "react";
import { FiHeart } from "react-icons/fi";
import { useWishlist } from "../../hooks/useWishlist";
import type { Product } from "../../types/product.types";

interface WishlistButtonProps {
    product: Product;
    variant?: "floating" | "button";
    className?: string;
}

export const WishlistButton = ({
    product,
    variant = "floating",
    className = "",
}: WishlistButtonProps) => {
    const { isInWishlist, toggleWishlist, isMutating } = useWishlist();
    const active = isInWishlist(product._id);

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        void toggleWishlist(product);
    };

    if (variant === "button") {
        return (
            <button
                type="button"
                onClick={handleClick}
                disabled={isMutating}
                className={`inline-flex min-h-14 items-center justify-center gap-2 rounded-xl border font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 disabled:cursor-not-allowed disabled:opacity-60 ${
                    active
                        ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                        : "border-slate-200 bg-white text-slate-800 hover:border-red-200 hover:bg-red-50/50 hover:text-red-600"
                } ${className}`}
                aria-label={
                    active
                        ? `Eliminar ${product.name} de favoritos`
                        : `Guardar ${product.name} en favoritos`
                }
            >
                <FiHeart
                    className={`text-xl transition-transform active:scale-125 ${
                        active ? "fill-red-600 text-red-600" : "text-current"
                    }`}
                    aria-hidden="true"
                />
                <span>
                    {active ? "En tus favoritos" : "Guardar en favoritos"}
                </span>
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={isMutating}
            className={`absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border shadow-sm backdrop-blur-md transition hover:scale-110 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 disabled:cursor-not-allowed disabled:opacity-60 ${
                active
                    ? "border-red-200 bg-white/95 text-red-600 shadow-red-100"
                    : "border-slate-200/80 bg-white/85 text-slate-600 hover:border-red-200 hover:bg-white hover:text-red-600"
            } ${className}`}
            aria-label={
                active
                    ? `Eliminar ${product.name} de favoritos`
                    : `Guardar ${product.name} en favoritos`
            }
        >
            <FiHeart
                className={`text-base transition-all ${
                    active ? "fill-red-600 text-red-600 scale-110" : "text-current"
                }`}
                aria-hidden="true"
            />
        </button>
    );
};
