import { api } from "../../api/axios";

import type {
    Category,
    CreateCategoryPayload,
} from "../../types/category.types";

interface CategoriesResponse {
    success: boolean;
    message: string;
    data: {
        categories: Category[];
    };
}

interface CategoryResponse {
    success: boolean;
    message: string;
    data: {
        category: Category;
    };
}

export const getCategories = async (): Promise<Category[]> => {
    const response = await api.get<CategoriesResponse>("/categories");

    return response.data.data.categories;
};

export const createCategory = async (
    payload: CreateCategoryPayload
): Promise<Category> => {
    const response = await api.post<CategoryResponse>(
        "/categories",
        payload
    );

    return response.data.data.category;
};
