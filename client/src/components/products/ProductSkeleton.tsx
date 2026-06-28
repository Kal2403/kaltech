export const ProductSkeleton = ({count = 8,}: { count?: number; }) => {
    return (
        <div>
            {Array.from({ length: count }).map((_, index) => (
                <article key={index} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="aspect-square animate-pulse bg-slate-200" />

                    <div className="space-y-4 p-5">
                        <div className="h4- w-20 animate-pulse rounded bg-slate-200" />

                        <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200" />

                        <div className="space-y-2">
                            <div className="h-4 animate-pulse rounded bg-slate-200" />
                            <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
                        </div>

                        <div className="h-6 w-24 animate-pulse rounded bg-slate-200" />

                        <div className="h-11 w-full animate-pulse rounded-xl bg-slate-300" />
                    </div>
                </article>
            ))}
        </div>
    );
};
