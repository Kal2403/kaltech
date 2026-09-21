import { api } from "../../api/axios";
import type {
    AddressInput,
    ChangePasswordInput,
    UpdateProfileInput,
    UserAddress,
    UserProfile,
} from "../../types/user.types";

interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

export const getProfile = async (): Promise<UserProfile> => {
    const response = await api.get<ApiResponse<UserProfile>>("/users/profile");
    return response.data.data;
};

export const updateProfile = async (
    data: UpdateProfileInput
): Promise<UserProfile> => {
    const response = await api.put<ApiResponse<UserProfile>>(
        "/users/profile",
        data
    );
    return response.data.data;
};

export const changePassword = async (
    data: ChangePasswordInput
): Promise<{ message: string }> => {
    const response = await api.put<ApiResponse<null>>(
        "/users/profile/password",
        data
    );
    return { message: response.data.message || "Password updated successfully" };
};

export const getAddresses = async (): Promise<UserAddress[]> => {
    const response = await api.get<ApiResponse<UserAddress[]>>("/users/addresses");
    return response.data.data;
};

export const addAddress = async (
    data: AddressInput
): Promise<UserAddress[]> => {
    const response = await api.post<ApiResponse<UserAddress[]>>(
        "/users/addresses",
        data
    );
    return response.data.data;
};

export const updateAddress = async (
    addressId: string,
    data: Partial<AddressInput>
): Promise<UserAddress[]> => {
    const response = await api.put<ApiResponse<UserAddress[]>>(
        `/users/addresses/${addressId}`,
        data
    );
    return response.data.data;
};

export const deleteAddress = async (
    addressId: string
): Promise<UserAddress[]> => {
    const response = await api.delete<ApiResponse<UserAddress[]>>(
        `/users/addresses/${addressId}`
    );
    return response.data.data;
};

export const setDefaultAddress = async (
    addressId: string
): Promise<UserAddress[]> => {
    const response = await api.patch<ApiResponse<UserAddress[]>>(
        `/users/addresses/${addressId}/default`
    );
    return response.data.data;
};
