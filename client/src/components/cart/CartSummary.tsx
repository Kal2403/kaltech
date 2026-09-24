import { useState } from 'react';
import { FiArrowRight, FiCheckCircle, FiTag, FiX } from 'react-icons/fi';
import axios from 'axios';
import { validateCoupon } from '../../services/coupon/coupon.service';
import type { CouponValidationResult } from '../../types/coupon.types';

interface CartSummaryProps {
    subTotal: number;
    totalItems: number;
    isDisabled?: boolean;
    onCheckout: () => void;
    appliedCoupon?: CouponValidationResult | null;
    onCouponChange?: (coupon: CouponValidationResult | null) => void;
}

export const CartSummary = ({
    subTotal,
    totalItems,
    isDisabled = false,
    onCheckout,
    appliedCoupon = null,
    onCouponChange,
}: CartSummaryProps) => {
    const [couponInput, setCouponInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleApplyCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = couponInput.trim();
        if (!code) return;

        try {
            setLoading(true);
            setError(null);
            const result = await validateCoupon(code, subTotal);
            onCouponChange?.(result);
            setCouponInput('');
        } catch (err: unknown) {
            let msg = 'Cupón inválido o expirado';
            if (axios.isAxiosError(err) && err.response?.data?.message) {
                msg = err.response.data.message;
            }
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        onCouponChange?.(null);
        setError(null);
        setCouponInput('');
    };

    const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
    const tax = Number((subTotal * 0.18).toFixed(2));
    const shippingCost = subTotal > 1000 || subTotal === 0 ? 0 : 25;
    const total = Number(
        Math.max(0, subTotal - discountAmount + tax + shippingCost).toFixed(2)
    );

    return (
        <aside
            className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_70px_-38px_rgba(15,23,42,0.4)] lg:sticky lg:top-24"
            aria-labelledby="cart-summary-title"
        >
            <div className="flex items-center justify-between">
                <h2 id="cart-summary-title" className="text-xl font-black text-slate-950">
                    Resumen
                </h2>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                    {totalItems} {totalItems === 1 ? 'artículo' : 'artículos'}
                </span>
            </div>

            <div className="mt-6 border-y border-slate-100 py-4">
                <label
                    htmlFor="promo-code-input"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-500"
                >
                    Código promocional
                </label>

                {appliedCoupon ? (
                    <div className="mt-2.5 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5">
                        <div className="flex items-center gap-2">
                            <FiCheckCircle className="text-emerald-600" aria-hidden="true" />
                            <div>
                                <span className="font-black tracking-wide text-emerald-900">
                                    {appliedCoupon.coupon.code}
                                </span>
                                <span className="ml-1.5 rounded-md bg-emerald-200/70 px-1.5 py-0.5 text-xs font-bold text-emerald-800">
                                    -{appliedCoupon.coupon.discountPercent}%
                                </span>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleRemoveCoupon}
                            aria-label="Quitar cupón"
                            className="rounded-lg p-1 text-emerald-700 transition hover:bg-emerald-200/60 hover:text-emerald-900"
                        >
                            <FiX className="text-lg" />
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleApplyCoupon} className="mt-2 flex gap-2">
                        <div className="relative flex-1">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                <FiTag aria-hidden="true" />
                            </div>
                            <input
                                id="promo-code-input"
                                type="text"
                                value={couponInput}
                                onChange={(e) => {
                                    setCouponInput(e.target.value.toUpperCase());
                                    if (error) setError(null);
                                }}
                                placeholder="Ej: SAVE10"
                                disabled={loading || isDisabled || totalItems === 0}
                                className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm font-semibold uppercase tracking-wider text-slate-900 placeholder:text-xs placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !couponInput.trim() || isDisabled || totalItems === 0}
                            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                            {loading ? '...' : 'Aplicar'}
                        </button>
                    </form>
                )}

                {error && (
                    <p role="alert" className="mt-2 text-xs font-semibold text-red-600">
                        {error}
                    </p>
                )}
            </div>

            <dl className="mt-5 space-y-4 text-sm">
                <div className="flex justify-between text-slate-600">
                    <dt>Subtotal</dt>
                    <dd className="font-bold text-slate-900">${subTotal.toFixed(2)}</dd>
                </div>

                {appliedCoupon && discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                        <dt>Descuento ({appliedCoupon.coupon.code})</dt>
                        <dd>-${discountAmount.toFixed(2)}</dd>
                    </div>
                )}

                <div className="flex justify-between text-slate-600">
                    <dt>Impuestos</dt>
                    <dd className="font-bold text-slate-900">${tax.toFixed(2)}</dd>
                </div>

                <div className="flex justify-between text-slate-600">
                    <dt>Envío</dt>
                    <dd className="font-bold text-emerald-600">
                        {shippingCost === 0 ? 'Gratis' : `$${shippingCost.toFixed(2)}`}
                    </dd>
                </div>

                <div className="flex justify-between border-t border-slate-200 pt-5 text-xl font-black text-slate-950">
                    <dt>Total</dt>
                    <dd>${total.toFixed(2)}</dd>
                </div>
            </dl>

            <button
                type="button"
                disabled={isDisabled || totalItems === 0}
                onClick={onCheckout}
                className="mt-6 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
                Continuar al pago <FiArrowRight aria-hidden="true" />
            </button>

            <p className="mt-4 text-center text-xs font-medium text-slate-500">
                Los importes se calculan antes de crear la orden.
            </p>
        </aside>
    );
};
