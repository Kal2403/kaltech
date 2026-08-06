export type UserRole = "customer" | "admin";

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
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
