import bcrypt from "bcryptjs";
import { User, type IUserAddress } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { validateObjectId } from "../utils/validateObjectId.js";

interface UpdateProfileInput {
    name?: string;
    phone?: string;
    avatar?: string;
}

interface AddressInput {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
    isDefault?: boolean;
}

export const getUserProfile = async (userId: string) => {
    validateObjectId(userId, "user");

    const user = await User.findById(userId).select("-password");
    if (!user || !user.isActive) {
        throw new ApiError(404, "User not found");
    }

    return user;
};

export const updateUserProfile = async (
    userId: string,
    input: UpdateProfileInput
) => {
    validateObjectId(userId, "user");

    const user = await User.findById(userId);
    if (!user || !user.isActive) {
        throw new ApiError(404, "User not found");
    }

    if (input.name !== undefined) {
        const trimmedName = input.name.trim();
        if (trimmedName.length < 2 || trimmedName.length > 80) {
            throw new ApiError(400, "Name must be between 2 and 80 characters");
        }
        user.name = trimmedName;
    }

    if (input.phone !== undefined) {
        user.phone = input.phone.trim();
    }

    if (input.avatar !== undefined) {
        user.avatar = input.avatar.trim();
    }

    await user.save();

    return getUserProfile(userId);
};

export const changeUserPassword = async (
    userId: string,
    currentPassword: string,
    newPassword: string
) => {
    validateObjectId(userId, "user");

    if (!currentPassword || !newPassword) {
        throw new ApiError(400, "Current and new password are required");
    }

    const user = await User.findById(userId).select("+password");
    if (!user || !user.isActive) {
        throw new ApiError(404, "User not found");
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        throw new ApiError(400, "Incorrect current password");
    }

    if (newPassword.length < 8 || Buffer.byteLength(newPassword, "utf8") > 72) {
        throw new ApiError(
            400,
            "Password must contain at least 8 characters and at most 72 UTF-8 bytes"
        );
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return { message: "Password updated successfully" };
};

export const getUserAddresses = async (userId: string) => {
    validateObjectId(userId, "user");

    const user = await User.findById(userId).select("addresses isActive");
    if (!user || !user.isActive) {
        throw new ApiError(404, "User not found");
    }

    return user.addresses;
};

const validateAddressFields = (input: Partial<AddressInput>) => {
    const required = ["fullName", "address", "city", "postalCode", "country", "phone"] as const;
    for (const field of required) {
        if (input[field] !== undefined && typeof input[field] === "string") {
            input[field] = input[field]!.trim();
            if (input[field]!.length === 0) {
                throw new ApiError(400, `${field} cannot be empty`);
            }
        }
    }
};

export const addAddress = async (userId: string, input: AddressInput) => {
    validateObjectId(userId, "user");

    if (
        !input.fullName ||
        !input.address ||
        !input.city ||
        !input.postalCode ||
        !input.country ||
        !input.phone
    ) {
        throw new ApiError(400, "All address fields are required");
    }

    validateAddressFields(input);

    const user = await User.findById(userId);
    if (!user || !user.isActive) {
        throw new ApiError(404, "User not found");
    }

    const makeDefault = Boolean(input.isDefault) || user.addresses.length === 0;

    if (makeDefault) {
        for (const addr of user.addresses) {
            addr.isDefault = false;
        }
    }

    user.addresses.push({
        fullName: input.fullName.trim(),
        address: input.address.trim(),
        city: input.city.trim(),
        postalCode: input.postalCode.trim(),
        country: input.country.trim(),
        phone: input.phone.trim(),
        isDefault: makeDefault,
    });

    await user.save();
    return user.addresses;
};

export const updateAddress = async (
    userId: string,
    addressId: string,
    input: Partial<AddressInput>
) => {
    validateObjectId(userId, "user");
    validateObjectId(addressId, "address");

    validateAddressFields(input);

    const user = await User.findById(userId);
    if (!user || !user.isActive) {
        throw new ApiError(404, "User not found");
    }

    const addressIndex = user.addresses.findIndex(
        (addr) => addr._id?.toString() === addressId
    );

    if (addressIndex === -1) {
        throw new ApiError(404, "Address not found");
    }

    if (input.isDefault) {
        for (const addr of user.addresses) {
            addr.isDefault = false;
        }
    }

    const target = user.addresses[addressIndex];
    if (input.fullName !== undefined) target.fullName = input.fullName.trim();
    if (input.address !== undefined) target.address = input.address.trim();
    if (input.city !== undefined) target.city = input.city.trim();
    if (input.postalCode !== undefined) target.postalCode = input.postalCode.trim();
    if (input.country !== undefined) target.country = input.country.trim();
    if (input.phone !== undefined) target.phone = input.phone.trim();
    if (input.isDefault !== undefined) target.isDefault = input.isDefault;

    await user.save();
    return user.addresses;
};

export const deleteAddress = async (userId: string, addressId: string) => {
    validateObjectId(userId, "user");
    validateObjectId(addressId, "address");

    const user = await User.findById(userId);
    if (!user || !user.isActive) {
        throw new ApiError(404, "User not found");
    }

    const addressIndex = user.addresses.findIndex(
        (addr) => addr._id?.toString() === addressId
    );

    if (addressIndex === -1) {
        throw new ApiError(404, "Address not found");
    }

    const wasDefault = user.addresses[addressIndex].isDefault;
    user.addresses.splice(addressIndex, 1);

    if (wasDefault && user.addresses.length > 0) {
        user.addresses[0].isDefault = true;
    }

    await user.save();
    return user.addresses;
};

export const setDefaultAddress = async (userId: string, addressId: string) => {
    validateObjectId(userId, "user");
    validateObjectId(addressId, "address");

    const user = await User.findById(userId);
    if (!user || !user.isActive) {
        throw new ApiError(404, "User not found");
    }

    const target = user.addresses.find(
        (addr) => addr._id?.toString() === addressId
    );

    if (!target) {
        throw new ApiError(404, "Address not found");
    }

    for (const addr of user.addresses) {
        addr.isDefault = addr._id?.toString() === addressId;
    }

    await user.save();
    return user.addresses;
};
