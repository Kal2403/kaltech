import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { useAuth } from "../hooks/useAuth";
import type { Product } from "../types/product.types";
import { storage } from "../utils/storage";
import {
    addWishlistItem,
    clearWishlist as clearWishlistApi,
    getWishlist,
    removeWishlistItem,
} from "../services/wishlist/wishlist.service";
import {
    WishlistContext,
    type WishlistContextValue,
} from "./wishlist-context";

const GUEST_WISHLIST_STORAGE_KEY = "kaltech_guest_wishlist";

const getStoredGuestItems = (): Product[] => {
    try {
        const stored = localStorage.getItem(GUEST_WISHLIST_STORAGE_KEY);
        return stored ? (JSON.parse(stored) as Product[]) : [];
    } catch {
        return [];
    }
};

const setStoredGuestItems = (items: Product[]): void => {
    try {
        localStorage.setItem(GUEST_WISHLIST_STORAGE_KEY, JSON.stringify(items));
    } catch {
        // Ignore storage write errors
    }
};

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
    const { user, isInitializing } = useAuth();
    const [serverItems, setServerItems] = useState<Product[]>([]);
    const [guestItems, setGuestItems] = useState<Product[]>(getStoredGuestItems);
    const [isLoading, setIsLoading] = useState(() => Boolean(storage.getToken()));
    const [isMutating, setIsMutating] = useState(false);
    const [error, setError] = useState("");

    const items = user ? serverItems : guestItems;

    useEffect(() => {
        if (!user || isInitializing) return;

        let cancelled = false;

        void getWishlist()
            .then((data) => {
                if (!cancelled) {
                    setServerItems(data.products || []);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setError("No se pudo cargar la lista de favoritos");
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setIsLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [user, isInitializing]);

    const isInWishlist = useCallback(
        (productId: string) => {
            return items.some((item) => item._id === productId);
        },
        [items]
    );

    const addItem = useCallback(
        async (product: Product) => {
            setIsMutating(true);
            setError("");

            if (!user) {
                setGuestItems((prev) => {
                    if (prev.some((item) => item._id === product._id)) return prev;
                    const next = [...prev, product];
                    setStoredGuestItems(next);
                    return next;
                });
                setIsMutating(false);
                return;
            }

            // Optimistic update for logged-in user
            setServerItems((prev) => {
                if (prev.some((item) => item._id === product._id)) return prev;
                return [...prev, product];
            });

            try {
                const data = await addWishlistItem(product._id);
                setServerItems(data.products || []);
            } catch {
                setError("Error al agregar a favoritos");
                setServerItems((prev) =>
                    prev.filter((item) => item._id !== product._id)
                );
            } finally {
                setIsMutating(false);
            }
        },
        [user]
    );

    const removeItem = useCallback(
        async (productId: string) => {
            setIsMutating(true);
            setError("");

            if (!user) {
                setGuestItems((prev) => {
                    const next = prev.filter((item) => item._id !== productId);
                    setStoredGuestItems(next);
                    return next;
                });
                setIsMutating(false);
                return;
            }

            const previousItems = serverItems;
            setServerItems((prev) => prev.filter((item) => item._id !== productId));

            try {
                const data = await removeWishlistItem(productId);
                setServerItems(data.products || []);
            } catch {
                setError("Error al eliminar de favoritos");
                setServerItems(previousItems);
            } finally {
                setIsMutating(false);
            }
        },
        [serverItems, user]
    );

    const toggleWishlist = useCallback(
        async (product: Product) => {
            if (isInWishlist(product._id)) {
                await removeItem(product._id);
            } else {
                await addItem(product);
            }
        },
        [isInWishlist, removeItem, addItem]
    );

    const clearAll = useCallback(async () => {
        setIsMutating(true);
        setError("");

        if (!user) {
            setGuestItems([]);
            setStoredGuestItems([]);
            setIsMutating(false);
            return;
        }

        const previousItems = serverItems;
        setServerItems([]);

        try {
            await clearWishlistApi();
        } catch {
            setError("Error al vaciar favoritos");
            setServerItems(previousItems);
        } finally {
            setIsMutating(false);
        }
    }, [serverItems, user]);

    const value = useMemo<WishlistContextValue>(
        () => ({
            items,
            count: items.length,
            isLoading,
            isMutating,
            error,
            isInWishlist,
            toggleWishlist,
            addItem,
            removeItem,
            clearAll,
        }),
        [
            items,
            isLoading,
            isMutating,
            error,
            isInWishlist,
            toggleWishlist,
            addItem,
            removeItem,
            clearAll,
        ]
    );

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};
