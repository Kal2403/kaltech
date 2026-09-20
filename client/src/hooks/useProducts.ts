import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { getProducts } from "../services/products/product.service";
import type { Product } from "../types/product.types";
import type { SortOption } from "../components/products/ProductSort";

export interface BrandFilterOption {
    brand: string;
    count: number;
}

export interface CategoryFilterOption {
    slug: string;
    name: string;
    count: number;
}

export const useProducts = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // Raw params
    const search = searchParams.get("search") ?? "";
    const selectedCategory = searchParams.get("category") ?? "";
    const selectedBrands = useMemo(() => {
        const param = searchParams.get("brand");
        return param
            ? param
                  .split(",")
                  .map((b) => b.trim())
                  .filter(Boolean)
            : [];
    }, [searchParams]);

    const minPrice = searchParams.get("minPrice")
        ? Number(searchParams.get("minPrice"))
        : undefined;
    const maxPrice = searchParams.get("maxPrice")
        ? Number(searchParams.get("maxPrice"))
        : undefined;
    const minRating = searchParams.get("minRating")
        ? Number(searchParams.get("minRating"))
        : undefined;
    const inStock = searchParams.get("inStock") === "true";
    const sort = (searchParams.get("sort") as SortOption) ?? "featured";

    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const updateParams = useCallback(
        (updater: (prev: URLSearchParams) => URLSearchParams) => {
            setSearchParams(
                (prev) => updater(new URLSearchParams(prev)),
                { replace: true }
            );
        },
        [setSearchParams]
    );

    const handleSearchChange = useCallback(
        (newSearch: string) => {
            updateParams((next) => {
                const trimmed = newSearch.trim();
                if (trimmed) next.set("search", trimmed);
                else next.delete("search");
                return next;
            });
        },
        [updateParams]
    );

    const handleCategoryChange = useCallback(
        (categorySlug: string) => {
            updateParams((next) => {
                if (categorySlug) next.set("category", categorySlug);
                else next.delete("category");
                return next;
            });
        },
        [updateParams]
    );

    const handleBrandToggle = useCallback(
        (brand: string) => {
            updateParams((next) => {
                const currentBrands = next.get("brand")
                    ? next
                          .get("brand")!
                          .split(",")
                          .map((b) => b.trim())
                          .filter(Boolean)
                    : [];
                let nextBrands: string[];
                if (currentBrands.includes(brand)) {
                    nextBrands = currentBrands.filter((b) => b !== brand);
                } else {
                    nextBrands = [...currentBrands, brand];
                }
                if (nextBrands.length > 0) {
                    next.set("brand", nextBrands.join(","));
                } else {
                    next.delete("brand");
                }
                return next;
            });
        },
        [updateParams]
    );

    const handlePriceChange = useCallback(
        (min?: number, max?: number) => {
            updateParams((next) => {
                if (min != null && !isNaN(min) && min >= 0) {
                    next.set("minPrice", String(min));
                } else {
                    next.delete("minPrice");
                }
                if (max != null && !isNaN(max) && max >= 0) {
                    next.set("maxPrice", String(max));
                } else {
                    next.delete("maxPrice");
                }
                return next;
            });
        },
        [updateParams]
    );

    const handleRatingChange = useCallback(
        (rating?: number) => {
            updateParams((next) => {
                if (rating != null && rating > 0) {
                    next.set("minRating", String(rating));
                } else {
                    next.delete("minRating");
                }
                return next;
            });
        },
        [updateParams]
    );

    const handleInStockChange = useCallback(
        (onlyInStock: boolean) => {
            updateParams((next) => {
                if (onlyInStock) {
                    next.set("inStock", "true");
                } else {
                    next.delete("inStock");
                }
                return next;
            });
        },
        [updateParams]
    );

    const handleSortChange = useCallback(
        (newSort: SortOption) => {
            updateParams((next) => {
                if (newSort && newSort !== "featured") {
                    next.set("sort", newSort);
                } else {
                    next.delete("sort");
                }
                return next;
            });
        },
        [updateParams]
    );

    const clearFilters = useCallback(() => {
        updateParams((next) => {
            next.delete("category");
            next.delete("brand");
            next.delete("minPrice");
            next.delete("maxPrice");
            next.delete("minRating");
            next.delete("inStock");
            return next;
        });
    }, [updateParams]);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setIsLoading(true);
                setError("");
                const productsData = await getProducts();
                setProducts(productsData);
            } catch {
                setError("No se pudieron cargar los productos.");
            } finally {
                setIsLoading(false);
            }
        };

        loadProducts();
    }, []);

    // Extract dynamic options from loaded products
    const { availableBrands, availableCategories, priceBounds } = useMemo(() => {
        const brandCounts = new Map<string, number>();
        const categoryMap = new Map<string, { name: string; count: number }>();
        let min = Infinity;
        let max = -Infinity;

        for (const p of products) {
            const effectivePrice = p.discountPrice ?? p.price;
            if (effectivePrice < min) min = effectivePrice;
            if (effectivePrice > max) max = effectivePrice;

            if (p.brand) {
                brandCounts.set(p.brand, (brandCounts.get(p.brand) ?? 0) + 1);
            }

            if (p.category) {
                const existing = categoryMap.get(p.category.slug) ?? {
                    name: p.category.name,
                    count: 0,
                };
                existing.count++;
                categoryMap.set(p.category.slug, existing);
            }
        }

        const brands: BrandFilterOption[] = Array.from(brandCounts.entries())
            .map(([brand, count]) => ({ brand, count }))
            .sort((a, b) => a.brand.localeCompare(b.brand));

        const categories: CategoryFilterOption[] = Array.from(
            categoryMap.entries()
        )
            .map(([slug, { name, count }]) => ({ slug, name, count }))
            .sort((a, b) => a.name.localeCompare(b.name));

        return {
            availableBrands: brands,
            availableCategories: categories,
            priceBounds: {
                min: min === Infinity ? 0 : Math.floor(min),
                max: max === -Infinity ? 5000 : Math.ceil(max),
            },
        };
    }, [products]);

    // Filter and Sort in memory
    const filteredProducts = useMemo(() => {
        const normalizedSearch = search.toLocaleLowerCase().trim();

        let result = products.filter((product) => {
            const finalPrice = product.discountPrice ?? product.price;

            // Search filter
            if (normalizedSearch) {
                const productName = product.name.toLocaleLowerCase();
                const productDescription =
                    product.description.toLocaleLowerCase();
                const productBrand = product.brand?.toLowerCase() ?? "";
                const productCategory =
                    product.category?.name.toLocaleLowerCase() ?? "";

                const matchesSearch =
                    productName.includes(normalizedSearch) ||
                    productDescription.includes(normalizedSearch) ||
                    productBrand.includes(normalizedSearch) ||
                    productCategory.includes(normalizedSearch);

                if (!matchesSearch) return false;
            }

            // Category filter
            if (selectedCategory) {
                if (
                    product.category?.slug !== selectedCategory &&
                    product.category?.name.toLowerCase() !==
                        selectedCategory.toLowerCase()
                ) {
                    return false;
                }
            }

            // Brand filter
            if (selectedBrands.length > 0) {
                if (
                    !product.brand ||
                    !selectedBrands.some(
                        (b) => b.toLowerCase() === product.brand?.toLowerCase()
                    )
                ) {
                    return false;
                }
            }

            // Price filter
            if (minPrice != null && finalPrice < minPrice) return false;
            if (maxPrice != null && finalPrice > maxPrice) return false;

            // Rating filter
            if (minRating != null && (product.rating ?? 0) < minRating)
                return false;

            // Stock filter
            if (inStock && product.stock <= 0) return false;

            return true;
        });

        result = [...result].sort((a, b) => {
            const priceA = a.discountPrice ?? a.price;
            const priceB = b.discountPrice ?? b.price;

            switch (sort) {
                case "price-asc":
                    return priceA - priceB;
                case "price-desc":
                    return priceB - priceA;
                case "name-asc":
                    return a.name.localeCompare(b.name);
                case "name-desc":
                    return b.name.localeCompare(a.name);
                case "rating-desc":
                    return (b.rating ?? 0) - (a.rating ?? 0);
                case "featured":
                default:
                    return Number(b.isFeatured) - Number(a.isFeatured);
            }
        });

        return result;
    }, [
        products,
        search,
        selectedCategory,
        selectedBrands,
        minPrice,
        maxPrice,
        minRating,
        inStock,
        sort,
    ]);

    const hasActiveFilters = Boolean(
        selectedCategory ||
            selectedBrands.length > 0 ||
            minPrice != null ||
            maxPrice != null ||
            minRating != null ||
            inStock
    );

    const activeFilterCount =
        (selectedCategory ? 1 : 0) +
        selectedBrands.length +
        (minPrice != null || maxPrice != null ? 1 : 0) +
        (minRating != null ? 1 : 0) +
        (inStock ? 1 : 0);

    return {
        products,
        filteredProducts,
        search,
        setSearch: handleSearchChange,
        selectedCategory,
        setSelectedCategory: handleCategoryChange,
        selectedBrands,
        toggleBrand: handleBrandToggle,
        minPrice,
        maxPrice,
        setPriceRange: handlePriceChange,
        minRating,
        setMinRating: handleRatingChange,
        inStock,
        setInStock: handleInStockChange,
        sort,
        setSort: handleSortChange,
        clearFilters,
        hasActiveFilters,
        activeFilterCount,
        availableBrands,
        availableCategories,
        priceBounds,
        isLoading,
        error,
    };
};
