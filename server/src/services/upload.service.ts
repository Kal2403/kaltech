import { randomUUID } from "node:crypto";
import type { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
import { imageSize } from "image-size";

import { assertCloudinaryConfig, cloudinary } from "../config/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";

export const IMAGE_CONTEXTS = ["product", "category"] as const;
export type ImageContext = (typeof IMAGE_CONTEXTS)[number];

const ALLOWED_IMAGE_TYPES = new Map([
    ["image/jpeg", "jpg"],
    ["image/png", "png"],
    ["image/webp", "webp"],
]);
const MAX_IMAGE_DIMENSION = 4096;
const MAX_IMAGE_PIXELS = 16_000_000;

export interface UploadedImage {
    url: string;
    publicId: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
}

export interface CloudinaryUploader {
    upload_stream: (
        options: Record<string, unknown>,
        callback: (
            error?: UploadApiErrorResponse,
            result?: UploadApiResponse
        ) => void
    ) => NodeJS.WritableStream & { destroy: (error?: Error) => void };
}

const UPLOAD_TIMEOUT_MS = 20_000;

const getEnvironmentFolder = (): string => {
    const environment = process.env.NODE_ENV;
    return environment === "production" || environment === "test"
        ? environment
        : "development";
};

export const parseImageContext = (value: unknown): ImageContext => {
    if (value === undefined || value === "") {
        return "product";
    }

    if (typeof value !== "string" || !IMAGE_CONTEXTS.includes(value as ImageContext)) {
        throw new ApiError(400, "Context must be product or category");
    }

    return value as ImageContext;
};

export const validateImageFile = async (
    file: Express.Multer.File
): Promise<void> => {
    const expectedExtension = ALLOWED_IMAGE_TYPES.get(file.mimetype);

    if (!expectedExtension) {
        throw new ApiError(400, "Only JPEG, PNG, and WebP images are allowed");
    }

    const { fileTypeFromBuffer } = await import("file-type");
    const detected = await fileTypeFromBuffer(file.buffer);

    if (!detected || detected.mime !== file.mimetype) {
        throw new ApiError(400, "Image content does not match its MIME type");
    }

    if (detected.ext !== expectedExtension) {
        throw new ApiError(400, "Unsupported image format");
    }

    let dimensions: ReturnType<typeof imageSize>;
    try {
        dimensions = imageSize(file.buffer);
    } catch {
        throw new ApiError(400, "Image dimensions could not be read");
    }

    const { width, height } = dimensions;
    if (
        !width ||
        !height ||
        width > MAX_IMAGE_DIMENSION ||
        height > MAX_IMAGE_DIMENSION ||
        width * height > MAX_IMAGE_PIXELS
    ) {
        throw new ApiError(
            400,
            "Image dimensions must not exceed 4096 px or 16 megapixels"
        );
    }
};

export const uploadImage = async (
    file: Express.Multer.File,
    context: ImageContext,
    uploader: CloudinaryUploader = cloudinary.uploader,
    timeoutMs = UPLOAD_TIMEOUT_MS
): Promise<UploadedImage> => {
    await validateImageFile(file);

    if (uploader === cloudinary.uploader) {
        assertCloudinaryConfig();
    }

    const publicId = randomUUID();
    const folder = `kaltech/${getEnvironmentFolder()}/${context}s`;

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        let settled = false;
        let timeoutId: NodeJS.Timeout | undefined;
        const stream = uploader.upload_stream(
            {
                resource_type: "image",
                folder,
                public_id: publicId,
                overwrite: false,
                unique_filename: false,
                allowed_formats: ["jpg", "png", "webp"],
                transformation: [
                    {
                        width: 4096,
                        height: 4096,
                        crop: "limit",
                    },
                ],
            },
            (error, uploaded) => {
                if (settled) return;
                settled = true;
                if (timeoutId) clearTimeout(timeoutId);
                if (error || !uploaded) {
                    reject(new ApiError(502, "Image provider upload failed"));
                    return;
                }

                resolve(uploaded);
            }
        );
        timeoutId = setTimeout(() => {
            if (settled) return;
            settled = true;
            stream.destroy();
            reject(new ApiError(504, "Image provider upload timed out"));
        }, timeoutMs);

        stream.on("error", () => {
            if (settled) return;
            settled = true;
            if (timeoutId) clearTimeout(timeoutId);
            reject(new ApiError(502, "Image provider upload failed"));
        });
        stream.end(file.buffer);
    });

    return {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
    };
};
