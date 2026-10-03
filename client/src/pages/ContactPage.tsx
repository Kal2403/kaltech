import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
    FiArrowLeft,
    FiCheckCircle,
    FiClock,
    FiHelpCircle,
    FiMail,
    FiMapPin,
    FiMessageSquare,
    FiPhone,
    FiSend,
} from "react-icons/fi";

import { ROUTES } from "../routes/paths";

interface ContactFormData {
    fullName: string;
    email: string;
    phone: string;
    orderNumber: string;
    subject: string;
    message: string;
}

const initialForm: ContactFormData = {
    fullName: "",
    email: "",
    phone: "",
    orderNumber: "",
    subject: "consult",
    message: "",
};

const faqs = [
    {
        question: "¿Cuánto tarda en llegar mi pedido?",
        answer: "Los envíos estándar demoran entre 24 y 48 horas laborables. Si tu pedido supera los $1,000, ¡el envío es totalmente gratuito!",
    },
    {
        question: "¿Cómo puedo solicitar una factura con datos de empresa?",
        answer: "Indícanos tu número de pedido y tus datos fiscales (Razón Social y NIF/CIF o RFC) en el mensaje o a soporte@kaltech.com y te emitiremos la factura oficial en PDF.",
    },
    {
        question: "¿Puedo cancelar o modificar mi pedido?",
        answer: "Sí, siempre y cuando el pedido no haya sido expedido de nuestros almacenes (estado 'Enviado'). Contáctanos con urgencia indicando el número de orden.",
    },
    {
        question: "¿Qué garantía tienen los productos?",
        answer: "Todos los artículos comercializados en KalTech cuentan con 3 años de garantía oficial contra defectos de fábrica.",
    },
];

export const ContactPage = () => {
    const [form, setForm] = useState<ContactFormData>(initialForm);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage(null);

        if (!form.fullName.trim() || !form.email.trim() || !form.message.trim()) {
            setErrorMessage("Por favor, completa los campos requeridos (Nombre, Correo y Mensaje).");
            return;
        }

        setIsSubmitting(true);

        // Simulate sending contact email
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
            setForm(initialForm);
        }, 600);
    };

    return (
        <section className="min-h-screen bg-slate-50 py-12 sm:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Back Link */}
                <div className="mb-6">
                    <Link
                        to={ROUTES.home}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
                    >
                        <FiArrowLeft aria-hidden="true" />
                        <span>Volver al inicio</span>
                    </Link>
                </div>

                {/* Hero Header */}
                <header className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm sm:p-10">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600">
                        <FiMessageSquare aria-hidden="true" />
                    </div>
                    <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                        Contacto y Atención al Cliente
                    </h1>
                    <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
                        ¿Tienes dudas sobre un producto, necesitas asistencia con un pedido o requieres asesoramiento técnico? Nuestro equipo especializado está listo para ayudarte.
                    </p>
                </header>

                <div className="mt-10 grid gap-8 lg:grid-cols-12">
                    {/* Contact Channels (Left Column) */}
                    <aside className="space-y-6 lg:col-span-5">
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
                            <h2 className="text-xl font-bold text-slate-900">Canales de Contacto Directo</h2>
                            <p className="mt-2 text-sm text-slate-500">
                                Puedes comunicarte directamente con nosotros a través de cualquiera de estos medios:
                            </p>

                            <div className="mt-6 space-y-5">
                                <div className="flex items-start gap-4">
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-xl text-blue-600">
                                        <FiMail aria-hidden="true" />
                                    </span>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Correo Electrónico</p>
                                        <a href="mailto:soporte@kaltech.com" className="font-semibold text-slate-900 transition hover:text-blue-600">
                                            soporte@kaltech.com
                                        </a>
                                        <p className="text-xs text-slate-500">Respuesta en menos de 24 horas</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-xl text-emerald-600">
                                        <FiPhone aria-hidden="true" />
                                    </span>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Atención Telefónica</p>
                                        <a href="tel:+34900123456" className="font-semibold text-slate-900 transition hover:text-blue-600">
                                            +34 900 123 456
                                        </a>
                                        <p className="text-xs text-slate-500">Línea gratuita de soporte</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-xl text-amber-600">
                                        <FiClock aria-hidden="true" />
                                    </span>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Horario de Atención</p>
                                        <p className="font-semibold text-slate-900">Lunes a Viernes</p>
                                        <p className="text-xs text-slate-500">09:00 a 19:00 (Zona Horaria GMT+1)</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-xl text-purple-600">
                                        <FiMapPin aria-hidden="true" />
                                    </span>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Oficinas Centrales</p>
                                        <p className="font-semibold text-slate-900">Edificio KalTech, Calle Tecnología 42</p>
                                        <p className="text-xs text-slate-500">28001 Madrid, España</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Tracking Quick Box */}
                        <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm">
                            <h3 className="font-bold text-slate-900">¿Deseas rastrear una compra?</h3>
                            <p className="mt-1 text-sm text-slate-600">
                                Si ya realizaste un pedido, puedes ver su estado actualizado en tiempo real en tu cuenta.
                            </p>
                            <Link
                                to={ROUTES.orders}
                                className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-700"
                            >
                                Ver Mis Pedidos
                            </Link>
                        </div>
                    </aside>

                    {/* Contact Form (Right Column) */}
                    <div className="lg:col-span-7">
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-10">
                            <h2 className="text-xl font-bold text-slate-900">Envíanos un Mensaje</h2>
                            <p className="mt-2 text-sm text-slate-500">
                                Rellena el siguiente formulario y un asesor técnico se pondrá en contacto contigo a la brevedad.
                            </p>

                            {isSuccess ? (
                                <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600">
                                        <FiCheckCircle aria-hidden="true" />
                                    </div>
                                    <h3 className="mt-4 text-xl font-bold text-slate-900">¡Mensaje Enviado con Éxito!</h3>
                                    <p className="mt-2 text-sm text-slate-600">
                                        Hemos recibido tu consulta correctamente. Te responderemos en un plazo máximo de 24 horas a tu correo electrónico.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setIsSuccess(false)}
                                        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-6 text-sm font-bold text-white transition hover:bg-emerald-700"
                                    >
                                        Enviar otro mensaje
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                                    {errorMessage && (
                                        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                                            {errorMessage}
                                        </div>
                                    )}

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label htmlFor="fullName" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                                Nombre Completo <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="fullName"
                                                type="text"
                                                required
                                                value={form.fullName}
                                                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                                placeholder="Ej. Carlos Mendoza"
                                                className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                                Correo Electrónico <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="email"
                                                type="email"
                                                required
                                                value={form.email}
                                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                                placeholder="carlos@ejemplo.com"
                                                className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                                Teléfono de Contacto (opcional)
                                            </label>
                                            <input
                                                id="phone"
                                                type="tel"
                                                value={form.phone}
                                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                                placeholder="+34 600 000 000"
                                                className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="orderNumber" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                                Nº de Pedido (si aplica)
                                            </label>
                                            <input
                                                id="orderNumber"
                                                type="text"
                                                value={form.orderNumber}
                                                onChange={(e) => setForm({ ...form, orderNumber: e.target.value })}
                                                placeholder="Ej. 6abbee..."
                                                className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="subject" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                            Motivo de la Consulta
                                        </label>
                                        <select
                                            id="subject"
                                            value={form.subject}
                                            onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                            className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                        >
                                            <option value="consult">Consulta sobre un producto o stock</option>
                                            <option value="order">Estado o seguimiento de un pedido</option>
                                            <option value="return">Solicitud de cambio o devolución</option>
                                            <option value="warranty">Garantía o asistencia técnica</option>
                                            <option value="billing">Facturación o datos fiscales</option>
                                            <option value="other">Otro asunto</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                            Tu Mensaje <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            id="message"
                                            required
                                            rows={5}
                                            value={form.message}
                                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                                            placeholder="Escribe aquí los detalles de tu consulta..."
                                            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                <span>Enviando mensaje...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FiSend aria-hidden="true" />
                                                <span>Enviar Mensaje</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <section className="mt-16 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm sm:p-12">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-600">
                            <FiHelpCircle aria-hidden="true" />
                        </span>
                        <div>
                            <h2 className="text-2xl font-black text-slate-950">Preguntas Frecuentes</h2>
                            <p className="text-sm text-slate-500">Respuestas rápidas a las consultas más habituales de nuestros clientes.</p>
                        </div>
                    </div>

                    <div className="mt-8 grid gap-6 sm:grid-cols-2">
                        {faqs.map((faq) => (
                            <div key={faq.question} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
                                <h3 className="font-bold text-slate-900">{faq.question}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-600">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </section>
    );
};
