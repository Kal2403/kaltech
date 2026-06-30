import { useEffect, useState } from "react";

import { getProductById } from "../services/products/product.service";
import type { Product } from "../types/product.types";

export const useProductDetails = (productId?: string) => {
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!productId) {
            setError("Producto no encontrado.");
            setIsLoading(false);
            return;
        }

        const loadProduct = async () => {
            try {
                setIsLoading(true);
                setError("");

                const productData = await getProductById(productId);

                setProduct(productData);
            } catch {
                setError("No se pudo cargar el producto.");
            } finally {
                setIsLoading(false);
            }
        };

        loadProduct();
    }, [productId]);

    return {
        product,
        isLoading,
        error,
    };
};
