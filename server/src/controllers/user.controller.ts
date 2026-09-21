import { Request, Response, NextFunction } from "express";
import {
    addAddress,
    changeUserPassword,
    deleteAddress,
    getUserAddresses,
    getUserProfile,
    setDefaultAddress,
    updateAddress,
    updateUserProfile,
} from "../services/user.service.js";
import { validateObjectId } from "../utils/validateObjectId.js";
import { ApiError } from "../utils/ApiError.js";

export const getProfileController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user!.id;
        const profile = await getUserProfile(userId);

        res.status(200).json({
            success: true,
            data: profile,
        });
    } catch (error) {
        next(error);
    }
};

export const updateProfileController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user!.id;
        const profile = await updateUserProfile(userId, req.body);

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: profile,
        });
    } catch (error) {
        next(error);
    }
};

export const changePasswordController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user!.id;
        const { currentPassword, newPassword } = req.body;
        const result = await changeUserPassword(userId, currentPassword, newPassword);

        res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        next(error);
    }
};

export const getAddressesController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user!.id;
        const addresses = await getUserAddresses(userId);

        res.status(200).json({
            success: true,
            data: addresses,
        });
    } catch (error) {
        next(error);
    }
};

export const addAddressController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user!.id;
        const addresses = await addAddress(userId, req.body);

        res.status(201).json({
            success: true,
            message: "Address added successfully",
            data: addresses,
        });
    } catch (error) {
        next(error);
    }
};

export const updateAddressController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user!.id;
        const { addressId } = req.params;

        if (!addressId || Array.isArray(addressId)) {
            throw new ApiError(400, "Invalid address id");
        }

        const validAddressId = validateObjectId(addressId, "address");
        const addresses = await updateAddress(userId, validAddressId, req.body);

        res.status(200).json({
            success: true,
            message: "Address updated successfully",
            data: addresses,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteAddressController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user!.id;
        const { addressId } = req.params;

        if (!addressId || Array.isArray(addressId)) {
            throw new ApiError(400, "Invalid address id");
        }

        const validAddressId = validateObjectId(addressId, "address");
        const addresses = await deleteAddress(userId, validAddressId);

        res.status(200).json({
            success: true,
            message: "Address deleted successfully",
            data: addresses,
        });
    } catch (error) {
        next(error);
    }
};

export const setDefaultAddressController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user!.id;
        const { addressId } = req.params;

        if (!addressId || Array.isArray(addressId)) {
            throw new ApiError(400, "Invalid address id");
        }

        const validAddressId = validateObjectId(addressId, "address");
        const addresses = await setDefaultAddress(userId, validAddressId);

        res.status(200).json({
            success: true,
            message: "Default address updated successfully",
            data: addresses,
        });
    } catch (error) {
        next(error);
    }
};
