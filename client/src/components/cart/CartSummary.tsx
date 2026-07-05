interface CartSummaryProps {
    subTotal: number;
    totalItems: number;
    isDisabled?: boolean;
}

export const CartSummary = ({ subTotal, totalItems, isDisabled = false }: CartSummaryProps) => {
    const tax = Number((subTotal * 0.18).toFixed(2));
    const shippingCost = subTotal > 1000 || subTotal === 0 ? 0 : 25;
    const total = subTotal + tax + shippingCost;

    return (
        <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-slate-600">Resume</h2>

            <div className="mt-6 space-y-4">
                <div className="flex justify-between text-slate-600">
                    <span>Productos</span>
                    <span>{totalItems}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>${subTotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                    <span>Impuestos</span>
                    <span>${tax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                    <span>Envio</span>
                    <span>{shippingCost === 0 ? "Gratis" : `$${shippingCost.toFixed(2)}`}</span>
                </div>

                <div className="border-t border-slate-200 pt-4">
                    <div className="flex justify-between text-xl font-black text-slate-950">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <button
                type="button"
                disabled={isDisabled || totalItems === 0}
                className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-4 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
                Continuar al Checkout
            </button>
        </aside>
    );
};
