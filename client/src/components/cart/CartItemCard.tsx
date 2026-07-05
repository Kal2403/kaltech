import type { CartItem } from "../../types/cart.types";

interface CartItemCardProps {
    item: CartItem;
    onUpdateQuantity: (productId: string, quantity: number) => void;
    onRemove: (productId: string) => void;
    isMutating: boolean;
}

export const CartItemCard = ({
    item,
    onUpdateQuantity,
    onRemove,
    isMutating = false,
}: CartItemCardProps) => {
    const product = item.product;
    const price = product.discountPrice ?? product.price;
    const itemTotal = price * item.quantity;

    const handleDecrease = () => {
        if (item.quantity > 1) {
            onUpdateQuantity(product._id, item.quantity - 1);
        }
    };

    const handleIncrease = () => {
        if (item.quantity < product.stock) {
            onUpdateQuantity(product._id, item.quantity + 1);
        }
    };

    return (
        <article className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-[120px_1fr:auto]">
            <div className="w-32 h-32 overflow-hidden rounded-lg bg-gray-100">
                <img
                    src={product.images[0] ?? "https://placehold.co/300x300"}
                    alt={product.name}
                    onError={(event) => { event.currentTarget.src = "https://placehold.co/300x300"; }}
                    className="h-full w-full object-cover"
                />
            </div>

            <div>
                <p className='text-sm font-bold text-blue-600'>{product.brand}</p>

                <h3 className='mt-1 text-xl font-black text-slate-950'>
                    {product.name}
                </h3>

                <p className='mt-2 text-sm text-slate-500'>
                    Stock disponible: {product.stock}
                </p>

                <div className='mt-4 flex items-center gap-3'>
                    <button
                        type='button'
                        disabled={isMutating || item.quantity <= 1}
                        onClick={handleDecrease}
                        className='flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 font-bold disabled:cursor-not-allowed disabled:opacity-40'
                    >
                        -
                    </button>

                    <span className='min-w-8 text-center font-bold'>{item.quantity}</span>

                    <button
                        type='button'
                        disabled={isMutating || item.quantity >= product.stock}
                        onClick={handleIncrease}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 font-bold disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        +
                    </button>
                </div>
            </div>

            <div className="flex flex-col justify-between md: items-end">
                <div>
                    <p className="text-sm font-semibold text-slate-500">SubTotal</p>
                    <p className="text-2xl font-black text-slate-950">${itemTotal}</p>
                </div>

                <button
                    type="button"
                    disabled={isMutating}
                    onClick={() => onRemove(product._id)}
                    className="mt-4 text-sm font-bold text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                    Eliminar
                </button>
            </div>
        </article>
    );
};
