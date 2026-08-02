import type { PaymentMethod } from '../../types/order.types';

interface PaymentMethodSelectorProps { paymentMethod: PaymentMethod; onChange: (method: PaymentMethod) => void; disabled?: boolean; }
const paymentMethods: { value: PaymentMethod; label: string; description: string; mark: string }[] = [
    { value: 'cash', label: 'Pago contra entrega', description: 'Paga cuando recibas tu pedido', mark: '€' },
    { value: 'card', label: 'Tarjeta de crédito o débito', description: 'Método registrado con la orden', mark: '▰' },
    { value: 'paypal', label: 'PayPal', description: 'Método registrado con la orden', mark: 'P' },
];

export const PaymentMethodSelector = ({ paymentMethod, onChange, disabled = false }: PaymentMethodSelectorProps) => (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.3)] sm:p-7" aria-labelledby="payment-title">
        <div className="mb-6 flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-black text-blue-600" aria-hidden="true">2</span><div><h2 id="payment-title" className="text-xl font-black text-slate-950">Método de pago</h2><p className="mt-1 text-sm text-slate-500">Selecciona una opción para completar la orden.</p></div></div>
        <div className="grid gap-3">
            {paymentMethods.map((method) => {
                const selected = paymentMethod === method.value;
                return <label key={method.value} className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition ${selected ? 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-100' : 'border-slate-200 hover:border-blue-300'} ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}>
                    <input type="radio" name="paymentMethod" value={method.value} checked={selected} onChange={() => onChange(method.value)} disabled={disabled} className="h-5 w-5 accent-blue-600" />
                    <span className="min-w-0 flex-1"><span className="block font-bold text-slate-950">{method.label}</span><span className="block text-sm text-slate-500">{method.description}</span></span>
                    <span className="flex h-9 w-11 items-center justify-center rounded-lg bg-white font-black text-blue-600 shadow-sm" aria-hidden="true">{method.mark}</span>
                </label>;
            })}
        </div>
    </section>
);
