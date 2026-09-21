import { createContext } from "react";
import type { Product } from "../types/product.types";

export interface WishlistContextValue {
    items: Product[];
    count: number;
    isLoading: boolean;
    isMutating: boolean;
    error: string;
    isInWishlist: (productId: string) => boolean;
    toggleWishlist: (product: Product) => Promise<void>;
    addItem: (product: Product) => Promise<void>;
    removeItem: (productId: string) => Promise<void>;
    clearAll: () => Promise<void>;
}

export const WishlistContext = createContext<WishlistContextValue | null>(null);
