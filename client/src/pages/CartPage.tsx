import { CartItemCard, CartSummary, EmptyCart } from "../components/cart";
import { useCart } from "../hooks/useCart";

export const CartPage = () => {
    const {
        items,
        subTotal,
        totalItems,
        isLoading,
        isMutating,
        error,
        updateItem,
        removeItem,
        clearCart,
    } = useCart();

    if (isLoading) {
        return (
            <section className="bg-slate-50 px-6 py-16">
                <div className="mx-auto max-w-7xl">
                    <p className="text-lg font-semibold text-slate-700">
                        Cargando carrito...
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="bg-slate-50 px-6 py-16">
            <div className="mx-auto max-w-7xl">
                <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <p className="text-sm font-black uppercase tracking-wide text-blue-600">
                            Carrito
                        </p>

                        <h1 className="mt-2 text-4xl font-black text-slate-950">
                            Tu Carrito de compras
                        </h1>
                    </div>

                    {items.length > 0 && (
                        <button
                            type="button"
                            disabled={isMutating}
                            onClick={clearCart}
                            className="rounded-xl border border-red-200 px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                            Vaciar carrito
                        </button>
                    )}
                </div>

                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
                        <p className="font-semibold text-red-600">{error}</p>
                    </div>
                )}

                {items.length === 0 ? (
                    <EmptyCart />
                ) : (
                    <div className="grip gap-8 lg:grid-cols-[1fr_360px]">
                        <div className="space-y-5">
                            {items.map((item) => (
                                <CartItemCard 
                                    key={item.product._id}
                                    item={item}
                                    isMutating={isMutating}
                                    onUpdateQuantity={updateItem}
                                    onRemove={removeItem}
                                />
                            ))}
                        </div>

                        <CartSummary 
                            subTotal={subTotal}
                            totalItems={totalItems}
                            isDisabled={isMutating}
                        />
                    </div>
                )}
            </div>
        </section>
    );
};
