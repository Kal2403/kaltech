import { useNavigate } from "react-router-dom";

import { CartItemCard, CartSummary, EmptyCart } from "../components/cart";
import { useCart } from "../hooks/useCart";
import { ROUTES } from "../routes/paths"

export const CartPage = () => {
    const navigate = useNavigate();

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

    const handleCheckout = () => {
        navigate(ROUTES.checkout);
    };

    if (isLoading) {
        return (
            <section className="min-h-[70vh] bg-slate-50 px-5 py-14 sm:px-6">
                <div role="status" aria-busy="true" className="mx-auto flex min-h-64 max-w-7xl items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <span aria-hidden="true" className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    <p className="text-lg font-semibold text-slate-700">
                        Cargando carrito...
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="min-h-[70vh] bg-gradient-to-b from-blue-50/70 via-slate-50 to-white px-5 py-12 sm:px-6 sm:py-16">
            <div className="mx-auto max-w-7xl">
                <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-600">Tu selección</p>

                        <h1 className="mt-2 text-4xl font-black text-slate-950">
                            Carrito de compras
                        </h1>
                    </div>

                    {items.length > 0 && (
                        <button
                            type="button"
                            disabled={isMutating}
                            onClick={clearCart}
                            className="min-h-12 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Vaciar carrito
                        </button>
                    )}
                </div>

                {error && (
                    <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
                        <p className="font-semibold text-red-600">{error}</p>
                    </div>
                )}

                {items.length === 0 ? (
                    <EmptyCart />
                ) : (
                    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
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
                            onCheckout={handleCheckout}
                        />
                    </div>
                )}
            </div>
        </section>
    );
};
