import { api } from "../../api/axios";

import type {
    Category,
    CreateCategoryPayload,
    UpdateCategoryPayload,
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

export const getAdminCategories = async (): Promise<Category[]> => {
    const response = await api.get<CategoriesResponse>(
        "/categories/admin"
    );

    return response.data.data.categories;
};

export const getCategoryById = async (
    categoryId: string
): Promise<Category> => {
    const response = await api.get<CategoryResponse>(
        `/categories/${categoryId}`
    );

    return response.data.data.category;
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

export const updateCategory = async (
    categoryId: string,
    payload: UpdateCategoryPayload
): Promise<Category> => {
    const response = await api.patch<CategoryResponse>(
        `/categories/${categoryId}`,
        payload
    );

    return response.data.data.category;
};

export const deleteCategory = async (
    categoryId: string
): Promise<Category> => {
    const response = await api.delete<CategoryResponse>(
        `/categories/${categoryId}`
    );

    return response.data.data.category;
};
