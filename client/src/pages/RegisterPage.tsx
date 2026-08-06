import { useState, type FormEvent } from "react";
import { FiArrowRight, FiMail, FiUser, FiUserPlus } from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "../routes/paths";
import { getAuthErrorMessage } from "../services/auth/auth.service";

export const RegisterPage = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string }>({});

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const nextErrors: typeof fieldErrors = {};
        if (name.trim().length < 2 || name.trim().length > 80) nextErrors.name = "El nombre debe tener entre 2 y 80 caracteres.";
        if (!/^\S+@\S+\.\S+$/.test(email.trim())) nextErrors.email = "Ingresa un correo electrónico válido.";
        if (password.length < 8 || password.length > 128) nextErrors.password = "La contraseña debe tener entre 8 y 128 caracteres.";
        setFieldErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        try {
            setIsSubmitting(true);
            setError("");
            await register({ name: name.trim(), email: email.trim().toLowerCase(), password });
            const state = location.state;
            const from = state && typeof state === "object" && "from" in state ? (state as { from?: unknown }).from : null;
            const destination = typeof from === "string" && from.startsWith("/") && !from.startsWith("//") ? from : ROUTES.home;
            navigate(destination, { replace: true });
        } catch (submitError: unknown) {
            setError(getAuthErrorMessage(submitError, "No se pudo crear la cuenta."));
        } finally {
            setIsSubmitting(false);
        }
    };

    const isInvalid = name.trim().length < 2 || !email.trim() || password.length < 8;

    return (
        <section className="min-h-[78vh] bg-gradient-to-br from-blue-50 via-white to-slate-100 px-5 py-12 sm:px-6 sm:py-16">
            <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_30px_90px_-45px_rgba(37,99,235,0.45)] sm:p-12">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white shadow-lg shadow-blue-600/25"><FiUserPlus aria-hidden="true" /></span>
                <p className="mt-7 text-sm font-black uppercase tracking-[0.18em] text-blue-600">Nueva cuenta</p>
                <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Únete a KalTech</h1>
                <p className="mt-3 text-slate-600">Guarda tu carrito y consulta todas tus órdenes.</p>
                <form className="mt-8 grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit} noValidate>
                    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 sm:col-span-2">{error}</div>}
                    <div className="sm:col-span-2"><label htmlFor="register-name" className="mb-2 block text-sm font-bold text-slate-800">Nombre completo</label><div className="relative"><FiUser aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input id="register-name" autoComplete="name" required minLength={2} maxLength={80} aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? "register-name-error" : undefined} value={name} onChange={(event) => { setName(event.target.value); setFieldErrors((current) => ({ ...current, name: undefined })); }} className="min-h-12 w-full rounded-xl border border-slate-300 pl-11 pr-4 text-slate-950 focus:border-blue-600" /></div>{fieldErrors.name && <p id="register-name-error" className="mt-2 text-sm font-semibold text-red-700">{fieldErrors.name}</p>}</div>
                    <div className="sm:col-span-2"><label htmlFor="register-email" className="mb-2 block text-sm font-bold text-slate-800">Correo electrónico</label><div className="relative"><FiMail aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input id="register-email" type="email" autoComplete="email" required aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? "register-email-error" : undefined} value={email} onChange={(event) => { setEmail(event.target.value); setFieldErrors((current) => ({ ...current, email: undefined })); }} className="min-h-12 w-full rounded-xl border border-slate-300 pl-11 pr-4 text-slate-950 focus:border-blue-600" /></div>{fieldErrors.email && <p id="register-email-error" className="mt-2 text-sm font-semibold text-red-700">{fieldErrors.email}</p>}</div>
                    <div className="sm:col-span-2"><label htmlFor="register-password" className="mb-2 block text-sm font-bold text-slate-800">Contraseña</label><input id="register-password" type="password" autoComplete="new-password" required minLength={8} maxLength={128} aria-invalid={Boolean(fieldErrors.password)} aria-describedby="register-password-help register-password-error" value={password} onChange={(event) => { setPassword(event.target.value); setFieldErrors((current) => ({ ...current, password: undefined })); }} className="min-h-12 w-full rounded-xl border border-slate-300 px-4 text-slate-950 focus:border-blue-600" /><p id="register-password-help" className="mt-2 text-xs text-slate-500">Entre 8 y 128 caracteres.</p>{fieldErrors.password && <p id="register-password-error" className="mt-2 text-sm font-semibold text-red-700">{fieldErrors.password}</p>}</div>
                    <button type="submit" disabled={isSubmitting || isInvalid} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 font-extrabold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2">{isSubmitting ? "Creando cuenta…" : <>Crear cuenta <FiArrowRight aria-hidden="true" /></>}</button>
                </form>
                <p className="mt-7 text-center text-sm text-slate-600">¿Ya tienes cuenta? <Link to={ROUTES.login} state={location.state} className="font-extrabold text-blue-600 hover:text-blue-700">Inicia sesión</Link></p>
            </div>
        </section>
    );
};
