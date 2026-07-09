interface OrderSummaryProps {
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    totalItems: number;
    loading?: boolean;
}

export const OrderSummary = ({
    subtotal,
    tax,
    shipping,
    total,
    totalItems,
    loading = false,
}: OrderSummaryProps) => {
    return (
        <aside className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Order Summary
            </h2>

            <div className="space-y-3 text-sm text-gray-700">
                <div className="flex justify-between">
                    <span>Products</span>
                    <span>{totalItems}</span>
                </div>

                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>

                <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-semibold text-gray-900">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full rounded-md bg-black px-4 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
                {loading ? 'Creating order...' : 'Place Order'}
            </button>
        </aside>
    );
};
