import { useEffect, useState } from "react";
import { FiCheckCircle, FiCreditCard, FiLock, FiX } from "react-icons/fi";
import { payOrder } from "../../services/payment/payment.service";
import type { CardPaymentData, Order, PaymentMethod } from "../../types/order.types";
import { CreditCardForm } from "../checkout/CreditCardForm";

interface PaymentModalProps {
    order: Order;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const initialCardData: CardPaymentData = {
    cardHolder: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
};

export const PaymentModal = ({
    order,
    isOpen,
    onClose,
    onSuccess,
}: PaymentModalProps) => {
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("card");
    const [cardData, setCardData] = useState<CardPaymentData>(initialCardData);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !isLoading) {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, isLoading, onClose]);

    if (!isOpen) return null;

    const handleCardChange = (field: keyof CardPaymentData, value: string) => {
        setCardData((prev) => ({
            ...prev,
            [field]: value,
        }));
        if (error) setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (selectedMethod === "card") {
            if (!cardData.cardHolder.trim() || cardData.cardHolder.trim().length < 2) {
                setError("El nombre del titular en la tarjeta debe tener al menos 2 caracteres.");
                return;
            }
            const cleanNum = cardData.cardNumber.replace(/\D/g, "");
            if (cleanNum.length < 13 || cleanNum.length > 19) {
                setError("Ingresa un número de tarjeta válido (13 a 19 dígitos).");
                return;
            }
            const month = parseInt(cardData.expiryMonth, 10);
            const year = parseInt(cardData.expiryYear, 10);
            if (!month || month < 1 || month > 12) {
                setError("El mes de vencimiento de la tarjeta no es válido (01 a 12).");
                return;
            }
            const now = new Date();
            const currentYear = parseInt(now.getFullYear().toString().slice(-2), 10);
            const currentMonth = now.getMonth() + 1;
            if (year < currentYear || (year === currentYear && month < currentMonth)) {
                setError("La tarjeta se encuentra vencida.");
                return;
            }
            if (!cardData.cvv.trim() || cardData.cvv.trim().length < 3) {
                setError("El código de seguridad CVV debe tener 3 o 4 dígitos.");
                return;
            }
        }

        try {
            setIsLoading(true);
            await payOrder(order._id, {
                method: selectedMethod,
                card: selectedMethod === "card" ? cardData : undefined,
                paypal: selectedMethod === "paypal" ? { orderId: `PP-${Date.now()}` } : undefined,
            });

            setSuccessMessage("¡Pago procesado con éxito!");
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1000);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Error al procesar el pago";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn"
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-modal-title"
        >
            <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl">
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isLoading}
                    aria-label="Cerrar ventana de pago"
                    className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition focus-visible:outline-2 focus-visible:outline-blue-600 disabled:opacity-50"
                >
                    <FiX className="text-xl" />
                </button>

                <header className="mb-6">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-3">
                        <FiCreditCard className="text-xl" />
                    </span>
                    <h2 id="payment-modal-title" className="text-2xl font-black text-slate-950">
                        Completar Pago
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                        Orden #{order._id} • Total a pagar:{" "}
                        <span className="font-extrabold text-blue-600">${order.total.toFixed(2)}</span>
                    </p>
                </header>

                {successMessage ? (
                    <div className="py-8 text-center">
                        <FiCheckCircle className="mx-auto text-5xl text-emerald-500 animate-bounce" />
                        <p className="mt-4 text-xl font-black text-slate-950">{successMessage}</p>
                        <p className="mt-1 text-sm text-slate-500">Actualizando orden...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Method Selector */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setSelectedMethod("card")}
                                disabled={isLoading}
                                className={`flex items-center justify-center gap-2 rounded-2xl border p-3 text-sm font-bold transition ${
                                    selectedMethod === "card"
                                        ? "border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-100"
                                        : "border-slate-200 text-slate-700 hover:border-slate-300"
                                }`}
                            >
                                <FiCreditCard />
                                Tarjeta
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedMethod("paypal")}
                                disabled={isLoading}
                                className={`flex items-center justify-center gap-2 rounded-2xl border p-3 text-sm font-bold transition ${
                                    selectedMethod === "paypal"
                                        ? "border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-100"
                                        : "border-slate-200 text-slate-700 hover:border-slate-300"
                                }`}
                            >
                                <span className="font-black">P</span>
                                PayPal
                            </button>
                        </div>

                        {selectedMethod === "card" ? (
                            <CreditCardForm
                                cardData={cardData}
                                onChange={handleCardChange}
                                disabled={isLoading}
                                error={error}
                            />
                        ) : (
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
                                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-2xl font-black text-blue-600 mb-3">
                                    P
                                </span>
                                <p className="font-bold text-slate-900">Pago seguro con PayPal</p>
                                <p className="mt-1 text-xs text-slate-500">
                                    Simulación de pago con cuenta de PayPal para la orden #{order._id}.
                                </p>
                            </div>
                        )}

                        {error && selectedMethod !== "card" && (
                            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                                {error}
                            </div>
                        )}

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex w-full min-h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 font-extrabold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <FiLock className="text-sm" />
                                {isLoading ? "Procesando pago..." : `Pagar $${order.total.toFixed(2)}`}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};
