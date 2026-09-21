import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
    FiUser,
    FiMapPin,
    FiPackage,
    FiLock,
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiCheck,
    FiAlertCircle,
    FiArrowRight,
    FiX,
} from "react-icons/fi";
import { useProfile } from "../hooks/useProfile";
import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "../routes/paths";
import type { AddressInput, UserAddress } from "../types/user.types";

const emptyAddressInput: AddressInput = {
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "España",
    phone: "",
    isDefault: false,
};

export const ProfilePage = () => {
    const { user } = useAuth();
    const {
        profile,
        addresses,
        isLoading,
        isMutating,
        error,
        successMessage,
        updateProfile,
        changePassword,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        clearMessages,
    } = useProfile();

    const [activeTab, setActiveTab] = useState<"account" | "addresses" | "orders">("account");

    // Account Form State
    const [name, setName] = useState(user?.name || "");
    const [phone, setPhone] = useState(profile?.phone || "");

    // Password Form State
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");

    // Address Modal / Form State
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
    const [addressForm, setAddressForm] = useState<AddressInput>(emptyAddressInput);

    const handleProfileSubmit = async (e: FormEvent) => {
        e.preventDefault();
        clearMessages();
        try {
            await updateProfile({ name, phone });
        } catch {
            // Error is handled in hook
        }
    };

    const handlePasswordSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setPasswordError("");
        clearMessages();

        if (newPassword !== confirmPassword) {
            setPasswordError("Las contraseñas nuevas no coinciden");
            return;
        }

        if (newPassword.length < 8) {
            setPasswordError("La nueva contraseña debe tener al menos 8 caracteres");
            return;
        }

        try {
            await changePassword({ currentPassword, newPassword });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch {
            // Error is handled in hook
        }
    };

    const openAddAddressModal = () => {
        clearMessages();
        setEditingAddressId(null);
        setAddressForm({
            ...emptyAddressInput,
            fullName: user?.name || "",
            phone: profile?.phone || "",
        });
        setIsAddressModalOpen(true);
    };

    const openEditAddressModal = (addr: UserAddress) => {
        clearMessages();
        setEditingAddressId(addr._id);
        setAddressForm({
            fullName: addr.fullName,
            address: addr.address,
            city: addr.city,
            postalCode: addr.postalCode,
            country: addr.country,
            phone: addr.phone,
            isDefault: addr.isDefault,
        });
        setIsAddressModalOpen(true);
    };

    const handleAddressSubmit = async (e: FormEvent) => {
        e.preventDefault();
        clearMessages();

        try {
            if (editingAddressId) {
                await updateAddress(editingAddressId, addressForm);
            } else {
                await addAddress(addressForm);
            }
            setIsAddressModalOpen(false);
        } catch {
            // Error is handled in hook
        }
    };

    const handleDeleteAddress = async (addressId: string) => {
        if (window.confirm("¿Seguro que deseas eliminar esta dirección?")) {
            await deleteAddress(addressId);
        }
    };

    if (isLoading) {
        return (
            <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="flex h-64 items-center justify-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
                </div>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            {/* Header */}
            <div className="border-b border-slate-200 pb-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-black text-white shadow-lg shadow-blue-200">
                            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-950 sm:text-3xl">
                                {user?.name}
                            </h1>
                            <p className="text-sm font-medium text-slate-500">
                                {user?.email} • <span className="capitalize font-bold text-blue-600">{user?.role === "admin" ? "Administrador" : "Cliente"}</span>
                            </p>
                        </div>
                    </div>

                    <Link
                        to={ROUTES.orders}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                    >
                        <FiPackage className="text-base" aria-hidden="true" />
                        Ver mis pedidos
                        <FiArrowRight aria-hidden="true" />
                    </Link>
                </div>

                {/* Tab Navigation */}
                <nav className="mt-8 flex gap-2 border-b border-slate-100" aria-label="Pestañas de perfil">
                    <button
                        type="button"
                        onClick={() => { setActiveTab("account"); clearMessages(); }}
                        className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition ${
                            activeTab === "account"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-slate-500 hover:text-slate-950"
                        }`}
                    >
                        <FiUser aria-hidden="true" />
                        Datos de la cuenta
                    </button>
                    <button
                        type="button"
                        onClick={() => { setActiveTab("addresses"); clearMessages(); }}
                        className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition ${
                            activeTab === "addresses"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-slate-500 hover:text-slate-950"
                        }`}
                    >
                        <FiMapPin aria-hidden="true" />
                        Libreta de direcciones
                        {addresses.length > 0 && (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                                {addresses.length}
                            </span>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => { setActiveTab("orders"); clearMessages(); }}
                        className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition ${
                            activeTab === "orders"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-slate-500 hover:text-slate-950"
                        }`}
                    >
                        <FiPackage aria-hidden="true" />
                        Mis pedidos
                    </button>
                </nav>
            </div>

            {/* Global Alerts */}
            {successMessage && (
                <div role="status" className="mt-6 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
                    <FiCheck className="shrink-0 text-emerald-600" aria-hidden="true" />
                    <span>{successMessage}</span>
                </div>
            )}
            {error && (
                <div role="alert" className="mt-6 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-800">
                    <FiAlertCircle className="shrink-0 text-red-600" aria-hidden="true" />
                    <span>{error}</span>
                </div>
            )}

            {/* Tab 1: Account Information & Password */}
            {activeTab === "account" && (
                <div className="mt-8 grid gap-8 md:grid-cols-2">
                    {/* Personal Data Form */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
                            <FiUser className="text-lg text-blue-600" aria-hidden="true" />
                            <h2 className="text-lg font-black text-slate-950">Información Personal</h2>
                        </div>

                        <form onSubmit={handleProfileSubmit} className="mt-6 space-y-4">
                            <div>
                                <label htmlFor="profile-name" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Nombre completo
                                </label>
                                <input
                                    id="profile-name"
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-semibold text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="profile-email" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Correo electrónico
                                </label>
                                <input
                                    id="profile-email"
                                    type="email"
                                    disabled
                                    value={user?.email || ""}
                                    className="mt-1.5 min-h-11 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-3.5 text-sm font-medium text-slate-500"
                                />
                                <p className="mt-1 text-[0.7rem] text-slate-400">El correo electrónico no se puede modificar.</p>
                            </div>

                            <div>
                                <label htmlFor="profile-phone" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Teléfono
                                </label>
                                <input
                                    id="profile-phone"
                                    type="tel"
                                    placeholder="+34 600 000 000"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-semibold text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isMutating}
                                className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:bg-slate-300"
                            >
                                {isMutating ? "Guardando..." : "Guardar cambios"}
                            </button>
                        </form>
                    </div>

                    {/* Change Password Form */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
                            <FiLock className="text-lg text-blue-600" aria-hidden="true" />
                            <h2 className="text-lg font-black text-slate-950">Cambiar Contraseña</h2>
                        </div>

                        {passwordError && (
                            <div role="alert" className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">
                                <FiAlertCircle aria-hidden="true" />
                                {passwordError}
                            </div>
                        )}

                        <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
                            <div>
                                <label htmlFor="current-pw" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Contraseña actual
                                </label>
                                <input
                                    id="current-pw"
                                    type="password"
                                    required
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-semibold text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="new-pw" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Nueva contraseña (mínimo 8 caracteres)
                                </label>
                                <input
                                    id="new-pw"
                                    type="password"
                                    required
                                    minLength={8}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-semibold text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="confirm-pw" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Confirmar nueva contraseña
                                </label>
                                <input
                                    id="confirm-pw"
                                    type="password"
                                    required
                                    minLength={8}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-semibold text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isMutating}
                                className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:bg-slate-300"
                            >
                                {isMutating ? "Actualizando..." : "Actualizar contraseña"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Tab 2: Addresses Management */}
            {activeTab === "addresses" && (
                <div className="mt-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-black text-slate-950">Mis Direcciones de Envío</h2>
                            <p className="text-sm text-slate-500">Gestiona tus direcciones guardadas para agilizar tus compras.</p>
                        </div>
                        <button
                            type="button"
                            onClick={openAddAddressModal}
                            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700"
                        >
                            <FiPlus className="text-sm" aria-hidden="true" />
                            Añadir dirección
                        </button>
                    </div>

                    {addresses.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 p-12 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-2xl text-blue-600">
                                <FiMapPin aria-hidden="true" />
                            </div>
                            <h3 className="mt-4 text-lg font-black text-slate-950">No tienes direcciones guardadas</h3>
                            <p className="mt-1 text-sm text-slate-500">Agrega una dirección para no tener que escribirla en cada compra.</p>
                            <button
                                type="button"
                                onClick={openAddAddressModal}
                                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700"
                            >
                                <FiPlus aria-hidden="true" />
                                Añadir mi primera dirección
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {addresses.map((addr) => (
                                <div
                                    key={addr._id}
                                    className={`relative flex flex-col justify-between rounded-2xl border p-5 transition ${
                                        addr.isDefault
                                            ? "border-blue-600 bg-blue-50/20 ring-1 ring-blue-600"
                                            : "border-slate-200 bg-white hover:border-slate-300 shadow-sm"
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="font-black text-slate-950">{addr.fullName}</h3>
                                            {addr.isDefault && (
                                                <span className="rounded-md bg-blue-600 px-2 py-0.5 text-[0.65rem] font-black uppercase tracking-wider text-white">
                                                    Predeterminada
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                                            {addr.address}<br />
                                            {addr.postalCode} {addr.city}, {addr.country}
                                        </p>
                                        <p className="mt-2 text-xs font-semibold text-slate-500">
                                            Teléfono: <span className="text-slate-800">{addr.phone}</span>
                                        </p>
                                    </div>

                                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                                        {!addr.isDefault ? (
                                            <button
                                                type="button"
                                                onClick={() => setDefaultAddress(addr._id)}
                                                className="font-bold text-blue-600 hover:text-blue-800"
                                            >
                                                Hacer predeterminada
                                            </button>
                                        ) : (
                                            <span className="text-slate-400 font-medium">Principal</span>
                                        )}

                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => openEditAddressModal(addr)}
                                                className="inline-flex items-center gap-1 font-bold text-slate-600 hover:text-slate-950"
                                                aria-label={`Editar dirección ${addr.address}`}
                                            >
                                                <FiEdit2 className="text-xs" aria-hidden="true" />
                                                Editar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteAddress(addr._id)}
                                                className="inline-flex items-center gap-1 font-bold text-red-600 hover:text-red-800"
                                                aria-label={`Eliminar dirección ${addr.address}`}
                                            >
                                                <FiTrash2 className="text-xs" aria-hidden="true" />
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Tab 3: Orders Summary */}
            {activeTab === "orders" && (
                <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl text-blue-600">
                        <FiPackage aria-hidden="true" />
                    </div>
                    <h2 className="mt-4 text-2xl font-black text-slate-950">Historial de Pedidos</h2>
                    <p className="mt-2 max-w-md mx-auto text-sm text-slate-500">
                        Consulta el estado de entrega, detalles de compra y recibos de todos tus pedidos realizados en KalTech.
                    </p>
                    <Link
                        to={ROUTES.orders}
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700"
                    >
                        Ver todos mis pedidos
                        <FiArrowRight aria-hidden="true" />
                    </Link>
                </div>
            )}

            {/* Address Modal (Create / Edit) */}
            {isAddressModalOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="address-modal-title"
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
                >
                    <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <h3 id="address-modal-title" className="text-lg font-black text-slate-950">
                                {editingAddressId ? "Editar Dirección" : "Añadir Nueva Dirección"}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsAddressModalOpen(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                aria-label="Cerrar modal"
                            >
                                <FiX className="text-lg" aria-hidden="true" />
                            </button>
                        </div>

                        <form onSubmit={handleAddressSubmit} className="mt-5 space-y-3.5">
                            <div>
                                <label className="text-xs font-bold text-slate-700">Nombre completo</label>
                                <input
                                    required
                                    type="text"
                                    value={addressForm.fullName}
                                    onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                                    placeholder="Juan Pérez"
                                    className="mt-1 min-h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-950 outline-none focus:border-blue-500 focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700">Dirección (calle y número)</label>
                                <input
                                    required
                                    type="text"
                                    value={addressForm.address}
                                    onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                                    placeholder="Calle Mayor 10, 2B"
                                    className="mt-1 min-h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-950 outline-none focus:border-blue-500 focus:bg-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-700">Ciudad</label>
                                    <input
                                        required
                                        type="text"
                                        value={addressForm.city}
                                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                        placeholder="Madrid"
                                        className="mt-1 min-h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-950 outline-none focus:border-blue-500 focus:bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-700">Código Postal</label>
                                    <input
                                        required
                                        type="text"
                                        value={addressForm.postalCode}
                                        onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                                        placeholder="28001"
                                        className="mt-1 min-h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-950 outline-none focus:border-blue-500 focus:bg-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-700">País</label>
                                    <input
                                        required
                                        type="text"
                                        value={addressForm.country}
                                        onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                                        placeholder="España"
                                        className="mt-1 min-h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-950 outline-none focus:border-blue-500 focus:bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-700">Teléfono</label>
                                    <input
                                        required
                                        type="tel"
                                        value={addressForm.phone}
                                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                                        placeholder="+34 600 000 000"
                                        className="mt-1 min-h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-950 outline-none focus:border-blue-500 focus:bg-white"
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className="flex cursor-pointer items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={addressForm.isDefault}
                                        onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-xs font-semibold text-slate-700">Marcar como dirección predeterminada</span>
                                </label>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAddressModalOpen(false)}
                                    className="min-h-10 flex-1 rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-700 hover:bg-slate-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isMutating}
                                    className="min-h-10 flex-1 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white transition hover:bg-blue-700 disabled:bg-slate-300"
                                >
                                    {isMutating ? "Guardando..." : "Guardar dirección"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
};
