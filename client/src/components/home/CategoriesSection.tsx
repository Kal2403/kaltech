import { FiHeadphones, FiMonitor, FiSmartphone, FiWatch } from "react-icons/fi";
import { IoGameControllerOutline } from "react-icons/io5";

const categories = [
    {
        name: "Celulares",
        icon: <FiSmartphone />,
    },
    {
        name: "Audio",
        icon: <FiHeadphones />,
    },
    {
        name: "Computadores",
        icon: <FiMonitor />,
    },
    {
        name: "Smartwatch",
        icon: <FiWatch />,
    },
    {
        name: "Accesorios",
        icon: <IoGameControllerOutline />,
    },
];

export const CategoriesSection = () => {
    return (
        <section className="bg-slate-50 px-4 py-14">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8">
                    <h2 className="text-4xl font-black text-slate-950">
                        Compra por categoría
                    </h2>

                    <p className="mt-3 max-w-lg text-xl leading-snug text-slate-600">
                        Encuentra rápido lo que necesitas para trabajar, estudiar y
                        disfrutar.
                    </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
                    {categories.map((category) => (
                        <article
                            key={category.name}
                            className="group rounded-xl border border-slate-200 bg-white px-6 py-8 text-center shadow-sm transition hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg"
                        >
                            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-blue-100 text-6xl text-blue-700 transition group-hover:bg-blue-600 group-hover:text-white">
                                {category.icon}
                            </div>

                            <h3 className="mt-6 min-h-14 text-xl font-black leading-tight text-slate-950">
                                {category.name}
                            </h3>

                            <a
                                href="/products"
                                className="mt-2 inline-block text-sm font-bold text-blue-600 underline hover:text-blue-700"
                            >
                                Ver colección
                            </a>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
};
