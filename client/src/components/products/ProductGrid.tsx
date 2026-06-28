import type { Product } from "../../types/product.types";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
    products: Product[];
}

export const ProductGrid = ({ products}: ProductGridProps) => {
    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
                <ProductCard key={product._id} product={product} />
            ))}
        </div>
    );
};
