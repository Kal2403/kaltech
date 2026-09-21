import type { ShippingAddress } from '../../types/order.types';
import type { UserAddress } from '../../types/user.types';

interface ShippingAddressFormProps {
    shippingAddress: ShippingAddress;
    onChange: (field: keyof ShippingAddress, value: string) => void;
    disabled?: boolean;
    savedAddresses?: UserAddress[];
    onSelectSavedAddress?: (address: UserAddress) => void;
}

const fields: {
    key: keyof ShippingAddress;
    label: string;
    placeholder: string;
    autoComplete: string;
    type?: string;
}[] = [
    { key: 'fullName', label: 'Nombre completo', placeholder: 'Juan Pérez', autoComplete: 'name' },
    { key: 'address', label: 'Dirección', placeholder: 'Calle y número', autoComplete: 'street-address' },
    { key: 'city', label: 'Ciudad', placeholder: 'Madrid', autoComplete: 'address-level2' },
    { key: 'postalCode', label: 'Código postal', placeholder: '28001', autoComplete: 'postal-code' },
    { key: 'country', label: 'País', placeholder: 'España', autoComplete: 'country-name' },
    { key: 'phone', label: 'Teléfono', placeholder: '+34 600 000 000', autoComplete: 'tel', type: 'tel' },
];

export const ShippingAddressForm = ({
    shippingAddress,
    onChange,
    disabled = false,
    savedAddresses = [],
    onSelectSavedAddress,
}: ShippingAddressFormProps) => (
    <section
        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.3)] sm:p-7"
        aria-labelledby="shipping-title"
    >
        <div className="mb-6 flex items-start gap-3">
            <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-black text-blue-600"
                aria-hidden="true"
            >
                1
            </span>
            <div>
                <h2 id="shipping-title" className="text-xl font-black text-slate-950">
                    Dirección de envío
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                    Indica dónde quieres recibir tu pedido.
                </p>
            </div>
        </div>

        {savedAddresses.length > 0 && (
            <div className="mb-6 space-y-2.5">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Tus direcciones guardadas
                </p>
                <div className="grid gap-2.5 sm:grid-cols-2">
                    {savedAddresses.map((addr) => {
                        const isSelected =
                            shippingAddress.address === addr.address &&
                            shippingAddress.postalCode === addr.postalCode &&
                            shippingAddress.phone === addr.phone;

                        return (
                            <button
                                key={addr._id}
                                type="button"
                                onClick={() => onSelectSavedAddress?.(addr)}
                                className={`flex flex-col items-start rounded-xl border p-3 text-left transition ${
                                    isSelected
                                        ? "border-blue-600 bg-blue-50/60 ring-1 ring-blue-600"
                                        : "border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50"
                                }`}
                            >
                                <div className="flex w-full items-center justify-between">
                                    <span className="text-xs font-bold text-slate-950">
                                        {addr.fullName}
                                    </span>
                                    {addr.isDefault && (
                                        <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[0.65rem] font-extrabold text-blue-700">
                                            Predeterminada
                                        </span>
                                    )}
                                </div>
                                <span className="mt-1 text-xs text-slate-600 line-clamp-1">
                                    {addr.address}, {addr.city}
                                </span>
                                <span className="text-[0.7rem] text-slate-400">
                                    {addr.phone}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
            {fields.map((field, index) => (
                <label
                    key={field.key}
                    className={`grid gap-2 text-sm font-bold text-slate-700 ${
                        index < 2 ? 'sm:col-span-2' : ''
                    }`}
                >
                    {field.label}
                    <input
                        required
                        type={field.type ?? 'text'}
                        autoComplete={field.autoComplete}
                        value={shippingAddress[field.key]}
                        onChange={(event) => onChange(field.key, event.target.value)}
                        disabled={disabled}
                        placeholder={field.placeholder}
                        className="min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                </label>
            ))}
        </div>
    </section>
);
