import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";

const featuredProducts = [
    { name: "MacBook Pro M4", category: "Laptop", price: 2299, oldPrice: 2499, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=85" },
    { name: "iPhone Pro Max", category: "Smartphone", price: 1199, oldPrice: 1299, image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=900&q=85" },
    { name: "Gaming Headset", category: "Audio", price: 149, oldPrice: 199, image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=900&q=85" },
    { name: "Smart Watch Ultra", category: "Smartwatch", price: 399, oldPrice: 499, image: "https://images.unsplash.com/photo-1544117519-31a4b719223d?auto=format&fit=crop&w=900&q=85" },
];

export const FeaturedProductsSection = () => (
    <section id="offers" className="scroll-mt-24 bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Selección KalTech</p>
                    <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Productos destacados</h2>
                    <p className="mt-3 max-w-xl text-slate-600">Equipos elegidos por su rendimiento, calidad y valor.</p>
                </div>
                <Link to="/products" className="inline-flex items-center gap-2 font-bold text-blue-600 hover:text-blue-700 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600">Ver catálogo <FiArrowRight aria-hidden="true" /></Link>
            </div>

            <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {featuredProducts.map((product) => (
                    <article key={product.name} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70">
                        <div className="aspect-[4/3] overflow-hidden bg-slate-100 p-4">
                            <img src={product.image} alt={product.name} className="h-full w-full rounded-xl object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
                        </div>
                        <div className="p-5">
                            <p className="text-xs font-black uppercase tracking-wider text-blue-600">{product.category}</p>
                            <h3 className="mt-2 text-lg font-black text-slate-950">{product.name}</h3>
                            <div className="mt-4 flex items-baseline gap-2"><span className="text-2xl font-black text-slate-950">${product.price}</span><span className="text-sm font-semibold text-slate-400 line-through">${product.oldPrice}</span></div>
                            <Link to="/products" className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Ver detalles</Link>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    </section>
);
