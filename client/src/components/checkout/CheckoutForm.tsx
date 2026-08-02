import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../routes/paths'

import { useCheckout } from '../../hooks/useCheckout';
import type { PaymentMethod, ShippingAddress } from '../../types/order.types';

import { OrderSummary } from './OrderSummary';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { ShippingAddressForm } from './ShippingAddressForm';

interface CheckoutFormProps {
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    totalItems: number;
}

const initialShippingAddress: ShippingAddress = {
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    phone: '',
};

export const CheckoutForm = ({
    subtotal,
    tax,
    shipping,
    total,
    totalItems,
}: CheckoutFormProps) => {
    const { loading, error, submitOrder } = useCheckout();

    const [shippingAddress, setShippingAddress] =
        useState<ShippingAddress>(initialShippingAddress);

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');

    const navigate = useNavigate();

    const handleShippingChange = (
        field: keyof ShippingAddress,
        value: string
    ) => {
        setShippingAddress((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const validationError = validateForm();

        if (validationError) {
            alert(validationError);
            return;
        }

        const order = await submitOrder({
            shippingAddress,
            paymentMethod,
        });

        if (order) {
            navigate(ROUTES.home);
        }
    };

    const validateForm = () => {
        const requiredFields: (keyof ShippingAddress)[] = [
            'fullName',
            'address',
            'city',
            'postalCode',
            'country',
            'phone',
        ];

        const hasEmptyFields = requiredFields.some(
            (field) => !shippingAddress[field].trim()
        );

        if (hasEmptyFields) {
            return 'Completa todos los campos de la dirección de envío.';
        }

        return null;
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]"
        >
            <div className="space-y-6">
                <ShippingAddressForm
                    shippingAddress={shippingAddress}
                    onChange={handleShippingChange}
                    disabled={loading}
                />

                <PaymentMethodSelector
                    paymentMethod={paymentMethod}
                    onChange={setPaymentMethod}
                    disabled={loading}
                />

                {error && (
                    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                        {error}
                    </div>
                )}
            </div>

            <OrderSummary
                subtotal={subtotal}
                tax={tax}
                shipping={shipping}
                total={total}
                totalItems={totalItems}
                loading={loading}
            />
        </form>
    );
};
