export const Footer = () => {
    return (
        <footer className="border-t bg-slate-950 text-white">
            <div className="mx-auto max-w-7xl px-6 py-8">
                <p className="text-sm text-slate-300">
                    © {new Date().getFullYear()} KalTechGroup. All rights reserved.
                </p>
            </div>
        </footer>
    )
}