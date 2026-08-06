import { createContext } from "react";

import type {
    AuthUser,
    LoginCredentials,
    RegisterData,
} from "../types/auth.types";

export interface AuthContextValue {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isInitializing: boolean;
    sessionExpired: boolean;
    login: (credentials: LoginCredentials) => Promise<AuthUser>;
    register: (registration: RegisterData) => Promise<AuthUser>;
    logout: () => void;
    clearSessionNotice: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
