import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import {
    addAddress as addAddressApi,
    changePassword as changePasswordApi,
    deleteAddress as deleteAddressApi,
    getProfile as getProfileApi,
    setDefaultAddress as setDefaultAddressApi,
    updateAddress as updateAddressApi,
    updateProfile as updateProfileApi,
} from "../services/user/user.service";
import type {
    AddressInput,
    ChangePasswordInput,
    UpdateProfileInput,
    UserProfile,
} from "../types/user.types";

export const useProfile = () => {
    const { user, isInitializing } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isMutating, setIsMutating] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        if (!user || isInitializing) return;

        let cancelled = false;

        void getProfileApi()
            .then((data) => {
                if (!cancelled) {
                    setProfile(data);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setError("No se pudo cargar el perfil");
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setIsLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [user, isInitializing]);

    const updateProfile = async (input: UpdateProfileInput) => {
        setIsMutating(true);
        setError("");
        setSuccessMessage("");
        try {
            const updated = await updateProfileApi(input);
            setProfile(updated);
            setSuccessMessage("Perfil actualizado con éxito");
            return updated;
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message || "Error al actualizar perfil";
            setError(msg);
            throw new Error(msg, { cause: err });
        } finally {
            setIsMutating(false);
        }
    };

    const changePassword = async (input: ChangePasswordInput) => {
        setIsMutating(true);
        setError("");
        setSuccessMessage("");
        try {
            const res = await changePasswordApi(input);
            setSuccessMessage(res.message);
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message || "Error al cambiar contraseña";
            setError(msg);
            throw new Error(msg, { cause: err });
        } finally {
            setIsMutating(false);
        }
    };

    const addAddress = async (input: AddressInput) => {
        setIsMutating(true);
        setError("");
        setSuccessMessage("");
        try {
            const updatedAddresses = await addAddressApi(input);
            setProfile((prev) =>
                prev ? { ...prev, addresses: updatedAddresses } : null
            );
            setSuccessMessage("Dirección agregada con éxito");
            return updatedAddresses;
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message || "Error al agregar dirección";
            setError(msg);
            throw new Error(msg, { cause: err });
        } finally {
            setIsMutating(false);
        }
    };

    const updateAddress = async (
        addressId: string,
        input: Partial<AddressInput>
    ) => {
        setIsMutating(true);
        setError("");
        setSuccessMessage("");
        try {
            const updatedAddresses = await updateAddressApi(addressId, input);
            setProfile((prev) =>
                prev ? { ...prev, addresses: updatedAddresses } : null
            );
            setSuccessMessage("Dirección actualizada con éxito");
            return updatedAddresses;
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message || "Error al actualizar dirección";
            setError(msg);
            throw new Error(msg, { cause: err });
        } finally {
            setIsMutating(false);
        }
    };

    const deleteAddress = async (addressId: string) => {
        setIsMutating(true);
        setError("");
        setSuccessMessage("");
        try {
            const updatedAddresses = await deleteAddressApi(addressId);
            setProfile((prev) =>
                prev ? { ...prev, addresses: updatedAddresses } : null
            );
            setSuccessMessage("Dirección eliminada con éxito");
            return updatedAddresses;
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message || "Error al eliminar dirección";
            setError(msg);
            throw new Error(msg, { cause: err });
        } finally {
            setIsMutating(false);
        }
    };

    const setDefaultAddress = async (addressId: string) => {
        setIsMutating(true);
        setError("");
        setSuccessMessage("");
        try {
            const updatedAddresses = await setDefaultAddressApi(addressId);
            setProfile((prev) =>
                prev ? { ...prev, addresses: updatedAddresses } : null
            );
            setSuccessMessage("Dirección predeterminada actualizada");
            return updatedAddresses;
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message ||
                "Error al cambiar dirección predeterminada";
            setError(msg);
            throw new Error(msg, { cause: err });
        } finally {
            setIsMutating(false);
        }
    };

    const clearMessages = () => {
        setError("");
        setSuccessMessage("");
    };

    return {
        profile,
        addresses: profile?.addresses || [],
        isLoading,
        isMutating,
        error,
        successMessage,
        updateProfile,
        changePassword,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        clearMessages,
    };
};
