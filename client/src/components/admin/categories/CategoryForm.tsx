import {
    useEffect,
    useState,
    type ChangeEvent,
    type FormEvent,
} from "react";

import type {
    Category,
    CreateCategoryPayload,
} from "../../../types/category.types";

interface CategoryFormValues {
    name: string;
    slug: string;
    description: string;
    image: string;
    isActive: boolean;
}

interface CategoryFormErrors {
    name?: string;
    slug?: string;
    image?: string;
}

interface CategoryFormProps {
    initialCategory?: Category;
    isSubmitting: boolean;
    submitLabel: string;
    serverError?: string | null;
    onSubmit: (
        payload: CreateCategoryPayload
    ) => Promise<void>;
    onCancel: () => void;
}

const getInitialValues = (
    category?: Category
): CategoryFormValues => {
    return {
        name: category?.name ?? "",
        slug: category?.slug ?? "",
        description: category?.description ?? "",
        image: category?.image ?? "",
        isActive: category?.isActive ?? true,
    };
};

const generateSlug = (value: string): string => {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
};

const isValidUrl = (value: string): boolean => {
    try {
        const url = new URL(value);

        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
};

export const CategoryForm = ({
    initialCategory,
    isSubmitting,
    submitLabel,
    serverError = null,
    onSubmit,
    onCancel,
}: CategoryFormProps) => {
    const [values, setValues] = useState<CategoryFormValues>(() =>
        getInitialValues(initialCategory)
    );

    const [errors, setErrors] = useState<CategoryFormErrors>({});

    const [isSlugManuallyEdited, setIsSlugManuallyEdited] =
        useState(Boolean(initialCategory));

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setValues(getInitialValues(initialCategory));
            setErrors({});
            setIsSlugManuallyEdited(Boolean(initialCategory));
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [initialCategory]);

    const handleNameChange = (
        event: ChangeEvent<HTMLInputElement>
    ): void => {
        const name = event.target.value;

        setValues((currentValues) => ({
            ...currentValues,
            name,
            slug: isSlugManuallyEdited
                ? currentValues.slug
                : generateSlug(name),
        }));

        setErrors((currentErrors) => ({
            ...currentErrors,
            name: undefined,
            slug: undefined,
        }));
    };

    const handleTextChange = (
        event: ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement
        >
    ): void => {
        const { name, value } = event.target;

        setValues((currentValues) => ({
            ...currentValues,
            [name]: value,
        }));

        setErrors((currentErrors) => ({
            ...currentErrors,
            [name]: undefined,
        }));
    };

    const handleSlugChange = (
        event: ChangeEvent<HTMLInputElement>
    ): void => {
        setIsSlugManuallyEdited(true);

        setValues((currentValues) => ({
            ...currentValues,
            slug: generateSlug(event.target.value),
        }));

        setErrors((currentErrors) => ({
            ...currentErrors,
            slug: undefined,
        }));
    };

    const handleCheckboxChange = (
        event: ChangeEvent<HTMLInputElement>
    ): void => {
        setValues((currentValues) => ({
            ...currentValues,
            isActive: event.target.checked,
        }));
    };

    const validateForm = (): boolean => {
        const validationErrors: CategoryFormErrors = {};

        if (!values.name.trim()) {
            validationErrors.name =
                "El nombre de la categoría es obligatorio.";
        }

        if (!values.slug.trim()) {
            validationErrors.slug =
                "El slug de la categoría es obligatorio.";
        } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug)) {
            validationErrors.slug =
                "El slug solo puede contener letras minúsculas, números y guiones.";
        }

        if (values.image.trim() && !isValidUrl(values.image.trim())) {
            validationErrors.image =
                "La imagen debe ser una URL válida.";
        }

        setErrors(validationErrors);

        return Object.keys(validationErrors).length === 0;
    };

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ): Promise<void> => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        const payload: CreateCategoryPayload = {
            name: values.name.trim(),
            slug: values.slug.trim(),
            isActive: values.isActive,
        };

        const description = values.description.trim();
        const image = values.image.trim();

        if (description) {
            payload.description = description;
        }

        if (image) {
            payload.image = image;
        }

        await onSubmit(payload);
    };

    return (
        <form
            onSubmit={(event) => {
                void handleSubmit(event);
            }}
            className="space-y-8"
            noValidate
        >
            {serverError && (
                <div
                    role="alert"
                    className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {serverError}
                </div>
            )}

            <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Información general
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Define el nombre y la información pública de la
                        categoría.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div>
                        <label
                            htmlFor="name"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Nombre
                        </label>

                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={values.name}
                            onChange={handleNameChange}
                            disabled={isSubmitting}
                            placeholder="Ejemplo: Ordenadores portátiles"
                            className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                        />

                        {errors.name && (
                            <p className="mt-2 text-sm text-red-600">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="slug"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Slug
                        </label>

                        <input
                            id="slug"
                            name="slug"
                            type="text"
                            value={values.slug}
                            onChange={handleSlugChange}
                            disabled={isSubmitting}
                            placeholder="ordenadores-portatiles"
                            className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                        />

                        {errors.slug && (
                            <p className="mt-2 text-sm text-red-600">
                                {errors.slug}
                            </p>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <label
                            htmlFor="description"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Descripción
                        </label>

                        <textarea
                            id="description"
                            name="description"
                            rows={5}
                            value={values.description}
                            onChange={handleTextChange}
                            disabled={isSubmitting}
                            placeholder="Describe los productos que pertenecen a esta categoría."
                            className="w-full resize-y rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label
                            htmlFor="image"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            URL de imagen
                        </label>

                        <input
                            id="image"
                            name="image"
                            type="url"
                            value={values.image}
                            onChange={handleTextChange}
                            disabled={isSubmitting}
                            placeholder="https://example.com/category.jpg"
                            className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                        />

                        {errors.image && (
                            <p className="mt-2 text-sm text-red-600">
                                {errors.image}
                            </p>
                        )}

                        {values.image.trim() &&
                            !errors.image &&
                            isValidUrl(values.image.trim()) && (
                                <div className="mt-4 h-40 w-full max-w-sm overflow-hidden rounded-md border border-gray-200 bg-gray-100">
                                    <img
                                        src={values.image.trim()}
                                        alt="Vista previa de la categoría"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            )}
                    </div>
                </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">
                    Configuración
                </h2>

                <label className="mt-5 flex cursor-pointer items-start gap-3">
                    <input
                        name="isActive"
                        type="checkbox"
                        checked={values.isActive}
                        onChange={handleCheckboxChange}
                        disabled={isSubmitting}
                        className="mt-1 h-4 w-4 rounded border-gray-300"
                    />

                    <span>
                        <span className="block text-sm font-medium text-gray-800">
                            Categoría activa
                        </span>

                        <span className="block text-sm text-gray-500">
                            Las categorías inactivas no se mostrarán en el
                            catálogo público.
                        </span>
                    </span>
                </label>
            </section>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Cancelar
                </button>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isSubmitting ? "Guardando..." : submitLabel}
                </button>
            </div>
        </form>
    );
};
