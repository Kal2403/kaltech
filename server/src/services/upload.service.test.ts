import assert from "node:assert/strict";
import { PassThrough } from "node:stream";
import test from "node:test";
import type { UploadApiResponse } from "cloudinary";

import {
    CloudinaryUploader,
    parseImageContext,
    uploadImage,
    validateImageFile,
} from "./upload.service.js";

const pngBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    "base64"
);

const makeFile = (
    mimetype = "image/png",
    buffer = pngBuffer
): Express.Multer.File => ({
    fieldname: "image",
    originalname: "pixel.png",
    encoding: "7bit",
    mimetype,
    size: buffer.length,
    buffer,
    destination: "",
    filename: "",
    path: "",
    stream: new PassThrough(),
});

test("parseImageContext defaults to product and accepts category", () => {
    assert.equal(parseImageContext(undefined), "product");
    assert.equal(parseImageContext("category"), "category");
});

test("parseImageContext rejects client-controlled folders", () => {
    assert.throws(
        () => parseImageContext("../private"),
        (error: Error) => error.message === "Context must be product or category"
    );
});

test("validateImageFile accepts matching image MIME and magic bytes", async () => {
    await assert.doesNotReject(validateImageFile(makeFile()));
});

test("validateImageFile rejects a MIME mismatch", async () => {
    await assert.rejects(
        validateImageFile(makeFile("image/jpeg")),
        (error: Error) => error.message === "Image content does not match its MIME type"
    );
});

test("validateImageFile rejects unsupported declared MIME types", async () => {
    await assert.rejects(
        validateImageFile(makeFile("image/gif")),
        (error: Error) => error.message === "Only JPEG, PNG, and WebP images are allowed"
    );
});

test("validateImageFile rejects excessive dimensions before upload", async () => {
    const oversizedPng = Buffer.from(pngBuffer);
    oversizedPng.writeUInt32BE(5000, 16);

    await assert.rejects(
        validateImageFile(makeFile("image/png", oversizedPng)),
        (error: Error) =>
            error.message ===
            "Image dimensions must not exceed 4096 px or 16 megapixels"
    );
});

test("uploadImage uses a server folder and public id and maps metadata", async () => {
    let receivedOptions: Record<string, unknown> | undefined;
    const uploader: CloudinaryUploader = {
        upload_stream: (options, callback) => {
            receivedOptions = options;
            const stream = new PassThrough();
            stream.on("finish", () => callback(undefined, {
                secure_url: "https://res.cloudinary.com/demo/image/upload/pixel.png",
                public_id: "kaltech/products/generated-id",
                width: 1,
                height: 1,
                format: "png",
                bytes: pngBuffer.length,
            } as UploadApiResponse));
            return stream;
        },
    };

    const result = await uploadImage(makeFile(), "product", uploader);

    assert.equal(receivedOptions?.folder, "kaltech/development/products");
    assert.equal(receivedOptions?.resource_type, "image");
    assert.equal(typeof receivedOptions?.public_id, "string");
    assert.deepEqual(receivedOptions?.allowed_formats, ["jpg", "png", "webp"]);
    assert.deepEqual(receivedOptions?.transformation, [
        { width: 4096, height: 4096, crop: "limit" },
    ]);
    assert.deepEqual(result, {
        url: "https://res.cloudinary.com/demo/image/upload/pixel.png",
        publicId: "kaltech/products/generated-id",
        width: 1,
        height: 1,
        format: "png",
        bytes: pngBuffer.length,
    });
});

test("uploadImage normalizes provider failures", async () => {
    const uploader: CloudinaryUploader = {
        upload_stream: (_options, callback) => {
            const stream = new PassThrough();
            stream.on("finish", () => callback({ message: "secret provider detail" } as never));
            return stream;
        },
    };

    await assert.rejects(
        uploadImage(makeFile(), "category", uploader),
        (error: Error) => error.message === "Image provider upload failed"
    );
});

test("uploadImage destroys the provider stream on timeout", async () => {
    let wasDestroyed = false;
    const uploader: CloudinaryUploader = {
        upload_stream: () => {
            const stream = new PassThrough();
            const originalDestroy = stream.destroy.bind(stream);
            stream.destroy = (error?: Error) => {
                wasDestroyed = true;
                return originalDestroy(error);
            };
            return stream;
        },
    };

    await assert.rejects(
        uploadImage(makeFile(), "product", uploader, 5),
        (error: Error) => error.message === "Image provider upload timed out"
    );
    assert.equal(wasDestroyed, true);
});
