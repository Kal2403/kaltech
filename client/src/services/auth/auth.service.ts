import axios from "axios";

import { api } from "../../api/axios";
import type {
    AuthSession,
    AuthUser,
    LoginCredentials,
    RegisterData,
} from "../../types/auth.types";

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

interface ApiErrorResponse {
    message?: string;
}

export const login = async (
    credentials: LoginCredentials
): Promise<AuthSession> => {
    const { data } = await api.post<ApiResponse<AuthSession>>(
        "/auth/login",
        credentials
    );

    return data.data;
};

export const register = async (
    registration: RegisterData
): Promise<AuthSession> => {
    const { data } = await api.post<ApiResponse<AuthSession>>(
        "/auth/register",
        registration
    );

    return data.data;
};

export const getMe = async (signal?: AbortSignal): Promise<AuthUser> => {
    const { data } = await api.get<ApiResponse<{ user: AuthUser }>>(
        "/auth/me",
        { signal }
    );

    return data.data.user;
};

export const forgotPassword = async (email: string): Promise<string> => {
    const { data } = await api.post<ApiResponse<null>>("/auth/forgot-password", {
        email,
    });

    return data.message;
};

export const resetPassword = async (
    token: string,
    password: string
): Promise<string> => {
    const { data } = await api.post<ApiResponse<null>>("/auth/reset-password", {
        token,
        password,
    });

    return data.message;
};

export const getAuthErrorMessage = (
    error: unknown,
    fallbackMessage: string
): string => {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallbackMessage;
    }

    return error instanceof Error ? error.message : fallbackMessage;
};
