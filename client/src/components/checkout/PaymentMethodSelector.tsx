import type { PaymentMethod } from '../../types/order.types';

interface PaymentMethodSelectorProps {
    paymentMethod: PaymentMethod;
    onChange: (method: PaymentMethod) => void;
    disabled?: boolean;
}

const paymentMethods: { value: PaymentMethod; label: string }[] = [
    {
        value: 'cash',
        label: 'Cash On Delivery',
    },
    {
        value: 'card',
        label: 'Credit / Debit Card',
    },
    {
        value: 'paypal',
        label: 'PayPal',
    },
];

export const PaymentMethodSelector = ({
    paymentMethod,
    onChange,
    disabled = false,
}: PaymentMethodSelectorProps) => {
    return (
        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Payment Method
            </h2>

            <div className="space-y-3">
                {paymentMethods.map((method) => (
                    <label
                        key={method.value}
                        className="flex cursor-pointer items-center gap-3 rounded-md border border-gray-300 p-3 transition hover:border-gray-500"
                    >
                        <input
                            type="radio"
                            name="paymentMethod"
                            value={method.value}
                            checked={paymentMethod === method.value}
                            onChange={() => onChange(method.value)}
                            disabled={disabled}
                            className="h-4 w-4"
                        />

                        <span className="text-gray-800">{method.label}</span>
                    </label>
                ))}
            </div>
        </section>
    );
};
