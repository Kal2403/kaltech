import { useCallback, useEffect, useState } from "react";
import axios from "axios";

import {
    getInventoryAlerts,
    restockProduct,
} from "../../services/products/product.service";
import type {
    InventoryAlertFilter,
    InventorySummary,
    Product,
} from "../../types/product.types";

interface ApiErrorResponse {
    message?: string;
}

interface UseInventoryAlertsReturn {
    alerts: Product[];
    summary: InventorySummary | null;
    isLoading: boolean;
    error: string | null;
    filter: InventoryAlertFilter;
    setFilter: (filter: InventoryAlertFilter) => void;
    restockingProductId: string | null;
    refreshAlerts: () => Promise<void>;
    restock: (
        productId: string,
        additionalStock: number,
        lowStockThreshold?: number
    ) => Promise<boolean>;
}

const getErrorMessage = (
    error: unknown,
    fallbackMessage: string
): string => {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallbackMessage;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return fallbackMessage;
};

export const useInventoryAlerts = (): UseInventoryAlertsReturn => {
    const [alerts, setAlerts] = useState<Product[]>([]);
    const [summary, setSummary] = useState<InventorySummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<InventoryAlertFilter>("all");
    const [restockingProductId, setRestockingProductId] = useState<string | null>(null);

    const refreshAlerts = useCallback(async (): Promise<void> => {
        try {
            setIsLoading(true);
            setError(null);

            const data = await getInventoryAlerts(filter);
            setAlerts(data.alerts);
            setSummary(data.summary);
        } catch (err: unknown) {
            setError(
                getErrorMessage(
                    err,
                    "No se pudieron cargar las alertas de inventario."
                )
            );
        } finally {
            setIsLoading(false);
        }
    }, [filter]);

    const restock = useCallback(
        async (
            productId: string,
            additionalStock: number,
            lowStockThreshold?: number
        ): Promise<boolean> => {
            try {
                setRestockingProductId(productId);
                setError(null);

                await restockProduct(productId, {
                    additionalStock,
                    lowStockThreshold,
                });

                await refreshAlerts();
                return true;
            } catch (err: unknown) {
                setError(
                    getErrorMessage(
                        err,
                        "No se pudo reabastecer el producto."
                    )
                );
                return false;
            } finally {
                setRestockingProductId(null);
            }
        },
        [refreshAlerts]
    );

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void refreshAlerts();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [refreshAlerts]);

    return {
        alerts,
        summary,
        isLoading,
        error,
        filter,
        setFilter,
        restockingProductId,
        refreshAlerts,
        restock,
    };
};
