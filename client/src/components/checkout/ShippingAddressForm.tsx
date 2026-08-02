import type { ShippingAddress } from '../../types/order.types';

interface ShippingAddressFormProps { shippingAddress: ShippingAddress; onChange: (field: keyof ShippingAddress, value: string) => void; disabled?: boolean; }

const fields: { key: keyof ShippingAddress; label: string; placeholder: string; autoComplete: string; type?: string }[] = [
    { key: 'fullName', label: 'Nombre completo', placeholder: 'Juan Pérez', autoComplete: 'name' },
    { key: 'address', label: 'Dirección', placeholder: 'Calle y número', autoComplete: 'street-address' },
    { key: 'city', label: 'Ciudad', placeholder: 'Madrid', autoComplete: 'address-level2' },
    { key: 'postalCode', label: 'Código postal', placeholder: '28001', autoComplete: 'postal-code' },
    { key: 'country', label: 'País', placeholder: 'España', autoComplete: 'country-name' },
    { key: 'phone', label: 'Teléfono', placeholder: '+34 600 000 000', autoComplete: 'tel', type: 'tel' },
];

export const ShippingAddressForm = ({ shippingAddress, onChange, disabled = false }: ShippingAddressFormProps) => (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.3)] sm:p-7" aria-labelledby="shipping-title">
        <div className="mb-6 flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-black text-blue-600" aria-hidden="true">1</span>
            <div><h2 id="shipping-title" className="text-xl font-black text-slate-950">Dirección de envío</h2><p className="mt-1 text-sm text-slate-500">Indica dónde quieres recibir tu pedido.</p></div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
            {fields.map((field, index) => (
                <label key={field.key} className={`grid gap-2 text-sm font-bold text-slate-700 ${index < 2 ? 'sm:col-span-2' : ''}`}>
                    {field.label}
                    <input required type={field.type ?? 'text'} autoComplete={field.autoComplete} value={shippingAddress[field.key]} onChange={(event) => onChange(field.key, event.target.value)} disabled={disabled} placeholder={field.placeholder} className="min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60" />
                </label>
            ))}
        </div>
    </section>
);
