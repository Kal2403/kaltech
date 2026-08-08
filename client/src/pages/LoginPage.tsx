import { useState, type FormEvent } from "react";
import { FiArrowRight, FiLock, FiMail } from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "../routes/paths";
import { getAuthErrorMessage } from "../services/auth/auth.service";

const getSafeDestination = (state: unknown): string | null => {
    if (!state || typeof state !== "object" || !("from" in state)) return null;
    const from = (state as { from?: unknown }).from;
    return typeof from === "string" && from.startsWith("/") && !from.startsWith("//")
        ? from
        : null;
};

export const LoginPage = () => {
    const { login, sessionExpired, clearSessionNotice } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isSubmitting) return;
        const nextErrors: { email?: string; password?: string } = {};
        if (!/^\S+@\S+\.\S+$/.test(email.trim())) nextErrors.email = "Ingresa un correo electrónico válido.";
        if (password.length < 8) nextErrors.password = "La contraseña debe tener al menos 8 caracteres.";
        setFieldErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        try {
            setIsSubmitting(true);
            setError("");
            clearSessionNotice();
            const user = await login({ email: email.trim().toLowerCase(), password });
            const requestedDestination = getSafeDestination(location.state);
            navigate(
                requestedDestination ?? (user.role === "admin" ? ROUTES.admin : ROUTES.home),
                { replace: true }
            );
        } catch (submitError: unknown) {
            setError(getAuthErrorMessage(submitError, "No se pudo iniciar sesión."));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="min-h-[78vh] bg-gradient-to-br from-blue-50 via-white to-slate-100 px-5 py-12 sm:px-6 sm:py-16">
            <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_30px_90px_-45px_rgba(37,99,235,0.45)] lg:grid-cols-[0.9fr_1.1fr]">
                <div className="hidden bg-[#06172d] p-12 text-white lg:flex lg:flex-col lg:justify-between">
                    <div><p className="text-sm font-black uppercase tracking-[0.2em] text-blue-400">KALTECH</p><h2 className="mt-4 text-4xl font-black leading-tight">Tu tecnología, tus compras, un solo lugar.</h2><p className="mt-5 leading-7 text-slate-300">Accede a tu carrito, completa pedidos y consulta el estado de tus órdenes.</p></div>
                    <p className="mt-12 text-sm text-slate-400">Sesión protegida mediante autenticación JWT.</p>
                </div>
                <div className="p-7 sm:p-12">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white shadow-lg shadow-blue-600/25"><FiLock aria-hidden="true" /></span>
                    <p className="mt-7 text-sm font-black uppercase tracking-[0.18em] text-blue-600">Mi cuenta</p>
                    <h1 className="mt-2 text-3xl font-black text-slate-950">Inicia sesión</h1>
                    <p className="mt-3 text-slate-600">Continúa donde lo dejaste en KalTech.</p>

                    <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
                        {sessionExpired && <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">Tu sesión expiró. Inicia sesión nuevamente para continuar.</div>}
                        {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
                        <div><label htmlFor="login-email" className="mb-2 block text-sm font-bold text-slate-800">Correo electrónico</label><div className="relative"><FiMail aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input id="login-email" type="email" autoComplete="email" required aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? "login-email-error" : undefined} value={email} onChange={(event) => { setEmail(event.target.value); setFieldErrors((current) => ({ ...current, email: undefined })); }} className="min-h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-slate-950 placeholder:text-slate-400 focus:border-blue-600" placeholder="nombre@correo.com" /></div>{fieldErrors.email && <p id="login-email-error" className="mt-2 text-sm font-semibold text-red-700">{fieldErrors.email}</p>}</div>
                        <div><label htmlFor="login-password" className="mb-2 block text-sm font-bold text-slate-800">Contraseña</label><input id="login-password" type="password" autoComplete="current-password" required minLength={8} aria-invalid={Boolean(fieldErrors.password)} aria-describedby={fieldErrors.password ? "login-password-error" : undefined} value={password} onChange={(event) => { setPassword(event.target.value); setFieldErrors((current) => ({ ...current, password: undefined })); }} className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-950 focus:border-blue-600" />{fieldErrors.password && <p id="login-password-error" className="mt-2 text-sm font-semibold text-red-700">{fieldErrors.password}</p>}</div>
                        <button type="submit" disabled={isSubmitting || !email.trim() || password.length < 8} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 font-extrabold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? "Iniciando sesión…" : <>Acceder <FiArrowRight aria-hidden="true" /></>}</button>
                    </form>
                    <p className="mt-7 text-center text-sm text-slate-600">¿Aún no tienes cuenta? <Link to={ROUTES.register} state={location.state} className="inline-flex min-h-11 items-center rounded-md px-2 font-extrabold text-blue-600 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Regístrate</Link></p>
                </div>
            </div>
        </section>
    );
};
