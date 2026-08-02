import multer from "multer";

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export const uploadImageMiddleware = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_IMAGE_SIZE_BYTES,
        files: 1,
        fields: 1,
        parts: 2,
    },
}).single("image");
