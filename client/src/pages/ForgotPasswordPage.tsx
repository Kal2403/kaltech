import { useState, type FormEvent } from "react";
import { FiArrowLeft, FiArrowRight, FiCheckCircle, FiKey, FiMail } from "react-icons/fi";
import { Link } from "react-router-dom";

import { ROUTES } from "../routes/paths";
import { forgotPassword, getAuthErrorMessage } from "../services/auth/auth.service";

export const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldError, setFieldError] = useState<string | undefined>();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isSubmitting) return;

        const trimmedEmail = email.trim();
        if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
            setFieldError("Ingresa un correo electrónico válido.");
            return;
        }

        setFieldError(undefined);

        try {
            setIsSubmitting(true);
            setError("");
            const message = await forgotPassword(trimmedEmail.toLowerCase());
            setSuccessMessage(
                message ||
                "Si tu correo está registrado en KalTech, recibirás un enlace para restablecer tu contraseña."
            );
        } catch (submitError: unknown) {
            setError(
                getAuthErrorMessage(
                    submitError,
                    "No se pudo procesar la solicitud. Por favor intenta más tarde."
                )
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="min-h-[78vh] bg-gradient-to-br from-blue-50 via-white to-slate-100 px-5 py-12 sm:px-6 sm:py-16">
            <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_30px_90px_-45px_rgba(37,99,235,0.45)] lg:grid-cols-[0.9fr_1.1fr]">
                <div className="hidden bg-[#06172d] p-12 text-white lg:flex lg:flex-col lg:justify-between">
                    <div>
                        <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-400">KALTECH</p>
                        <h2 className="mt-4 text-4xl font-black leading-tight">
                            Recupera el acceso a tu cuenta.
                        </h2>
                        <p className="mt-5 leading-7 text-slate-300">
                            Te enviaremos instrucciones seguras a tu correo para que puedas crear una nueva contraseña y continuar disfrutando de KalTech.
                        </p>
                    </div>
                    <p className="mt-12 text-sm text-slate-400">
                        Proceso protegido mediante tokens criptográficos de un solo uso.
                    </p>
                </div>
                <div className="p-7 sm:p-12">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white shadow-lg shadow-blue-600/25">
                        <FiKey aria-hidden="true" />
                    </span>
                    <p className="mt-7 text-sm font-black uppercase tracking-[0.18em] text-blue-600">Seguridad</p>
                    <h1 className="mt-2 text-3xl font-black text-slate-950">¿Olvidaste tu contraseña?</h1>
                    <p className="mt-3 text-slate-600">
                        Ingresa el correo electrónico asociado a tu cuenta y te enviaremos un enlace de recuperación.
                    </p>

                    {successMessage ? (
                        <div className="mt-8 space-y-6">
                            <div
                                role="status"
                                className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900"
                            >
                                <div className="flex items-start gap-3">
                                    <FiCheckCircle className="mt-0.5 shrink-0 text-xl text-emerald-600" aria-hidden="true" />
                                    <div>
                                        <h3 className="font-bold">Revisa tu bandeja de entrada</h3>
                                        <p className="mt-1 text-sm text-emerald-800 leading-relaxed">
                                            {successMessage}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                ¿No recibiste el correo? Revisa tu carpeta de spam o correo no deseado. Si aún no lo recibes después de unos minutos, puedes intentar nuevamente.
                            </p>
                            <Link
                                to={ROUTES.login}
                                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 font-extrabold text-white shadow-md transition hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                            >
                                <FiArrowLeft aria-hidden="true" /> Volver a Iniciar Sesión
                            </Link>
                        </div>
                    ) : (
                        <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
                            {error && (
                                <div
                                    role="alert"
                                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
                                >
                                    {error}
                                </div>
                            )}

                            <div>
                                <label htmlFor="forgot-email" className="mb-2 block text-sm font-bold text-slate-800">
                                    Correo electrónico
                                </label>
                                <div className="relative">
                                    <FiMail
                                        aria-hidden="true"
                                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    />
                                    <input
                                        id="forgot-email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        aria-invalid={Boolean(fieldError)}
                                        aria-describedby={fieldError ? "forgot-email-error" : undefined}
                                        value={email}
                                        onChange={(event) => {
                                            setEmail(event.target.value);
                                            setFieldError(undefined);
                                        }}
                                        className="min-h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-slate-950 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
                                        placeholder="nombre@correo.com"
                                    />
                                </div>
                                {fieldError && (
                                    <p id="forgot-email-error" className="mt-2 text-sm font-semibold text-red-700">
                                        {fieldError}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || !email.trim()}
                                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 font-extrabold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmitting ? (
                                    "Enviando instrucciones…"
                                ) : (
                                    <>
                                        Enviar enlace de recuperación <FiArrowRight aria-hidden="true" />
                                    </>
                                )}
                            </button>

                            <div className="pt-2 text-center">
                                <Link
                                    to={ROUTES.login}
                                    className="inline-flex items-center gap-1.5 text-sm font-extrabold text-slate-600 hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                >
                                    <FiArrowLeft aria-hidden="true" /> Regresar al inicio de sesión
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
};
