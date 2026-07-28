export interface Category {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateCategoryPayload {
    name: string;
    slug: string;
    description?: string;
    image?: string;
    isActive?: boolean;
}

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;
