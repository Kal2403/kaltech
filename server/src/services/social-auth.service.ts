import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { generateToken } from "../utils/generateToken.js";
import { sendWelcomeEmail } from "./email.service.js";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

interface GoogleTokenInfoResponse {
    sub?: string;
    email?: string;
    email_verified?: string | boolean;
    name?: string;
    picture?: string;
    aud?: string;
    error_description?: string;
}

interface FacebookProfileResponse {
    id?: string;
    name?: string;
    email?: string;
    picture?: {
        data?: {
            url?: string;
        };
    };
    error?: {
        message?: string;
    };
}

export const getSocialAuthConfig = () => {
    return {
        googleClientId: process.env.GOOGLE_CLIENT_ID || null,
        facebookAppId: process.env.FACEBOOK_APP_ID || null,
    };
};

export const verifyAndLoginWithGoogle = async (credential: string) => {
    if (!credential || typeof credential !== "string" || credential.trim().length === 0) {
        throw new ApiError(400, "La credencial de Google es requerida");
    }

    const trimmedCredential = credential.trim();
    const tokenInfoUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(trimmedCredential)}`;

    let response: Response;
    try {
        response = await fetch(tokenInfoUrl);
    } catch (networkError) {
        console.error("[Google Auth Error] Error al contactar servidores de Google:", networkError);
        throw new ApiError(502, "No se pudo conectar con el servicio de autenticación de Google");
    }

    if (!response.ok) {
        throw new ApiError(401, "Token de Google inválido o expirado");
    }

    const payload = (await response.json()) as GoogleTokenInfoResponse;

    if (!payload.sub || !payload.email) {
        throw new ApiError(400, "El token de Google no contiene la información de perfil necesaria");
    }

    const isEmailVerified = payload.email_verified === "true" || payload.email_verified === true;
    if (!isEmailVerified) {
        throw new ApiError(400, "El correo de Google debe estar verificado");
    }

    const configuredClientId = process.env.GOOGLE_CLIENT_ID?.trim();
    if (configuredClientId && payload.aud && payload.aud !== configuredClientId) {
        throw new ApiError(401, "El token no corresponde al Client ID configurado");
    }

    const normalizedEmail = normalizeEmail(payload.email);
    let user = await User.findOne({
        $or: [{ googleId: payload.sub }, { email: normalizedEmail }],
    });

    if (user) {
        if (!user.isActive) {
            throw new ApiError(403, "Esta cuenta ha sido desactivada. Contacta al soporte.");
        }

        let needsSave = false;
        if (!user.googleId) {
            user.googleId = payload.sub;
            if (user.authProvider === "local" || !user.authProvider) {
                user.authProvider = "google";
            }
            needsSave = true;
        }

        if (!user.avatar && payload.picture) {
            user.avatar = payload.picture;
            needsSave = true;
        }

        if (needsSave) {
            await user.save();
        }
    } else {
        user = await User.create({
            name: payload.name?.trim() || "Usuario Google",
            email: normalizedEmail,
            googleId: payload.sub,
            authProvider: "google",
            avatar: payload.picture || "",
            role: "customer",
            isActive: true,
        });

        void sendWelcomeEmail(user.email, user.name).catch((emailErr) => {
            console.error("[Email Error] Error al enviar bienvenida a usuario Google:", emailErr);
        });
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
            avatar: user.avatar || "",
        },
        token,
    };
};

export const verifyAndLoginWithFacebook = async (accessToken: string) => {
    if (!accessToken || typeof accessToken !== "string" || accessToken.trim().length === 0) {
        throw new ApiError(400, "El token de acceso de Facebook es requerido");
    }

    const trimmedToken = accessToken.trim();
    const fbGraphUrl = `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${encodeURIComponent(trimmedToken)}`;

    let response: Response;
    try {
        response = await fetch(fbGraphUrl);
    } catch (networkError) {
        console.error("[Facebook Auth Error] Error al contactar Graph API de Facebook:", networkError);
        throw new ApiError(502, "No se pudo conectar con el servicio de autenticación de Facebook");
    }

    if (!response.ok) {
        throw new ApiError(401, "Token de acceso de Facebook inválido o expirado");
    }

    const payload = (await response.json()) as FacebookProfileResponse;

    if (!payload.id) {
        throw new ApiError(400, "La respuesta de Facebook no contiene el identificador de usuario");
    }

    const email = payload.email
        ? normalizeEmail(payload.email)
        : `${payload.id}@facebook.kaltech.com`;

    let user = await User.findOne({
        $or: [{ facebookId: payload.id }, { email }],
    });

    if (user) {
        if (!user.isActive) {
            throw new ApiError(403, "Esta cuenta ha sido desactivada. Contacta al soporte.");
        }

        let needsSave = false;
        if (!user.facebookId) {
            user.facebookId = payload.id;
            if (user.authProvider === "local" || !user.authProvider) {
                user.authProvider = "facebook";
            }
            needsSave = true;
        }

        const fbAvatar = payload.picture?.data?.url;
        if (!user.avatar && fbAvatar) {
            user.avatar = fbAvatar;
            needsSave = true;
        }

        if (needsSave) {
            await user.save();
        }
    } else {
        user = await User.create({
            name: payload.name?.trim() || "Usuario Facebook",
            email,
            facebookId: payload.id,
            authProvider: "facebook",
            avatar: payload.picture?.data?.url || "",
            role: "customer",
            isActive: true,
        });

        if (payload.email) {
            void sendWelcomeEmail(user.email, user.name).catch((emailErr) => {
                console.error("[Email Error] Error al enviar bienvenida a usuario Facebook:", emailErr);
            });
        }
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
            avatar: user.avatar || "",
        },
        token,
    };
};
