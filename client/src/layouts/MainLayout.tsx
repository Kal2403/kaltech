import { Outlet } from "react-router-dom";

import { Footer } from "../components/common/Footer";
import { Navbar } from "../components/common/Navbar";

export const MainLayout = () => {
    return (
        <div className="flex min-h-screen flex-col bg-[#f6f9fd] text-slate-800">
            <Navbar />
            <main className="flex-1 overflow-hidden">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}
