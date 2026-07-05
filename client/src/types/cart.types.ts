import type { Product } from "./product.types";

export interface CartItem {
    product: Product;
    quantity: number;
}

export interface Cart {
    _id: string;
    user: string;
    items: CartItem[];
    createdAt: string;
    updatedAt: string;
}
