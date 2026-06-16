import bcrypt from "bcryptjs";

import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { generateToken } from "../utils/generateToken.js";

interface RegisterInput {
    name: string;
    email: string;
    password: string;
}

interface LoginInput {
    email: string;
    password: string;
}

export const registerUser = async ({ name, email, password }: RegisterInput) => {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new ApiError(409, "Email is already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
    });

    const token = generateToken({
        userId: user.id,
        role: user.role,
    });

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        token,
    };
};

export const loginUser = async ({ email, password }: LoginInput) => {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        throw new ApiError(401, "Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Ivalid email or password");
    }

    if(!user.isActive) {
        throw new ApiError(403, "User account is inactive");
    }

    const token = generateToken({
        userId: user.id,
        role: user.role,
    });

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        token,
    };
};