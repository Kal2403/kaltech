import {
    useEffect,
    useState,
    type ChangeEvent,
    type FormEvent,
} from "react";

import type { Category } from "../../../types/category.types";
import {
    getUploadErrorMessage,
    uploadImage,
} from "../../../services/uploads/upload.service";
import type {
    CreateProductPayload,
    Product,
} from "../../../types/product.types";

interface ProductSpecificationField {
    id: string;
    name: string;
    value: string;
}

interface ProductFormValues {
    name: string;
    description: string;
    price: string;
    discountPrice: string;
    stock: string;
    images: string;
    brand: string;
    category: string;
    isFeatured: boolean;
    isActive: boolean;
}

interface ProductFormErrors {
    name?: string;
    description?: string;
    price?: string;
    discountPrice?: string;
    stock?: string;
    images?: string;
    category?: string;
    specs?: string;
}

interface ProductFormProps {
    categories: Category[];
    initialProduct?: Product;
    isSubmitting: boolean;
    submitLabel: string;
    categoriesLoading?: boolean;
    categoriesError?: string | null;
    serverError?: string | null;
    onSubmit: (payload: CreateProductPayload) => Promise<void>;
    onCancel: () => void;
    onRetryCategories?: () => void;
}

const ACCEPTED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_FILES_PER_SELECTION = 5;

const createSpecificationId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const getInitialValues = (
    product?: Product
): ProductFormValues => {
    return {
        name: product?.name ?? "",
        description: product?.description ?? "",
        price: product ? String(product.price) : "",
        discountPrice:
            product?.discountPrice !== undefined
                ? String(product.discountPrice)
                : "",
        stock: product ? String(product.stock) : "",
        images: product?.images.join("\n") ?? "",
        brand: product?.brand ?? "",
        category: product?.category._id ?? "",
        isFeatured: product?.isFeatured ?? false,
        isActive: product?.isActive ?? true,
    };
};

const getInitialSpecifications = (
    product?: Product
): ProductSpecificationField[] => {
    if (!product?.specs) {
        return [];
    }

    return Object.entries(product.specs).map(([name, value]) => ({
        id: createSpecificationId(),
        name,
        value,
    }));
};

const parseImages = (images: string): string[] => {
    return images
        .split(/\r?\n|,/)
        .map((image) => image.trim())
        .filter(Boolean);
};

export const ProductForm = ({
    categories,
    initialProduct,
    isSubmitting,
    submitLabel,
    categoriesLoading = false,
    categoriesError = null,
    serverError = null,
    onSubmit,
    onCancel,
    onRetryCategories,
}: ProductFormProps) => {
    const [values, setValues] = useState<ProductFormValues>(() =>
        getInitialValues(initialProduct)
    );

    const [specifications, setSpecifications] = useState<
        ProductSpecificationField[]
    >(() => getInitialSpecifications(initialProduct));

    const [errors, setErrors] = useState<ProductFormErrors>({});
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [failedUploads, setFailedUploads] = useState<File[]>([]);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setValues(getInitialValues(initialProduct));
            setSpecifications(getInitialSpecifications(initialProduct));
            setErrors({});
            setUploadError(null);
            setFailedUploads([]);
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [initialProduct]);

    const handleTextChange = (
        event: ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
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

    const handleCheckboxChange = (
        event: ChangeEvent<HTMLInputElement>
    ): void => {
        const { name, checked } = event.target;

        setValues((currentValues) => ({
            ...currentValues,
            [name]: checked,
        }));
    };

    const validateImageFiles = (files: File[]): string | null => {
        if (files.length > MAX_FILES_PER_SELECTION) {
            return "Puedes seleccionar un máximo de 5 imágenes cada vez.";
        }

        if (files.some((file) => !ACCEPTED_IMAGE_TYPES.includes(file.type))) {
            return "Solo se permiten imágenes JPEG, PNG o WebP.";
        }

        if (files.some((file) => file.size > MAX_IMAGE_SIZE)) {
            return "Cada imagen debe pesar 5 MiB o menos.";
        }

        return null;
    };

    const uploadProductImages = async (files: File[]): Promise<void> => {
        if (files.length === 0 || isUploading) {
            return;
        }

        setIsUploading(true);
        setUploadError(null);
        setFailedUploads([]);

        const uploadedUrls: string[] = [];
        const failedFiles: File[] = [];
        let lastError: unknown;

        for (const file of files) {
            try {
                const uploadedImage = await uploadImage(file, "product");
                uploadedUrls.push(uploadedImage.url);
            } catch (error: unknown) {
                failedFiles.push(file);
                lastError = error;
            }
        }

        if (uploadedUrls.length > 0) {
            setValues((currentValues) => {
                const images = Array.from(
                    new Set([
                        ...parseImages(currentValues.images),
                        ...uploadedUrls,
                    ])
                );

                return {
                    ...currentValues,
                    images: images.join("\n"),
                };
            });
            setErrors((currentErrors) => ({
                ...currentErrors,
                images: undefined,
            }));
        }

        if (failedFiles.length > 0) {
            setFailedUploads(failedFiles);
            setUploadError(
                failedFiles.length === files.length
                    ? getUploadErrorMessage(lastError)
                    : `${failedFiles.length} imagen(es) no se pudieron subir.`
            );
        }

        setIsUploading(false);
    };

    const handleImageFilesChange = (
        event: ChangeEvent<HTMLInputElement>
    ): void => {
        const files = Array.from(event.target.files ?? []);
        event.target.value = "";

        const validationError = validateImageFiles(files);

        if (validationError) {
            setUploadError(validationError);
            setFailedUploads([]);
            return;
        }

        void uploadProductImages(files);
    };

    const handleAddSpecification = (): void => {
        setSpecifications((currentSpecifications) => [
            ...currentSpecifications,
            {
                id: createSpecificationId(),
                name: "",
                value: "",
            },
        ]);
    };

    const handleSpecificationChange = (
        specificationId: string,
        field: "name" | "value",
        value: string
    ): void => {
        setSpecifications((currentSpecifications) =>
            currentSpecifications.map((specification) =>
                specification.id === specificationId
                    ? {
                          ...specification,
                          [field]: value,
                      }
                    : specification
            )
        );

        setErrors((currentErrors) => ({
            ...currentErrors,
            specs: undefined,
        }));
    };

    const handleRemoveSpecification = (
        specificationId: string
    ): void => {
        setSpecifications((currentSpecifications) =>
            currentSpecifications.filter(
                (specification) =>
                    specification.id !== specificationId
            )
        );
    };

    const validateForm = (): boolean => {
        const validationErrors: ProductFormErrors = {};

        const price = Number(values.price);
        const discountPrice = Number(values.discountPrice);
        const stock = Number(values.stock);
        const images = parseImages(values.images);

        if (!values.name.trim()) {
            validationErrors.name =
                "El nombre del producto es obligatorio.";
        }

        if (!values.description.trim()) {
            validationErrors.description =
                "La descripción es obligatoria.";
        }

        if (!values.price.trim()) {
            validationErrors.price = "El precio es obligatorio.";
        } else if (!Number.isFinite(price) || price < 0) {
            validationErrors.price =
                "El precio debe ser un número mayor o igual que cero.";
        }

        if (
            values.discountPrice.trim() &&
            (!Number.isFinite(discountPrice) ||
                discountPrice < 0)
        ) {
            validationErrors.discountPrice =
                "El precio con descuento debe ser un número válido.";
        } else if (
            values.discountPrice.trim() &&
            discountPrice >= price
        ) {
            validationErrors.discountPrice =
                "El precio con descuento debe ser menor que el precio normal.";
        }

        if (!values.stock.trim()) {
            validationErrors.stock = "El stock es obligatorio.";
        } else if (
            !Number.isInteger(stock) ||
            stock < 0
        ) {
            validationErrors.stock =
                "El stock debe ser un número entero mayor o igual que cero.";
        }

        if (!values.category) {
            validationErrors.category =
                "Debes seleccionar una categoría.";
        }

        if (images.length === 0) {
            validationErrors.images =
                "Debes agregar al menos una imagen.";
        }

        const hasIncompleteSpecification =
            specifications.some((specification) => {
                const hasName = specification.name.trim().length > 0;
                const hasValue =
                    specification.value.trim().length > 0;

                return hasName !== hasValue;
            });

        if (hasIncompleteSpecification) {
            validationErrors.specs =
                "Cada especificación debe tener nombre y valor.";
        }

        setErrors(validationErrors);

        return Object.keys(validationErrors).length === 0;
    };

    const buildSpecifications = (): Record<string, string> | undefined => {
        const specs = specifications.reduce<Record<string, string>>(
            (result, specification) => {
                const name = specification.name.trim();
                const value = specification.value.trim();

                if (name && value) {
                    result[name] = value;
                }

                return result;
            },
            {}
        );

        return Object.keys(specs).length > 0 ? specs : undefined;
    };

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ): Promise<void> => {
        event.preventDefault();

        if (isUploading) {
            return;
        }

        if (!validateForm()) {
            return;
        }

        const payload: CreateProductPayload = {
            name: values.name.trim(),
            description: values.description.trim(),
            price: Number(values.price),
            stock: Number(values.stock),
            images: parseImages(values.images),
            category: values.category,
            isFeatured: values.isFeatured,
            isActive: values.isActive,
        };

        const brand = values.brand.trim();
        const specs = buildSpecifications();

        if (brand) {
            payload.brand = brand;
        }

        if (values.discountPrice.trim()) {
            payload.discountPrice = Number(
                values.discountPrice
            );
        }

        if (specs) {
            payload.specs = specs;
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
                        Introduce los datos principales del producto.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="md:col-span-2">
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
                            onChange={handleTextChange}
                            disabled={isSubmitting}
                            className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                        />

                        {errors.name && (
                            <p className="mt-2 text-sm text-red-600">
                                {errors.name}
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
                            className="w-full resize-y rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                        />

                        {errors.description && (
                            <p className="mt-2 text-sm text-red-600">
                                {errors.description}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="brand"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Marca
                        </label>

                        <input
                            id="brand"
                            name="brand"
                            type="text"
                            value={values.brand}
                            onChange={handleTextChange}
                            disabled={isSubmitting}
                            className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="category"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Categoría
                        </label>

                        <select
                            id="category"
                            name="category"
                            value={values.category}
                            onChange={handleTextChange}
                            disabled={
                                isSubmitting ||
                                categoriesLoading ||
                                categories.length === 0
                            }
                            className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                        >
                            <option value="">
                                {categoriesLoading
                                    ? "Cargando categorías..."
                                    : "Selecciona una categoría"}
                            </option>

                            {categories.map((category) => (
                                <option
                                    key={category._id}
                                    value={category._id}
                                >
                                    {category.name}
                                </option>
                            ))}
                        </select>

                        {errors.category && (
                            <p className="mt-2 text-sm text-red-600">
                                {errors.category}
                            </p>
                        )}

                        {categoriesError && (
                            <div className="mt-2 flex items-center gap-3">
                                <p className="text-sm text-red-600">
                                    {categoriesError}
                                </p>

                                {onRetryCategories && (
                                    <button
                                        type="button"
                                        onClick={onRetryCategories}
                                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                                    >
                                        Reintentar
                                    </button>
                                )}
                            </div>
                        )}

                        {!categoriesLoading &&
                            !categoriesError &&
                            categories.length === 0 && (
                                <p className="mt-2 text-sm text-amber-600">
                                    No hay categorías activas disponibles.
                                </p>
                            )}
                    </div>
                </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Precio e inventario
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Configura el precio y la disponibilidad.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <div>
                        <label
                            htmlFor="price"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Precio
                        </label>

                        <input
                            id="price"
                            name="price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={values.price}
                            onChange={handleTextChange}
                            disabled={isSubmitting}
                            className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                        />

                        {errors.price && (
                            <p className="mt-2 text-sm text-red-600">
                                {errors.price}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="discountPrice"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Precio con descuento
                        </label>

                        <input
                            id="discountPrice"
                            name="discountPrice"
                            type="number"
                            min="0"
                            step="0.01"
                            value={values.discountPrice}
                            onChange={handleTextChange}
                            disabled={isSubmitting}
                            className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                        />

                        {errors.discountPrice && (
                            <p className="mt-2 text-sm text-red-600">
                                {errors.discountPrice}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="stock"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Stock
                        </label>

                        <input
                            id="stock"
                            name="stock"
                            type="number"
                            min="0"
                            step="1"
                            value={values.stock}
                            onChange={handleTextChange}
                            disabled={isSubmitting}
                            className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                        />

                        {errors.stock && (
                            <p className="mt-2 text-sm text-red-600">
                                {errors.stock}
                            </p>
                        )}
                    </div>
                </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Imágenes
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Agrega una URL por línea. También puedes separarlas
                        mediante comas.
                    </p>
                </div>

                <label htmlFor="images" className="sr-only">
                    URLs de imágenes
                </label>

                <textarea
                    id="images"
                    name="images"
                    rows={5}
                    value={values.images}
                    onChange={handleTextChange}
                    disabled={isSubmitting || isUploading}
                    aria-invalid={Boolean(errors.images)}
                    aria-describedby={errors.images ? "images-error" : undefined}
                    placeholder={"https://example.com/image-1.jpg\nhttps://example.com/image-2.jpg"}
                    className="w-full resize-y rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                />

                {errors.images && (
                    <p id="images-error" className="mt-2 text-sm text-red-600">
                        {errors.images}
                    </p>
                )}

                <div className="mt-5">
                    <label
                        htmlFor="product-image-files"
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        Subir imágenes
                    </label>

                    <input
                        id="product-image-files"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handleImageFilesChange}
                        disabled={isSubmitting || isUploading}
                        aria-invalid={Boolean(uploadError)}
                        aria-describedby={
                            isUploading || uploadError
                                ? "product-image-help product-image-upload-status"
                                : "product-image-help"
                        }
                        className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2.5 file:font-semibold file:text-blue-700 hover:file:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                    />

                    <p id="product-image-help" className="mt-2 text-sm text-gray-500">
                        Hasta 5 archivos JPEG, PNG o WebP de 5 MiB cada uno.
                    </p>

                    {isUploading && (
                        <p id="product-image-upload-status" role="status" aria-live="polite" className="mt-2 text-sm font-medium text-blue-600">
                            Subiendo imágenes...
                        </p>
                    )}

                    {uploadError && (
                        <div id="product-image-upload-status" className="mt-2 flex flex-wrap items-center gap-3" role="alert">
                            <p className="text-sm text-red-600">{uploadError}</p>

                            {failedUploads.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => void uploadProductImages(failedUploads)}
                                    disabled={isSubmitting || isUploading}
                                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Reintentar
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Especificaciones
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Agrega características técnicas opcionales.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleAddSpecification}
                        disabled={isSubmitting}
                        className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Agregar especificación
                    </button>
                </div>

                {specifications.length === 0 ? (
                    <p className="rounded-md border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500">
                        No hay especificaciones agregadas.
                    </p>
                ) : (
                    <div className="space-y-4">
                        {specifications.map((specification) => (
                            <div
                                key={specification.id}
                                className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"
                            >
                                <input
                                    type="text"
                                    value={specification.name}
                                    onChange={(event) =>
                                        handleSpecificationChange(
                                            specification.id,
                                            "name",
                                            event.target.value
                                        )
                                    }
                                    disabled={isSubmitting}
                                    placeholder="Ejemplo: Procesador"
                                    aria-label="Nombre de la especificación"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                                />

                                <input
                                    type="text"
                                    value={specification.value}
                                    onChange={(event) =>
                                        handleSpecificationChange(
                                            specification.id,
                                            "value",
                                            event.target.value
                                        )
                                    }
                                    disabled={isSubmitting}
                                    placeholder="Ejemplo: Intel Core i7"
                                    aria-label="Valor de la especificación"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleRemoveSpecification(
                                            specification.id
                                        )
                                    }
                                    disabled={isSubmitting}
                                    className="rounded-md border border-red-200 px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Eliminar
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {errors.specs && (
                    <p className="mt-3 text-sm text-red-600">
                        {errors.specs}
                    </p>
                )}
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">
                    Configuración
                </h2>

                <div className="mt-5 space-y-4">
                    <label className="flex cursor-pointer items-start gap-3">
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
                                Producto activo
                            </span>

                            <span className="block text-sm text-gray-500">
                                Los productos inactivos no deberían mostrarse
                                en el catálogo público.
                            </span>
                        </span>
                    </label>

                    <label className="flex cursor-pointer items-start gap-3">
                        <input
                            name="isFeatured"
                            type="checkbox"
                            checked={values.isFeatured}
                            onChange={handleCheckboxChange}
                            disabled={isSubmitting}
                            className="mt-1 h-4 w-4 rounded border-gray-300"
                        />

                        <span>
                            <span className="block text-sm font-medium text-gray-800">
                                Producto destacado
                            </span>

                            <span className="block text-sm text-gray-500">
                                Permite destacar el producto en secciones
                                especiales de la tienda.
                            </span>
                        </span>
                    </label>
                </div>
            </section>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting || isUploading}
                    className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Cancelar
                </button>

                <button
                    type="submit"
                    disabled={
                        isSubmitting ||
                        isUploading ||
                        categoriesLoading ||
                        categories.length === 0
                    }
                    className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isUploading
                        ? "Subiendo imágenes..."
                        : isSubmitting
                          ? "Guardando..."
                          : submitLabel}
                </button>
            </div>
        </form>
    );
};
