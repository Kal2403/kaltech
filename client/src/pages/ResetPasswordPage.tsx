import { useState, type FormEvent } from "react";
import { FiArrowRight, FiCheckCircle, FiLock, FiShield } from "react-icons/fi";
import { Link, useNavigate, useParams } from "react-router-dom";

import { ROUTES } from "../routes/paths";
import { getAuthErrorMessage, resetPassword } from "../services/auth/auth.service";

export const ResetPasswordPage = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<{
        password?: string;
        confirmPassword?: string;
    }>({});

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isSubmitting) return;

        if (!token) {
            setError("El enlace de recuperación es inválido o no incluye el token necesario.");
            return;
        }

        const nextErrors: { password?: string; confirmPassword?: string } = {};

        if (password.length < 8) {
            nextErrors.password = "La contraseña debe tener al menos 8 caracteres.";
        } else if (new TextEncoder().encode(password).length > 72) {
            nextErrors.password = "La contraseña es demasiado larga. Usa menos caracteres.";
        }

        if (password !== confirmPassword) {
            nextErrors.confirmPassword = "Las contraseñas no coinciden.";
        }

        setFieldErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        try {
            setIsSubmitting(true);
            setError("");
            await resetPassword(token, password);
            setIsSuccess(true);
        } catch (submitError: unknown) {
            setError(
                getAuthErrorMessage(
                    submitError,
                    "No se pudo restablecer la contraseña. El enlace puede haber expirado."
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
                            Crea tu nueva contraseña.
                        </h2>
                        <p className="mt-5 leading-7 text-slate-300">
                            Elige una contraseña robusta con al menos 8 caracteres para asegurar la protección de tu cuenta y pedidos.
                        </p>
                    </div>
                    <p className="mt-12 text-sm text-slate-400">
                        Tu nueva clave se encriptará de forma segura con algoritmos de última generación.
                    </p>
                </div>
                <div className="p-7 sm:p-12">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white shadow-lg shadow-blue-600/25">
                        <FiShield aria-hidden="true" />
                    </span>
                    <p className="mt-7 text-sm font-black uppercase tracking-[0.18em] text-blue-600">Seguridad</p>
                    <h1 className="mt-2 text-3xl font-black text-slate-950">Restablecer contraseña</h1>
                    <p className="mt-3 text-slate-600">
                        Ingresa y confirma tu nueva clave de acceso para continuar.
                    </p>

                    {isSuccess ? (
                        <div className="mt-8 space-y-6">
                            <div
                                role="status"
                                className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900"
                            >
                                <div className="flex items-start gap-3">
                                    <FiCheckCircle className="mt-0.5 shrink-0 text-xl text-emerald-600" aria-hidden="true" />
                                    <div>
                                        <h3 className="font-bold">¡Contraseña actualizada con éxito!</h3>
                                        <p className="mt-1 text-sm text-emerald-800 leading-relaxed">
                                            Tu contraseña ha sido cambiada correctamente. Ya puedes ingresar a tu cuenta con tus nuevas credenciales.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => navigate(ROUTES.login, { replace: true })}
                                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 font-extrabold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                            >
                                Iniciar sesión ahora <FiArrowRight aria-hidden="true" />
                            </button>
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
                                <label
                                    htmlFor="new-password"
                                    className="mb-2 block text-sm font-bold text-slate-800"
                                >
                                    Nueva contraseña
                                </label>
                                <div className="relative">
                                    <FiLock
                                        aria-hidden="true"
                                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    />
                                    <input
                                        id="new-password"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        minLength={8}
                                        aria-invalid={Boolean(fieldErrors.password)}
                                        aria-describedby={
                                            fieldErrors.password ? "new-password-error" : undefined
                                        }
                                        value={password}
                                        onChange={(event) => {
                                            setPassword(event.target.value);
                                            setFieldErrors((current) => ({ ...current, password: undefined }));
                                        }}
                                        className="min-h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-slate-950 focus:border-blue-600 focus:outline-none"
                                        placeholder="Mínimo 8 caracteres"
                                    />
                                </div>
                                {fieldErrors.password && (
                                    <p id="new-password-error" className="mt-2 text-sm font-semibold text-red-700">
                                        {fieldErrors.password}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="confirm-new-password"
                                    className="mb-2 block text-sm font-bold text-slate-800"
                                >
                                    Confirmar nueva contraseña
                                </label>
                                <div className="relative">
                                    <FiLock
                                        aria-hidden="true"
                                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    />
                                    <input
                                        id="confirm-new-password"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        minLength={8}
                                        aria-invalid={Boolean(fieldErrors.confirmPassword)}
                                        aria-describedby={
                                            fieldErrors.confirmPassword
                                                ? "confirm-new-password-error"
                                                : undefined
                                        }
                                        value={confirmPassword}
                                        onChange={(event) => {
                                            setConfirmPassword(event.target.value);
                                            setFieldErrors((current) => ({
                                                ...current,
                                                confirmPassword: undefined,
                                            }));
                                        }}
                                        className="min-h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-slate-950 focus:border-blue-600 focus:outline-none"
                                        placeholder="Repite tu nueva contraseña"
                                    />
                                </div>
                                {fieldErrors.confirmPassword && (
                                    <p
                                        id="confirm-new-password-error"
                                        className="mt-2 text-sm font-semibold text-red-700"
                                    >
                                        {fieldErrors.confirmPassword}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || password.length < 8 || !confirmPassword}
                                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 font-extrabold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmitting ? (
                                    "Actualizando contraseña…"
                                ) : (
                                    <>
                                        Guardar nueva contraseña <FiArrowRight aria-hidden="true" />
                                    </>
                                )}
                            </button>

                            <div className="pt-2 text-center">
                                <Link
                                    to={ROUTES.login}
                                    className="text-sm font-extrabold text-slate-600 hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                >
                                    Volver al inicio de sesión
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
};
