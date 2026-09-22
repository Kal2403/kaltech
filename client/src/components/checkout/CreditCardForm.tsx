import { useId } from "react";
import { FiCheckCircle, FiCreditCard, FiLock, FiZap } from "react-icons/fi";
import type { CardPaymentData } from "../../types/order.types";

interface CreditCardFormProps {
    cardData: CardPaymentData;
    onChange: (field: keyof CardPaymentData, value: string) => void;
    disabled?: boolean;
    error?: string | null;
}

const detectBrand = (number: string): "visa" | "mastercard" | "amex" | "generic" => {
    const cleaned = number.replace(/\D/g, "");
    if (/^4/.test(cleaned)) return "visa";
    if (/^(5[1-5]|2[2-7])/.test(cleaned)) return "mastercard";
    if (/^3[47]/.test(cleaned)) return "amex";
    return "generic";
};

const formatCardNumber = (value: string): string => {
    const cleaned = value.replace(/\D/g, "").slice(0, 19);
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(" ") : cleaned;
};

const formatExpiry = (value: string): string => {
    const cleaned = value.replace(/\D/g, "").slice(0, 4);
    if (cleaned.length >= 3) {
        return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    return cleaned;
};

export const CreditCardForm = ({
    cardData,
    onChange,
    disabled = false,
    error,
}: CreditCardFormProps) => {
    const nameId = useId();
    const numberId = useId();
    const expiryId = useId();
    const cvvId = useId();

    const brand = detectBrand(cardData.cardNumber);

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCardNumber(e.target.value);
        onChange("cardNumber", formatted);
    };

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatExpiry(e.target.value);
        const [month = "", year = ""] = formatted.split("/");
        onChange("expiryMonth", month);
        onChange("expiryYear", year);
    };

    const handleFillTestCard = (type: "visa" | "mastercard") => {
        const nextYear = (new Date().getFullYear() + 2).toString().slice(-2);
        if (type === "visa") {
            onChange("cardHolder", "Cliente KalTech");
            onChange("cardNumber", "4242 4242 4242 4242");
            onChange("expiryMonth", "12");
            onChange("expiryYear", nextYear);
            onChange("cvv", "123");
        } else {
            onChange("cardHolder", "Cliente KalTech");
            onChange("cardNumber", "5555 5555 5555 4444");
            onChange("expiryMonth", "10");
            onChange("expiryYear", nextYear);
            onChange("cvv", "456");
        }
    };

    const expiryDisplay = cardData.expiryMonth
        ? cardData.expiryYear
            ? `${cardData.expiryMonth}/${cardData.expiryYear}`
            : cardData.expiryMonth
        : "";

    return (
        <div className="mt-4 space-y-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-5 sm:p-6">
            {/* Visual Card Preview */}
            <div className="relative mx-auto max-w-sm overflow-hidden rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-blue-950 p-5 text-white shadow-xl shadow-slate-900/20 sm:p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-7 w-10 rounded-md bg-gradient-to-tr from-amber-400 to-yellow-200 shadow-inner" />
                        <span className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-slate-400">
                            KalTech Pay
                        </span>
                    </div>
                    <div className="text-right">
                        {brand === "visa" && (
                            <span className="text-lg font-black italic tracking-tighter text-blue-400">VISA</span>
                        )}
                        {brand === "mastercard" && (
                            <div className="flex items-center">
                                <div className="h-5 w-5 rounded-full bg-red-500 opacity-90" />
                                <div className="-ml-2 h-5 w-5 rounded-full bg-amber-400 opacity-90" />
                            </div>
                        )}
                        {brand === "amex" && (
                            <span className="text-xs font-black uppercase tracking-wider text-blue-300">AMEX</span>
                        )}
                        {brand === "generic" && (
                            <FiCreditCard className="text-xl text-slate-400" />
                        )}
                    </div>
                </div>

                <div className="my-6">
                    <p className="font-mono text-lg font-semibold tracking-widest sm:text-xl">
                        {cardData.cardNumber || "•••• •••• •••• ••••"}
                    </p>
                </div>

                <div className="flex items-end justify-between text-xs uppercase text-slate-300">
                    <div>
                        <span className="block text-[0.6rem] text-slate-400">Titular</span>
                        <span className="block font-bold tracking-wider truncate max-w-[180px]">
                            {cardData.cardHolder || "NOMBRE DEL TITULAR"}
                        </span>
                    </div>
                    <div className="text-right">
                        <span className="block text-[0.6rem] text-slate-400">Vence</span>
                        <span className="block font-mono font-bold tracking-wider">
                            {expiryDisplay || "MM/AA"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Test Card Quick Fill Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-2.5 text-xs text-blue-900">
                <div className="flex items-center gap-2">
                    <FiZap className="text-sm text-blue-600 shrink-0" />
                    <span>Datos de prueba (Sandbox):</span>
                </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => handleFillTestCard("visa")}
                        disabled={disabled}
                        className="rounded-lg border border-blue-300 bg-white px-2.5 py-1 font-bold text-blue-700 hover:bg-blue-100 transition focus-visible:outline-2 focus-visible:outline-blue-600"
                    >
                        Probar Visa
                    </button>
                    <button
                        type="button"
                        onClick={() => handleFillTestCard("mastercard")}
                        disabled={disabled}
                        className="rounded-lg border border-blue-300 bg-white px-2.5 py-1 font-bold text-blue-700 hover:bg-blue-100 transition focus-visible:outline-2 focus-visible:outline-blue-600"
                    >
                        Probar Mastercard
                    </button>
                </div>
            </div>

            {error && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                    {error}
                </div>
            )}

            {/* Input Fields */}
            <div className="grid gap-4">
                <div>
                    <label htmlFor={nameId} className="block text-xs font-bold uppercase text-slate-700">
                        Nombre en la tarjeta
                    </label>
                    <input
                        id={nameId}
                        type="text"
                        autoComplete="cc-name"
                        value={cardData.cardHolder}
                        onChange={(e) => onChange("cardHolder", e.target.value)}
                        disabled={disabled}
                        placeholder="Ej. Juan Pérez"
                        className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                        required
                    />
                </div>

                <div>
                    <div className="flex items-center justify-between">
                        <label htmlFor={numberId} className="block text-xs font-bold uppercase text-slate-700">
                            Número de tarjeta
                        </label>
                        <span className="text-[0.65rem] font-bold uppercase text-slate-400">
                            {brand !== "generic" ? brand.toUpperCase() : "Aceptamos Visa, MC, Amex"}
                        </span>
                    </div>
                    <div className="relative mt-1.5">
                        <input
                            id={numberId}
                            type="text"
                            inputMode="numeric"
                            autoComplete="cc-number"
                            value={cardData.cardNumber}
                            onChange={handleNumberChange}
                            disabled={disabled}
                            placeholder="1234 5678 9012 3456"
                            className="w-full rounded-xl border border-slate-300 bg-white pl-3.5 pr-10 py-2.5 font-mono text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                            required
                        />
                        <FiLock className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor={expiryId} className="block text-xs font-bold uppercase text-slate-700">
                            Vencimiento
                        </label>
                        <input
                            id={expiryId}
                            type="text"
                            inputMode="numeric"
                            autoComplete="cc-exp"
                            value={expiryDisplay}
                            onChange={handleExpiryChange}
                            disabled={disabled}
                            placeholder="MM/AA"
                            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                            required
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor={cvvId} className="block text-xs font-bold uppercase text-slate-700">
                                CVV / CVC
                            </label>
                            <span className="text-[0.65rem] text-slate-400">3 o 4 dígitos</span>
                        </div>
                        <input
                            id={cvvId}
                            type="password"
                            inputMode="numeric"
                            autoComplete="cc-csc"
                            maxLength={4}
                            value={cardData.cvv}
                            onChange={(e) => onChange("cvv", e.target.value.replace(/\D/g, "").slice(0, 4))}
                            disabled={disabled}
                            placeholder="•••"
                            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                            required
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 pt-1 text-[0.7rem] text-slate-500">
                <FiCheckCircle className="text-emerald-500 shrink-0" />
                <span>Transacción cifrada de 256 bits. Tus datos están protegidos contra fraude.</span>
            </div>
        </div>
    );
};
