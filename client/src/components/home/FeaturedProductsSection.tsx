const featuredProducts = [
    {
        name: "MacBook Pro M4",
        category: "Laptop",
        price: 2299,
        oldPrice: 2499,
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
    },
    {
        name: "iPhone Pro Max",
        category: "Smartphone",
        price: 1199,
        oldPrice: 1299,
        image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab",
    },
    {
        name: "Gaming Headset",
        category: "Audio",
        price: 149,
        oldPrice: 199,
        image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb",
    },
    {
        name: "Smart Watch Ultra",
        category: "Smartwatch",
        price: 399,
        oldPrice: 499,
        image: "https://images.unsplash.com/photo-1544117519-31a4b719223d",
    },
];

export const FeaturedProductsSection = () => {
    return (
        <section className="bg-white px-4 py-16">
            <div className="mx-auto max-w-7xl">
                <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <p className="text-sm font-black uppercase tracking-wide text-blue-600">
                            Productos destacados
                        </p>
                        <h2 className="mt-2 text-4xl font-black text-slate-950">
                            Tecnología recomendada
                        </h2>
                        <p className="mt-3 max-w-xl text-lg text-slate-600">
                            Selección especial de productos populares para productividad,
                            gaming y uso diario.
                        </p>
                    </div>

                    <a
                        href="/products"
                        className="font-bold text-blue-600 underline hover:text-blue-700"
                    >
                        Ver todos
                    </a>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {featuredProducts.map((product) => (
                        <article
                            key={product.name}
                            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-blue-500 hover:shadow-xl"
                        >
                            <div className="aspect-square bg-slate-100 p-5">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="h-full w-full rounded-xl object-cover transition group-hover:scale-105"
                                />
                            </div>

                            <div className="p-5">
                                <p className="text-sm font-bold text-blue-600">
                                    {product.category}
                                </p>

                                <h3 className="mt-2 text-lg font-black text-slate-950">
                                    {product.name}
                                </h3>

                                <div className="mt-4 flex items-center gap-3">
                                    <span className="text-xl font-black text-slate-950">
                                        ${product.price}
                                    </span>
                                    <span className="text-sm font-semibold text-slate-400 line-through">
                                        ${product.oldPrice}
                                    </span>
                                </div>

                                <button className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700">
                                    Agregar al carrito
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
};
