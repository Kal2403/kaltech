import { Link } from "react-router-dom";
import {
    FiBox,
    FiDollarSign,
    FiLayers,
    FiShoppingBag,
} from "react-icons/fi";

import { DashboardStatCard } from "../../components/admin/DashboardStatCard";
import { ROUTES } from "../../routes/paths";

const dashboardStats = [
    {
        title: "Total Products",
        value: 0,
        description: "Products available in the store",
        icon: FiBox,
    },
    {
        title: "Total Categories",
        value: 0,
        description: "Product categories registered",
        icon: FiLayers,
    },
    {
        title: "Total Orders",
        value: 0,
        description: "Orders placed by customers",
        icon: FiShoppingBag,
    },
    {
        title: "Total Revenue",
        value: "$0.00",
        description: "Revenue generated from completed orders",
        icon: FiDollarSign,
    },
];

const managementLinks = [
    {
        title: "Manage Products",
        description:
            "Create, update, review, and remove products from the catalog.",
        path: ROUTES.adminProducts,
        icon: FiBox,
    },
    {
        title: "Manage Categories",
        description:
            "Organize products by creating and maintaining categories.",
        path: ROUTES.adminCategories,
        icon: FiLayers,
    },
    {
        title: "Manage Orders",
        description:
            "Review customer orders and monitor their current status.",
        path: ROUTES.adminOrders,
        icon: FiShoppingBag,
    },
];

export const DashboardPage = () => {
    return (
        <section>
            <div className="mb-8">
                <p className="text-sm font-black uppercase tracking-wide text-blue-600">
                    Overview
                </p>

                <h2 className="mt-2 text-3xl font-black text-slate-950">
                    Dashboard
                </h2>

                <p className="mt-3 max-w-2xl text-slate-600">
                    Monitor the main areas of KalTech and access the
                    administrative management modules.
                </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {dashboardStats.map((stat) => (
                    <DashboardStatCard
                        key={stat.title}
                        title={stat.title}
                        value={stat.value}
                        description={stat.description}
                        icon={stat.icon}
                    />
                ))}
            </div>

            <div className="mt-10">
                <div className="mb-6">
                    <h2 className="text-2xl font-black text-slate-950">
                        Management
                    </h2>

                    <p className="mt-2 text-slate-600">
                        Access the main administration areas.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {managementLinks.map((managementLink) => {
                        const Icon = managementLink.icon;

                        return (
                            <Link
                                key={managementLink.path}
                                to={managementLink.path}
                                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                                    <Icon />
                                </div>

                                <h3 className="mt-5 text-xl font-black text-slate-950">
                                    {managementLink.title}
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    {managementLink.description}
                                </p>

                                <span className="mt-5 inline-flex text-sm font-bold text-blue-600">
                                    Open module →
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            <div className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-6">
                <h2 className="text-lg font-black text-amber-900">
                    Dashboard metrics pending
                </h2>

                <p className="mt-2 text-sm leading-6 text-amber-800">
                    The current statistics are placeholders. Real product,
                    category, order, and revenue data will be connected through
                    the administrative API service in a later step.
                </p>
            </div>
        </section>
    );
};
