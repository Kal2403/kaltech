import { ApiError } from "./ApiError.js";
import { validateObjectId } from "./validateObjectId.js";

export interface ProductInput {
    name?: string;
    slug?: string;
    description?: string;
    price?: number;
    discountPrice?: number | null;
    stock?: number;
    images?: string[];
    brand?: string | null;
    category?: string;
    specs?: Record<string, string>;
    isFeatured?: boolean;
    isActive?: boolean;
}

const fields = new Set([
    "name", "slug", "description", "price", "discountPrice", "stock",
    "images", "brand", "category", "specs", "isFeatured", "isActive",
]);

const invalid = (field: string): never => {
    throw new ApiError(400, `Invalid product ${field}`);
};

const record = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value) &&
    (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);

export const parseProductInput = (input: unknown, partial = false): ProductInput => {
    if (!record(input)) {
        return invalid("data");
    }
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(input)) {
        if (!fields.has(key)) {
            invalid(key);
        }
        if (["name", "description", "slug", "category"].includes(key)) {
            if (typeof value !== "string" || !value.trim()) {
                invalid(key);
            }
            const text = (value as string).trim();
            if (key === "slug" && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(text)) {
                invalid(key);
            }
            if (key === "category") {
                validateObjectId(text, "category");
            }
            result[key] = text;
        } else if (["price", "discountPrice", "stock"].includes(key)) {
            if (key === "discountPrice" && value === null) {
                result[key] = null;
                continue;
            }
            if (typeof value !== "number" || !Number.isFinite(value) || value < 0 ||
                (key === "stock" && !Number.isSafeInteger(value))) {
                invalid(key);
            }
            result[key] = value;
        } else if (key === "brand") {
            if (value !== null && typeof value !== "string") {
                invalid(key);
            }
            result[key] = typeof value === "string" ? value.trim() || null : null;
        } else if (key === "isActive" || key === "isFeatured") {
            if (typeof value !== "boolean") {
                invalid(key);
            }
            result[key] = value;
        } else if (key === "images") {
            if (!Array.isArray(value) || !value.every((item) => {
                if (typeof item !== "string") {
                    return false;
                }
                try {
                    return ["http:", "https:"].includes(new URL(item).protocol);
                } catch {
                    return false;
                }
            })) {
                invalid(key);
            }
            result[key] = value;
        } else if (key === "specs") {
            if (!record(value) || Object.entries(value).some(([name, entry]) =>
                !name.trim() || name.includes(".") || name.startsWith("$") ||
                ["__proto__", "constructor", "prototype"].includes(name) || typeof entry !== "string")) {
                invalid(key);
            }
            result[key] = value;
        }
    }
    if (!partial) {
        for (const field of ["name", "description", "price", "stock", "category"]) {
            if (!(field in result)) {
                invalid(field);
            }
        }
    }
    return result as ProductInput;
};
