import { CheckoutForm } from "../components/checkout";
import { EmptyCart } from "../components/cart";
import { useCart } from "../hooks/useCart";

export const CheckoutPage = () => {
    const {
        items,
        subTotal,
        totalItems,
        isLoading,
        error,
    } = useCart();

    const tax = Number((subTotal * 0.18).toFixed(2));
    const shipping = subTotal > 1000 || subTotal === 0 ? 0 : 25;
    const total = subTotal + tax + shipping;

    if (isLoading) {
        return (
            <section className="min-h-[70vh] bg-slate-50 px-5 py-14 sm:px-6">
                <div role="status" aria-busy="true" className="mx-auto flex min-h-64 max-w-7xl items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <span aria-hidden="true" className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    <p className="text-lg font-semibold text-slate-700">
                        Cargando checkout...
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="min-h-screen bg-gradient-to-b from-blue-50/70 via-slate-50 to-white px-5 py-12 sm:px-6 sm:py-16">
            <div className="mx-auto max-w-7xl">
                <div className="mb-10">
                    <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-600">Resumen de compra</p>

                    <h1 className="mt-2 text-4xl font-black text-slate-950">
                        Finalizar compra
                    </h1>
                </div>

                {error && (
                    <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
                        <p className="font-semibold text-red-600">{error}</p>
                    </div>
                )}

                {items.length === 0 ? (
                    <EmptyCart />
                ) : (
                    <CheckoutForm
                        subtotal={subTotal}
                        tax={tax}
                        shipping={shipping}
                        total={total}
                        totalItems={totalItems}
                    />
                )}
            </div>
        </section>
    );
};
