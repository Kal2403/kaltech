import { Link } from "react-router-dom";
import { FiArrowRight, FiBox, FiDollarSign, FiLayers, FiShoppingBag } from "react-icons/fi";
import { DashboardStatCard } from "../../components/admin/DashboardStatCard";
import { ROUTES } from "../../routes/paths";

const dashboardStats = [
    { title: "Productos", value: 0, description: "Disponibles en la tienda", icon: FiBox },
    { title: "Categorías", value: 0, description: "Registradas en el catálogo", icon: FiLayers },
    { title: "Órdenes", value: 0, description: "Realizadas por clientes", icon: FiShoppingBag },
    { title: "Ingresos", value: "$0.00", description: "De órdenes completadas", icon: FiDollarSign },
];

const managementLinks = [
    { title: "Gestionar productos", description: "Crea, revisa y actualiza los productos del catálogo.", path: ROUTES.adminProducts, icon: FiBox },
    { title: "Gestionar categorías", description: "Organiza los productos mediante categorías claras.", path: ROUTES.adminCategories, icon: FiLayers },
    { title: "Gestionar órdenes", description: "Consulta pedidos y actualiza su estado operativo.", path: ROUTES.adminOrders, icon: FiShoppingBag },
];

export const DashboardPage = () => (
    <section>
        <header className="relative overflow-hidden rounded-[2rem] bg-[#07172b] px-7 py-9 text-white sm:px-10">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-600/25 blur-3xl" />
            <div className="relative">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-300">Resumen administrativo</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Panel de control</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">Supervisa las áreas principales de KalTech y accede a cada módulo de gestión.</p>
            </div>
        </header>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {dashboardStats.map((stat) => <DashboardStatCard key={stat.title} {...stat} />)}
        </div>

        <div className="mt-10">
            <div><p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Accesos directos</p><h2 className="mt-2 text-2xl font-black text-slate-950">Gestión de la tienda</h2></div>
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {managementLinks.map(({ title, description, path, icon: Icon }) => (
                    <Link key={path} to={path} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white"><Icon aria-hidden="true" /></span>
                        <h3 className="mt-5 text-xl font-black text-slate-950">{title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                        <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-600">Abrir módulo <FiArrowRight aria-hidden="true" /></span>
                    </Link>
                ))}
            </div>
        </div>

        <div className="mt-10 rounded-2xl border border-blue-100 bg-blue-50 p-6">
            <h2 className="text-lg font-black text-blue-950">Métricas pendientes de conexión</h2>
            <p className="mt-2 text-sm leading-6 text-blue-900/75">Las estadísticas actuales son marcadores visuales. Los datos reales se conectarán mediante el servicio administrativo en una fase posterior.</p>
        </div>
    </section>
);
