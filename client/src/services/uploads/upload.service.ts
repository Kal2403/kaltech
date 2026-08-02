import axios from "axios";

import { api } from "../../api/axios";
import type {
    UploadContext,
    UploadedImage,
    UploadImageResponse,
} from "../../types/upload.types";

interface ApiErrorResponse {
    message?: string;
}

export const uploadImage = async (
    image: File,
    context: UploadContext
): Promise<UploadedImage> => {
    const formData = new FormData();

    formData.append("image", image);
    formData.append("context", context);

    const response = await api.post<UploadImageResponse>(
        "/uploads/image",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data.data;
};

export const getUploadErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return (
            error.response?.data?.message ??
            "No se pudo subir la imagen. Inténtalo de nuevo."
        );
    }

    if (error instanceof Error) {
        return error.message;
    }

    return "No se pudo subir la imagen. Inténtalo de nuevo.";
};
