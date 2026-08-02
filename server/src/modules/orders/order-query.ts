import { ApiError } from "../../utils/ApiError.js";

export interface AdminOrdersQuery {
    page: number;
    limit: number;
}

const parsePositiveInteger = (
    value: unknown,
    fallback: number,
    field: string,
    maximum?: number
): number => {
    if (value === undefined) return fallback;
    if (typeof value !== "string" || !/^\d+$/.test(value)) {
        throw new ApiError(400, `${field} must be a positive integer`);
    }

    const parsedValue = Number(value);
    if (
        !Number.isSafeInteger(parsedValue) ||
        parsedValue < 1 ||
        (maximum && parsedValue > maximum)
    ) {
        throw new ApiError(
            400,
            maximum
                ? `${field} must be between 1 and ${maximum}`
                : `${field} must be at least 1`
        );
    }

    return parsedValue;
};

export const parseAdminOrdersQuery = (
    query: Record<string, unknown>
): AdminOrdersQuery => ({
    page: parsePositiveInteger(query.page, 1, "page"),
    limit: parsePositiveInteger(query.limit, 20, "limit", 100),
});
