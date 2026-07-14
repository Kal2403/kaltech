import { Outlet } from "react-router-dom";

import { AdminSidebar } from "../components/admin/AdminSidebar";
import { AdminTopbar } from "../components/admin/AdminTopbar";

export const AdminLayout = () => {
    return (
        <div className="min-h-screen bg-slate-100">
            <AdminSidebar />

            <div className="lg:pl-72">
                <AdminTopbar />

                <main className="px-6 py-8 lg:px-10">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
