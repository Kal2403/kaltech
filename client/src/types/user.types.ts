export interface UserAddress {
    _id: string;
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
    isDefault: boolean;
}

export interface UserProfile {
    _id: string;
    name: string;
    email: string;
    role: "customer" | "admin";
    phone?: string;
    avatar?: string;
    addresses: UserAddress[];
    createdAt: string;
    updatedAt: string;
}

export interface UpdateProfileInput {
    name?: string;
    phone?: string;
    avatar?: string;
}

export interface ChangePasswordInput {
    currentPassword: string;
    newPassword: string;
}

export interface AddressInput {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
    isDefault?: boolean;
}
