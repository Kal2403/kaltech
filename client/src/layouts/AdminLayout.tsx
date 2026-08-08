import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";

import { AdminSidebar } from "../components/admin/AdminSidebar";
import { AdminTopbar } from "../components/admin/AdminTopbar";

export const AdminLayout = () => {
    const [isNavigationOpen, setIsNavigationOpen] = useState(false);
    const navigationTriggerRef = useRef<HTMLButtonElement>(null);
    const wasNavigationOpenRef = useRef(false);

    useEffect(() => {
        if (wasNavigationOpenRef.current && !isNavigationOpen) {
            navigationTriggerRef.current?.focus();
        }
        wasNavigationOpenRef.current = isNavigationOpen;
    }, [isNavigationOpen]);

    return (
        <div className="min-h-screen bg-[#f6f9fd] text-slate-800">
            <AdminSidebar
                isOpen={isNavigationOpen}
                onClose={() => setIsNavigationOpen(false)}
            />

            <div className="lg:pl-72">
                <AdminTopbar
                    navigationTriggerRef={navigationTriggerRef}
                    isNavigationOpen={isNavigationOpen}
                    onOpenNavigation={() => setIsNavigationOpen(true)}
                />

                <main className="px-4 py-7 sm:px-6 lg:px-10 lg:py-10">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
