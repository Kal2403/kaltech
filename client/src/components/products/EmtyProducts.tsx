export const EmtyProducts = () => {
    return (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-16 text-center">
            <h3 className="text-2xl font-black text-slate-950">
                No hay productos disponibles
            </h3>

            <p className="mx-auto mt-3 max-w-md text-slate-600">
                No encontramos productos para mostrar en este momento. Intenta cambiar
                los filtros o vuelve más tarde.
            </p>

            <a href="/" className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700">
                Volver al inicio
            </a>
        </div>
    );
};
