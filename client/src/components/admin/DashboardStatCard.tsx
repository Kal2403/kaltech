import type { IconType } from "react-icons";

interface DashboardStatCardProps {
    title: string;
    value: string | number;
    description: string;
    icon: IconType;
}

export const DashboardStatCard = ({
    title,
    value,
    description,
    icon: Icon,
}: DashboardStatCardProps) => {
    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-200 hover:shadow-lg hover:shadow-slate-200/50">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
                        {title}
                    </p>

                    <p className="mt-3 text-3xl font-black text-slate-950">
                        {value}
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                        {description}
                    </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl text-blue-600">
                    <Icon aria-hidden="true" />
                </div>
            </div>
        </article>
    );
};
