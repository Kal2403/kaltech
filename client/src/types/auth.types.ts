export type UserRole = "customer" | "admin";

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData extends LoginCredentials {
    name: string;
}

export interface AuthSession {
    user: AuthUser;
    token: string;
}

export interface SocialAuthConfig {
    googleClientId: string | null;
    facebookAppId: string | null;
}
