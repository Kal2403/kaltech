export const NewsletterSection = () => {
    return (
        <section className="bg-slate-50 px-4 py-16">
            <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-slate-950 px-8 py-14 text-white md:px-14">
                <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                    <div>
                        <p className="text-sm font-black uppercase tracking-wide text-blue-400">
                            Mantente actualizado
                        </p>

                        <h2 className="mt-3 text-4xl font-black leading-tight md:text-5xl">
                            Recibe ofertas y novedades tecnológicas
                        </h2>

                        <p className="mt-4 max-w-xl text-lg text-slate-300">
                            Suscríbete para recibir descuentos, nuevos lanzamientos y
                            recomendaciones de productos KalTech.
                        </p>
                    </div>

                    <form className="rounded-2xl bg-white p-3 shadow-lg">
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <input
                                type="email"
                                placeholder="Tu correo electrónico"
                                className="min-h-12 flex-1 rounded-xl px-4 text-slate-900 outline-none"
                            />

                            <button
                                type="submit"
                                className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700"
                            >
                                Suscribirme
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
};
