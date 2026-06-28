import { useEffect, useMemo, useState } from "react";

import { getProducts } from "../services/products/product.service";
import type { Product } from "../types/product.types";
import type { SortOption } from "../components/products/ProductSort";

export const useProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<SortOption>("featured");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setIsLoading(true);
                setError("");

                const productsData = await getProducts();

                setProducts(productsData)
            } catch {
                setError("No se pudieron cargar los productos.");
            } finally {
                setIsLoading(false);
            }
        };

        loadProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        const normalizedSearch = search.toLocaleLowerCase().trim();

        let result = products.filter((product) => {
            const productName = product.name.toLocaleLowerCase();
            const productDescription = product.description.toLocaleLowerCase();
            const productBrand = product.brand?.toLowerCase() ?? "";
            const productCategory = product.category?.name.toLocaleLowerCase() ?? "";

            return (
                productName.includes(normalizedSearch) ||
                productDescription.includes(normalizedSearch) ||
                productBrand.includes(normalizedSearch) ||
                productCategory.includes(normalizedSearch)
            );
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

                case "featured":
                    return Number(b.isFeatured) - Number(a.isFeatured);
            }
        });

        return result;
    }, [products, search, sort]);

    return {
        products,
        filteredProducts,
        search,
        setSearch,
        sort,
        setSort,
        isLoading,
        error,
    };
};
