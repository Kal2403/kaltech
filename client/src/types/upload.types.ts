export type UploadContext = "product" | "category";

export interface UploadedImage {
    url: string;
    publicId: string;
    width?: number;
    height?: number;
    format?: string;
    bytes?: number;
}

export interface UploadImageResponse {
    success: true;
    message: string;
    data: UploadedImage;
}
