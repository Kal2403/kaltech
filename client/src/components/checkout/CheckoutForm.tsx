import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCheckout } from '../../hooks/useCheckout';
import { useProfile } from '../../hooks/useProfile';
import type { PaymentMethod, ShippingAddress } from '../../types/order.types';
import type { UserAddress } from '../../types/user.types';

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
    const { addresses } = useProfile();

    const [shippingAddress, setShippingAddress] =
        useState<ShippingAddress>(initialShippingAddress);

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
    const [validationError, setValidationError] = useState<string | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (addresses.length === 0) return;
        const timer = setTimeout(() => {
            setShippingAddress((prev) => {
                if (prev.address.trim()) return prev;
                const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
                return {
                    fullName: defaultAddr.fullName,
                    address: defaultAddr.address,
                    city: defaultAddr.city,
                    postalCode: defaultAddr.postalCode,
                    country: defaultAddr.country,
                    phone: defaultAddr.phone,
                };
            });
        }, 0);
        return () => clearTimeout(timer);
    }, [addresses]);

    const handleSelectSavedAddress = (addr: UserAddress) => {
        setShippingAddress({
            fullName: addr.fullName,
            address: addr.address,
            city: addr.city,
            postalCode: addr.postalCode,
            country: addr.country,
            phone: addr.phone,
        });
        if (validationError) {
            setValidationError(null);
        }
    };

    const handleShippingChange = (
        field: keyof ShippingAddress,
        value: string
    ) => {
        setShippingAddress((prev) => ({
            ...prev,
            [field]: value,
        }));
        if (validationError) {
            setValidationError(null);
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setValidationError(null);

        const formError = validateForm();

        if (formError) {
            setValidationError(formError);
            return;
        }

        const order = await submitOrder({
            shippingAddress,
            paymentMethod,
        });

        if (order) {
            navigate(`/orders/${order._id}`);
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
                    savedAddresses={addresses}
                    onSelectSavedAddress={handleSelectSavedAddress}
                />

                <PaymentMethodSelector
                    paymentMethod={paymentMethod}
                    onChange={setPaymentMethod}
                    disabled={loading}
                />

                {(validationError || error) && (
                    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                        {validationError || error}
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
