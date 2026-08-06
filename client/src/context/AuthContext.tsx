import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

import {
    getMe,
    login as loginRequest,
    register as registerRequest,
} from "../services/auth/auth.service";
import type {
    AuthUser,
    LoginCredentials,
    RegisterData,
} from "../types/auth.types";
import {
    AUTH_SESSION_CLEARED_EVENT,
    storage,
} from "../utils/storage";
import { AuthContext, type AuthContextValue } from "./auth-context";

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isInitializing, setIsInitializing] = useState(
        () => Boolean(storage.getToken())
    );
    const [sessionExpired, setSessionExpired] = useState(false);

    const logout = useCallback(() => {
        storage.removeToken();
        setUser(null);
        setIsInitializing(false);
        setSessionExpired(false);
    }, []);

    const clearSessionNotice = useCallback(() => setSessionExpired(false), []);

    useEffect(() => {
        const handleSessionCleared = () => {
            setUser(null);
            setIsInitializing(false);
            setSessionExpired(true);
        };

        window.addEventListener(
            AUTH_SESSION_CLEARED_EVENT,
            handleSessionCleared
        );

        const token = storage.getToken();
        if (!token) {
            return () => {
                window.removeEventListener(
                    AUTH_SESSION_CLEARED_EVENT,
                    handleSessionCleared
                );
            };
        }

        const controller = new AbortController();

        void getMe(controller.signal)
            .then(setUser)
            .catch(() => {
                // A 401 is handled by the interceptor. Transient network errors
                // keep the token so the session can recover on the next load.
            })
            .finally(() => {
                if (!controller.signal.aborted) setIsInitializing(false);
            });

        return () => {
            controller.abort();
            window.removeEventListener(
                AUTH_SESSION_CLEARED_EVENT,
                handleSessionCleared
            );
        };
    }, []);

    const login = useCallback(async (credentials: LoginCredentials) => {
        const session = await loginRequest(credentials);
        storage.setToken(session.token);
        setUser(session.user);
        setSessionExpired(false);
        return session.user;
    }, []);

    const register = useCallback(async (registration: RegisterData) => {
        const session = await registerRequest(registration);
        storage.setToken(session.token);
        setUser(session.user);
        setSessionExpired(false);
        return session.user;
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            isAuthenticated: Boolean(user),
            isInitializing,
            sessionExpired,
            login,
            register,
            logout,
            clearSessionNotice,
        }),
        [clearSessionNotice, isInitializing, login, logout, register, sessionExpired, user]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
