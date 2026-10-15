import { useEffect, useState } from "react";
import { FiAlertCircle, FiInfo } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { ROUTES } from "../../routes/paths";
import {
    getAuthErrorMessage,
    getSocialAuthConfig,
} from "../../services/auth/auth.service";
import type { AuthUser } from "../../types/auth.types";

declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: {
                        client_id: string;
                        callback: (response: { credential: string }) => void;
                        auto_select?: boolean;
                        cancel_on_tap_outside?: boolean;
                    }) => void;
                    prompt: (notification?: (notification: unknown) => void) => void;
                    renderButton: (
                        parent: HTMLElement,
                        options: Record<string, unknown>
                    ) => void;
                };
            };
        };
        FB?: {
            init: (options: {
                appId: string;
                cookie: boolean;
                xfbml: boolean;
                version: string;
            }) => void;
            login: (
                callback: (response: {
                    authResponse?: {
                        accessToken: string;
                        userID: string;
                    };
                    status: string;
                }) => void,
                options?: { scope: string }
            ) => void;
        };
        fbAsyncInit?: () => void;
    }
}

interface SocialAuthButtonsProps {
    onSuccess?: (user: AuthUser) => void;
}

export const SocialAuthButtons = ({ onSuccess }: SocialAuthButtonsProps) => {
    const { loginWithGoogle, loginWithFacebook } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
    const [isLoadingFacebook, setIsLoadingFacebook] = useState(false);
    const [socialError, setSocialError] = useState("");
    const [infoMessage, setInfoMessage] = useState("");
    const [serverConfig, setServerConfig] = useState<{
        googleClientId: string | null;
        facebookAppId: string | null;
    }>({
        googleClientId: null,
        facebookAppId: null,
    });

    const googleClientId =
        import.meta.env.VITE_GOOGLE_CLIENT_ID || serverConfig.googleClientId;
    const facebookAppId =
        import.meta.env.VITE_FACEBOOK_APP_ID || serverConfig.facebookAppId;

    useEffect(() => {
        let isMounted = true;
        getSocialAuthConfig()
            .then((config) => {
                if (isMounted) setServerConfig(config);
            })
            .catch(() => {
                // If endpoint fails, fallback to Vite env vars
            });
        return () => {
            isMounted = false;
        };
    }, []);

    // Load Google Identity Services script
    useEffect(() => {
        if (!googleClientId) return;

        const scriptId = "google-jssdk";
        if (!document.getElementById(scriptId)) {
            const script = document.createElement("script");
            script.id = scriptId;
            script.src = "https://accounts.google.com/gsi/client";
            script.async = true;
            script.defer = true;
            document.body.appendChild(script);
        }
    }, [googleClientId]);

    // Load Facebook SDK script
    useEffect(() => {
        if (!facebookAppId) return;

        const scriptId = "facebook-jssdk";
        if (!document.getElementById(scriptId)) {
            window.fbAsyncInit = () => {
                window.FB?.init({
                    appId: facebookAppId,
                    cookie: true,
                    xfbml: true,
                    version: "v20.0",
                });
            };

            const script = document.createElement("script");
            script.id = scriptId;
            script.src = "https://connect.facebook.net/es_LA/sdk.js";
            script.async = true;
            script.defer = true;
            document.body.appendChild(script);
        }
    }, [facebookAppId]);

    const handleSuccessRedirect = (user: AuthUser) => {
        if (onSuccess) {
            onSuccess(user);
            return;
        }

        const state = location.state;
        const from =
            state && typeof state === "object" && "from" in state
                ? (state as { from?: unknown }).from
                : null;
        const destination =
            typeof from === "string" && from.startsWith("/") && !from.startsWith("//")
                ? from
                : user.role === "admin"
                  ? ROUTES.admin
                  : ROUTES.home;

        navigate(destination, { replace: true });
    };

    const handleGoogleLogin = async () => {
        setSocialError("");
        setInfoMessage("");

        if (!googleClientId) {
            setInfoMessage(
                "Para iniciar sesión con Google en producción, configura VITE_GOOGLE_CLIENT_ID en tu archivo .env o en el panel de Google Cloud Console. Consulta docs/SOCIAL_AUTH.md para la guía completa."
            );
            return;
        }

        if (!window.google?.accounts?.id) {
            setSocialError(
                "El servicio de Google aún se está cargando. Intenta de nuevo en unos segundos."
            );
            return;
        }

        try {
            setIsLoadingGoogle(true);

            await new Promise<void>((resolve, reject) => {
                window.google!.accounts.id.initialize({
                    client_id: googleClientId,
                    callback: async (response) => {
                        try {
                            if (!response.credential) {
                                throw new Error("No se recibió credencial de Google.");
                            }
                            const user = await loginWithGoogle(response.credential);
                            resolve();
                            handleSuccessRedirect(user);
                        } catch (err) {
                            reject(err);
                        }
                    },
                });

                window.google!.accounts.id.prompt((notification: unknown) => {
                    const status = (notification as { isNotDisplayed?: () => boolean })
                        ?.isNotDisplayed?.();
                    if (status) {
                        setIsLoadingGoogle(false);
                    }
                });
            });
        } catch (error) {
            setSocialError(
                getAuthErrorMessage(
                    error,
                    "No se pudo completar el inicio de sesión con Google."
                )
            );
        } finally {
            setIsLoadingGoogle(false);
        }
    };

    const handleFacebookLogin = async () => {
        setSocialError("");
        setInfoMessage("");

        if (!facebookAppId) {
            setInfoMessage(
                "Para iniciar sesión con Facebook en producción, configura VITE_FACEBOOK_APP_ID en tu archivo .env o en Meta for Developers. Consulta docs/SOCIAL_AUTH.md para la guía paso a paso."
            );
            return;
        }

        if (!window.FB) {
            setSocialError(
                "El SDK de Facebook aún se está cargando. Intenta de nuevo en unos segundos."
            );
            return;
        }

        try {
            setIsLoadingFacebook(true);

            window.FB.login(
                async (response) => {
                    if (response.authResponse?.accessToken) {
                        try {
                            const user = await loginWithFacebook(
                                response.authResponse.accessToken
                            );
                            handleSuccessRedirect(user);
                        } catch (err) {
                            setSocialError(
                                getAuthErrorMessage(
                                    err,
                                    "No se pudo iniciar sesión con Facebook."
                                )
                            );
                        } finally {
                            setIsLoadingFacebook(false);
                        }
                    } else {
                        setIsLoadingFacebook(false);
                        // User cancelled or didn't authorize
                    }
                },
                { scope: "public_profile,email" }
            );
        } catch (error) {
            setIsLoadingFacebook(false);
            setSocialError(
                getAuthErrorMessage(
                    error,
                    "Error al inicializar la autenticación con Facebook."
                )
            );
        }
    };

    return (
        <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                    o continúa con
                </span>
                <div className="h-px flex-1 bg-slate-200" />
            </div>

            {socialError && (
                <div
                    role="alert"
                    className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700"
                >
                    <FiAlertCircle className="mt-0.5 shrink-0 text-base" />
                    <span>{socialError}</span>
                </div>
            )}

            {infoMessage && (
                <div
                    role="status"
                    className="flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm font-medium text-blue-900"
                >
                    <FiInfo className="mt-0.5 shrink-0 text-base text-blue-600" />
                    <span>{infoMessage}</span>
                </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Google Button */}
                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isLoadingGoogle || isLoadingFacebook}
                    className="flex min-h-12 items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {/* Google Multicolor Logo */}
                    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                            fill="#4285F4"
                            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                        />
                    </svg>
                    <span>
                        {isLoadingGoogle ? "Conectando…" : "Google"}
                    </span>
                </button>

                {/* Facebook Button */}
                <button
                    type="button"
                    onClick={handleFacebookLogin}
                    disabled={isLoadingGoogle || isLoadingFacebook}
                    className="flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[#1877F2] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#166fe5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1877F2] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {/* Facebook Official Icon */}
                    <svg className="h-5 w-5 shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span>
                        {isLoadingFacebook ? "Conectando…" : "Facebook"}
                    </span>
                </button>
            </div>
        </div>
    );
};
