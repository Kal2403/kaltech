import type { ShippingAddress } from '../../types/order.types';

interface ShippingAddressFormProps {
    shippingAddress: ShippingAddress;
    onChange: (field: keyof ShippingAddress, value: string) => void;
    disabled?: boolean;
}

export const ShippingAddressForm = ({
    shippingAddress,
    onChange,
    disabled = false,
}: ShippingAddressFormProps) => {
    return (
        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Shipping Address
            </h2>

            <div className="grid gap-4">
                <input
                    type="text"
                    value={shippingAddress.fullName}
                    onChange={(event) => onChange('fullName', event.target.value)}
                    disabled={disabled}
                    placeholder="Full name"
                    className="w-full rounded-md border border-gray-300 px-4 py-2 outline-none focus:border-black disabled:bg-gray-100"
                />

                <input
                    type="text"
                    value={shippingAddress.address}
                    onChange={(event) => onChange('address', event.target.value)}
                    disabled={disabled}
                    placeholder="Address"
                    className="w-full rounded-md border border-gray-300 px-4 py-2 outline-none focus:border-black disabled:bg-gray-100"
                />

                <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(event) => onChange('city', event.target.value)}
                    disabled={disabled}
                    placeholder="City"
                    className="w-full rounded-md border border-gray-300 px-4 py-2 outline-none focus:border-black disabled:bg-gray-100"
                />

                <input
                    type="text"
                    value={shippingAddress.postalCode}
                    onChange={(event) => onChange('postalCode', event.target.value)}
                    disabled={disabled}
                    placeholder="Postal code"
                    className="w-full rounded-md border border-gray-300 px-4 py-2 outline-none focus:border-black disabled:bg-gray-100"
                />

                <input
                    type="text"
                    value={shippingAddress.country}
                    onChange={(event) => onChange('country', event.target.value)}
                    disabled={disabled}
                    placeholder="Country"
                    className="w-full rounded-md border border-gray-300 px-4 py-2 outline-none focus:border-black disabled:bg-gray-100"
                />

                <input
                    type="text"
                    value={shippingAddress.phone}
                    onChange={(event) => onChange('phone', event.target.value)}
                    disabled={disabled}
                    placeholder="Phone"
                    className="w-full rounded-md border border-gray-300 px-4 py-2 outline-none focus:border-black disabled:bg-gray-100"
                />
            </div>
        </section>
    );
};
