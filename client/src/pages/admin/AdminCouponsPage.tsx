import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
    FiCheck,
    FiPlus,
    FiRefreshCw,
    FiTag,
    FiX,
} from "react-icons/fi";

import {
    createCoupon,
    getAdminCoupons,
    updateCoupon,
} from "../../services/coupon/coupon.service";
import type { Coupon, CreateCouponPayload } from "../../types/coupon.types";

const initialForm: CreateCouponPayload = {
    code: "",
    discountPercent: 10,
    description: "",
    minOrderAmount: 0,
    maxDiscountAmount: undefined,
    maxUses: undefined,
    validUntil: "",
    isActive: true,
};

export const AdminCouponsPage = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState<CreateCouponPayload>(initialForm);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [actionId, setActionId] = useState<string | null>(null);

    const fetchCoupons = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getAdminCoupons();
            setCoupons(data);
        } catch (err: unknown) {
            let msg = "Error al cargar los cupones";
            if (axios.isAxiosError(err) && err.response?.data?.message) {
                msg = err.response.data.message;
            }
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void fetchCoupons();
        }, 0);
        return () => window.clearTimeout(timer);
    }, [fetchCoupons]);

    const handleToggleStatus = async (coupon: Coupon) => {
        try {
            setActionId(coupon._id);
            setSuccessMessage(null);
            const updated = await updateCoupon(coupon._id, {
                isActive: !coupon.isActive,
            });
            setCoupons((prev) =>
                prev.map((c) => (c._id === updated._id ? updated : c))
            );
            setSuccessMessage(
                `Cupón ${updated.code} ${updated.isActive ? "activado" : "desactivado"} exitosamente.`
            );
        } catch (err: unknown) {
            let msg = "Error al actualizar el cupón";
            if (axios.isAxiosError(err) && err.response?.data?.message) {
                msg = err.response.data.message;
            }
            setError(msg);
        } finally {
            setActionId(null);
        }
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            setError(null);

            const payload: CreateCouponPayload = {
                code: formData.code.trim().toUpperCase(),
                discountPercent: Number(formData.discountPercent),
                description: formData.description?.trim() || undefined,
                minOrderAmount: formData.minOrderAmount
                    ? Number(formData.minOrderAmount)
                    : 0,
                maxDiscountAmount: formData.maxDiscountAmount
                    ? Number(formData.maxDiscountAmount)
                    : undefined,
                maxUses: formData.maxUses ? Number(formData.maxUses) : undefined,
                validUntil: formData.validUntil ? formData.validUntil : undefined,
                isActive: formData.isActive,
            };

            const created = await createCoupon(payload);
            setCoupons((prev) => [created, ...prev]);
            setShowCreateModal(false);
            setFormData(initialForm);
            setSuccessMessage(`Cupón ${created.code} creado exitosamente.`);
        } catch (err: unknown) {
            let msg = "Error al crear el cupón";
            if (axios.isAxiosError(err) && err.response?.data?.message) {
                msg = err.response.data.message;
            }
            setError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="space-y-6">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-950">
                        Cupones y Promociones
                    </h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Administra cupones de descuento, límites de uso y promociones de la tienda.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => void fetchCoupons()}
                        disabled={isLoading}
                        aria-label="Recargar cupones"
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
                    >
                        <FiRefreshCw className={isLoading ? "animate-spin" : ""} />
                        Refrescar
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setFormData(initialForm);
                            setError(null);
                            setShowCreateModal(true);
                        }}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                        <FiPlus />
                        Crear cupón
                    </button>
                </div>
            </header>

            {successMessage && (
                <div
                    role="status"
                    className="flex items-start justify-between gap-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
                >
                    <p className="font-medium">{successMessage}</p>
                    <button
                        type="button"
                        onClick={() => setSuccessMessage(null)}
                        aria-label="Cerrar mensaje de éxito"
                        className="rounded-lg p-1 text-green-700 transition hover:bg-green-100"
                    >
                        <FiX />
                    </button>
                </div>
            )}

            {error && (
                <div
                    role="alert"
                    className="flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    <p className="font-medium">{error}</p>
                    <button
                        type="button"
                        onClick={() => setError(null)}
                        aria-label="Cerrar mensaje de error"
                        className="rounded-lg p-1 text-red-700 transition hover:bg-red-100"
                    >
                        <FiX />
                    </button>
                </div>
            )}

            {/* Modal de Creación */}
            {showCreateModal && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="create-coupon-modal-title"
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
                >
                    <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <h2
                                id="create-coupon-modal-title"
                                className="text-xl font-black text-slate-950"
                            >
                                Nuevo Cupón de Descuento
                            </h2>
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                aria-label="Cerrar ventana modal"
                                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <FiX className="text-xl" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="mt-5 space-y-4">
                            <div>
                                <label
                                    htmlFor="coupon-code"
                                    className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                                >
                                    Código del cupón *
                                </label>
                                <input
                                    id="coupon-code"
                                    type="text"
                                    required
                                    value={formData.code}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            code: e.target.value.toUpperCase(),
                                        }))
                                    }
                                    placeholder="Ej: VERANO20"
                                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold uppercase tracking-wider text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label
                                        htmlFor="coupon-percent"
                                        className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                                    >
                                        Descuento (%) *
                                    </label>
                                    <input
                                        id="coupon-percent"
                                        type="number"
                                        min={1}
                                        max={99}
                                        required
                                        value={formData.discountPercent}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                discountPercent: Number(e.target.value),
                                            }))
                                        }
                                        className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="coupon-min-order"
                                        className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                                    >
                                        Monto mínimo ($)
                                    </label>
                                    <input
                                        id="coupon-min-order"
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        value={formData.minOrderAmount ?? ""}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                minOrderAmount: e.target.value
                                                    ? Number(e.target.value)
                                                    : 0,
                                            }))
                                        }
                                        placeholder="0 (Sin mínimo)"
                                        className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label
                                        htmlFor="coupon-max-discount"
                                        className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                                    >
                                        Tope máximo ($)
                                    </label>
                                    <input
                                        id="coupon-max-discount"
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        value={formData.maxDiscountAmount ?? ""}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                maxDiscountAmount: e.target.value
                                                    ? Number(e.target.value)
                                                    : undefined,
                                            }))
                                        }
                                        placeholder="Opcional"
                                        className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="coupon-max-uses"
                                        className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                                    >
                                        Límite de usos
                                    </label>
                                    <input
                                        id="coupon-max-uses"
                                        type="number"
                                        min={1}
                                        value={formData.maxUses ?? ""}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                maxUses: e.target.value
                                                    ? Number(e.target.value)
                                                    : undefined,
                                            }))
                                        }
                                        placeholder="Ilimitado"
                                        className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="coupon-valid-until"
                                    className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                                >
                                    Válido hasta
                                </label>
                                <input
                                    id="coupon-valid-until"
                                    type="date"
                                    value={formData.validUntil ?? ""}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            validUntil: e.target.value || undefined,
                                        }))
                                    }
                                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="coupon-description"
                                    className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                                >
                                    Descripción
                                </label>
                                <input
                                    id="coupon-description"
                                    type="text"
                                    value={formData.description ?? ""}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            description: e.target.value,
                                        }))
                                    }
                                    placeholder="Ej: Descuento de temporada"
                                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    id="coupon-active"
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            isActive: e.target.checked,
                                        }))
                                    }
                                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label
                                    htmlFor="coupon-active"
                                    className="text-sm font-bold text-slate-700"
                                >
                                    Activar cupón inmediatamente
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {isSubmitting ? "Creando..." : "Crear cupón"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Listado de Cupones */}
            {isLoading ? (
                <div
                    role="status"
                    aria-busy="true"
                    className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white"
                >
                    <span
                        aria-hidden="true"
                        className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"
                    />
                    <p className="text-sm font-semibold text-slate-600">
                        Cargando cupones...
                    </p>
                </div>
            ) : coupons.length === 0 ? (
                <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600">
                        <FiTag />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-slate-900">
                        No hay cupones registrados
                    </h3>
                    <p className="mt-1 max-w-sm text-sm text-slate-500">
                        Crea tu primer cupón de descuento para incentivar compras en tu tienda.
                    </p>
                    <button
                        type="button"
                        onClick={() => setShowCreateModal(true)}
                        className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
                    >
                        Crear primer cupón
                    </button>
                </div>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="border-b border-slate-200 bg-slate-50/75 text-xs font-black uppercase tracking-wider text-slate-500">
                                <tr>
                                    <th scope="col" className="px-6 py-4">Código</th>
                                    <th scope="col" className="px-6 py-4">Descuento</th>
                                    <th scope="col" className="px-6 py-4">Monto Mínimo</th>
                                    <th scope="col" className="px-6 py-4">Usos</th>
                                    <th scope="col" className="px-6 py-4">Vigencia</th>
                                    <th scope="col" className="px-6 py-4">Estado</th>
                                    <th scope="col" className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {coupons.map((coupon) => (
                                    <tr key={coupon._id} className="transition hover:bg-slate-50/60">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 font-mono text-xs font-black text-blue-800">
                                                    {coupon.code}
                                                </span>
                                            </div>
                                            {coupon.description && (
                                                <p className="mt-1 text-xs text-slate-400">
                                                    {coupon.description}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-black text-slate-900">
                                                {coupon.discountPercent}% OFF
                                            </span>
                                            {coupon.maxDiscountAmount && (
                                                <p className="text-xs text-slate-400">
                                                    Máx: ${coupon.maxDiscountAmount}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-slate-700">
                                            {coupon.minOrderAmount > 0
                                                ? `$${coupon.minOrderAmount.toFixed(2)}`
                                                : "Sin mínimo"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-slate-800">
                                                {coupon.usedCount}
                                            </span>
                                            <span className="text-slate-400">
                                                {" "}/ {coupon.maxUses ?? "∞"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-slate-500">
                                            {coupon.validUntil
                                                ? new Date(coupon.validUntil).toLocaleDateString()
                                                : "Permanente"}
                                        </td>
                                        <td className="px-6 py-4">
                                            {coupon.isActive ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                                                    <FiCheck className="text-xs" /> Activo
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
                                                    Inactivo
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                type="button"
                                                disabled={actionId === coupon._id}
                                                onClick={() => void handleToggleStatus(coupon)}
                                                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition disabled:opacity-50 ${
                                                    coupon.isActive
                                                        ? "border border-amber-200 text-amber-700 hover:bg-amber-50"
                                                        : "border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                                }`}
                                            >
                                                {actionId === coupon._id
                                                    ? "..."
                                                    : coupon.isActive
                                                    ? "Desactivar"
                                                    : "Activar"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </section>
    );
};
