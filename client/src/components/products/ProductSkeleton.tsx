export const ProductSkeleton = ({ count = 8 }: { count?: number }) => (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-label="Cargando productos" aria-busy="true">
        {Array.from({ length: count }).map((_, index) => (
            <article key={index} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="aspect-[4/3] animate-pulse bg-slate-200" />
                <div className="space-y-4 p-5">
                    <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
                    <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200" />
                    <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                    <div className="h-7 w-24 animate-pulse rounded bg-slate-200" />
                    <div className="h-11 w-full animate-pulse rounded-xl bg-slate-200" />
                </div>
            </article>
        ))}
    </div>
);
