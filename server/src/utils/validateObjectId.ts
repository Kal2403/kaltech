import mongoose from "mongoose";

import { ApiError } from "./ApiError.js";

export const validateObjectId = (
    value: unknown,
    resourceName: string
): string => {
    if (
        typeof value !== "string" ||
        !/^[a-f\d]{24}$/i.test(value) ||
        !mongoose.isObjectIdOrHexString(value)
    ) {
        throw new ApiError(400, `Invalid ${resourceName} ID`);
    }

    return value;
};
