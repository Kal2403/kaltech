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

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const parseRegisterInput = (input: unknown): RegisterInput => {
    if (!isRecord(input)) {
        throw new ApiError(400, "Name, email, and password are required");
    }

    const name = typeof input.name === "string" ? input.name.trim() : "";
    const email = typeof input.email === "string" ? normalizeEmail(input.email) : "";
    const password = typeof input.password === "string" ? input.password : "";

    if (name.length < 2 || name.length > 80) {
        throw new ApiError(400, "Name must be between 2 and 80 characters");
    }

    if (!emailPattern.test(email) || email.length > 254) {
        throw new ApiError(400, "A valid email is required");
    }

    if (password.length < 8 || password.length > 128) {
        throw new ApiError(400, "Password must be between 8 and 128 characters");
    }

    return { name, email, password };
};

const parseLoginInput = (input: unknown): LoginInput => {
    if (!isRecord(input)) {
        throw new ApiError(400, "Email and password are required");
    }

    const email = typeof input.email === "string" ? normalizeEmail(input.email) : "";
    const password = typeof input.password === "string" ? input.password : "";

    if (
        !emailPattern.test(email) ||
        email.length > 254 ||
        password.length === 0 ||
        password.length > 128
    ) {
        throw new ApiError(400, "A valid email and password are required");
    }

    return { email, password };
};

const isDuplicateKeyError = (error: unknown): boolean =>
    isRecord(error) &&
    error.code === 11000 &&
    ((isRecord(error.keyPattern) && error.keyPattern.email !== undefined) ||
        (isRecord(error.keyValue) && error.keyValue.email !== undefined));

const isMongoDuplicateKeyError = (error: unknown): boolean =>
    isRecord(error) && error.code === 11000;

export const registerUser = async (input: unknown) => {
    const { name, email, password } = parseRegisterInput(input);
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new ApiError(409, "Email is already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    let user;
    try {
        user = await User.create({
            name,
            email,
            password: hashedPassword,
        });
    } catch (error) {
        if (isDuplicateKeyError(error)) {
            throw new ApiError(409, "Email is already registered");
        }
        if (isMongoDuplicateKeyError(error)) {
            throw new Error("Unexpected unique constraint violation");
        }
        throw error;
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

export const loginUser = async (input: unknown) => {
    const { email, password } = parseLoginInput(input);
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        throw new ApiError(401, "Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid email or password");
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
