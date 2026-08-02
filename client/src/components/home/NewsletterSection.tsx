import { FiMail } from "react-icons/fi";

export const NewsletterSection = () => (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#07172b] px-7 py-12 text-white sm:px-12 lg:px-16">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-2xl"><FiMail aria-hidden="true" /></span>
                    <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">Novedades KalTech</h2>
                    <p className="mt-3 max-w-xl text-slate-300">Estamos preparando un espacio para compartir lanzamientos y recomendaciones.</p>
                </div>
                <span className="inline-flex w-fit rounded-full border border-blue-400/30 bg-blue-500/10 px-5 py-2 text-sm font-bold text-blue-200">Próximamente</span>
            </div>
        </div>
    </section>
);
