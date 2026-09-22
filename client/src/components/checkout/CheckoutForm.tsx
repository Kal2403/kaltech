import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCheckout } from '../../hooks/useCheckout';
import { useProfile } from '../../hooks/useProfile';
import { payOrder } from '../../services/payment/payment.service';
import type { CardPaymentData, PaymentMethod, ShippingAddress } from '../../types/order.types';
import type { UserAddress } from '../../types/user.types';

import { CreditCardForm } from './CreditCardForm';
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

const initialCardData: CardPaymentData = {
    cardHolder: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
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

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
    const [cardData, setCardData] = useState<CardPaymentData>(initialCardData);
    const [isPaying, setIsPaying] = useState(false);
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

    const handleCardChange = (
        field: keyof CardPaymentData,
        value: string
    ) => {
        setCardData((prev) => ({
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
            if (paymentMethod === 'card') {
                try {
                    setIsPaying(true);
                    await payOrder(order._id, {
                        method: 'card',
                        card: cardData,
                    });
                } catch (payErr) {
                    console.error('Payment error:', payErr);
                } finally {
                    setIsPaying(false);
                }
            }
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

        if (paymentMethod === 'card') {
            if (!cardData.cardHolder.trim() || cardData.cardHolder.trim().length < 2) {
                return 'El nombre del titular en la tarjeta debe tener al menos 2 caracteres.';
            }
            const cleanNum = cardData.cardNumber.replace(/\D/g, '');
            if (cleanNum.length < 13 || cleanNum.length > 19) {
                return 'Ingresa un número de tarjeta válido (13 a 19 dígitos).';
            }
            const month = parseInt(cardData.expiryMonth, 10);
            const year = parseInt(cardData.expiryYear, 10);
            if (!month || month < 1 || month > 12) {
                return 'El mes de vencimiento de la tarjeta no es válido (01 a 12).';
            }
            const now = new Date();
            const currentYear = parseInt(now.getFullYear().toString().slice(-2), 10);
            const currentMonth = now.getMonth() + 1;
            if (year < currentYear || (year === currentYear && month < currentMonth)) {
                return 'La tarjeta se encuentra vencida.';
            }
            if (!cardData.cvv.trim() || cardData.cvv.trim().length < 3) {
                return 'El código de seguridad CVV debe tener 3 o 4 dígitos.';
            }
        }

        return null;
    };

    const isBusy = loading || isPaying;

    return (
        <form
            onSubmit={handleSubmit}
            className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]"
        >
            <div className="space-y-6">
                <ShippingAddressForm
                    shippingAddress={shippingAddress}
                    onChange={handleShippingChange}
                    disabled={isBusy}
                    savedAddresses={addresses}
                    onSelectSavedAddress={handleSelectSavedAddress}
                />

                <PaymentMethodSelector
                    paymentMethod={paymentMethod}
                    onChange={setPaymentMethod}
                    disabled={isBusy}
                />

                {paymentMethod === 'card' && (
                    <CreditCardForm
                        cardData={cardData}
                        onChange={handleCardChange}
                        disabled={isBusy}
                    />
                )}

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
                loading={isBusy}
            />
        </form>
    );
};
