import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";

import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { generateToken } from "../utils/generateToken.js";
import { sendPasswordResetEmail, sendWelcomeEmail } from "./email.service.js";

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

    if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
        throw new ApiError(400, "Password must contain at least 8 characters and at most 72 UTF-8 bytes");
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
        Buffer.byteLength(password, "utf8") > 72
    ) {
        throw new ApiError(400, "A valid email and password are required");
    }

    return { email, password };
};

interface ForgotPasswordInput {
    email: string;
}

interface ResetPasswordInput {
    token: string;
    password: string;
}

const parseForgotPasswordInput = (input: unknown): ForgotPasswordInput => {
    if (!isRecord(input)) {
        throw new ApiError(400, "Email is required");
    }

    const email = typeof input.email === "string" ? normalizeEmail(input.email) : "";

    if (!emailPattern.test(email) || email.length > 254) {
        throw new ApiError(400, "A valid email is required");
    }

    return { email };
};

const parseResetPasswordInput = (input: unknown): ResetPasswordInput => {
    if (!isRecord(input)) {
        throw new ApiError(400, "Token and password are required");
    }

    const token = typeof input.token === "string" ? input.token.trim() : "";
    const password = typeof input.password === "string" ? input.password : "";

    if (!token) {
        throw new ApiError(400, "Token is required");
    }

    if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
        throw new ApiError(
            400,
            "Password must contain at least 8 characters and at most 72 UTF-8 bytes"
        );
    }

    return { token, password };
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

    void sendWelcomeEmail(user.email, user.name).catch((err) => {
        console.error("[Email Error] No se pudo enviar el correo de bienvenida:", err);
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

export const requestPasswordReset = async (input: unknown) => {
    const { email } = parseForgotPasswordInput(input);
    const user = await User.findOne({ email });

    if (user && user.isActive) {
        const rawToken = randomBytes(32).toString("hex");
        const hashedToken = createHash("sha256").update(rawToken).digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await user.save();

        void sendPasswordResetEmail(user.email, user.name, rawToken).catch((err) => {
            console.error("[Email Error] No se pudo enviar el correo de restablecimiento:", err);
        });
    }

    return {
        message:
            "Si el correo electrónico está registrado, recibirás un enlace para restablecer tu contraseña.",
    };
};

export const resetPassword = async (input: unknown) => {
    const { token, password } = parseResetPasswordInput(input);
    const hashedToken = createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: new Date() },
    }).select("+resetPasswordToken +resetPasswordExpires");

    if (!user) {
        throw new ApiError(400, "El token de recuperación es inválido o ha expirado");
    }

    if (!user.isActive) {
        throw new ApiError(403, "User account is inactive");
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return {
        message:
            "Contraseña actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.",
    };
};
