import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiCheck, FiShoppingCart } from "react-icons/fi";
import { useCart } from "../hooks/useCart";
import { useProductDetails } from "../hooks/useProductDetails";

const fallbackImage = "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=85";

export const ProductDetailsPage = () => {
    const { id } = useParams();
    const { product, isLoading, error } = useProductDetails(id);
    const { addItem, isMutating, error: cartError } = useCart();

    if (isLoading) return <main className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6" aria-busy="true"><div className="mx-auto grid max-w-7xl animate-pulse gap-8 rounded-[2rem] border border-slate-200 bg-white p-6 lg:grid-cols-2 lg:p-10"><div className="aspect-square rounded-2xl bg-slate-200" /><div className="space-y-5 py-4"><div className="h-4 w-24 rounded bg-slate-200" /><div className="h-12 w-3/4 rounded bg-slate-200" /><div className="h-20 rounded bg-slate-200" /><div className="h-14 w-40 rounded bg-slate-200" /><div className="h-14 rounded bg-slate-200" /></div></div></main>;

    if (error || !product) return <main className="min-h-screen bg-slate-50 px-4 py-16 sm:px-6"><div role="alert" className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm"><h1 className="text-2xl font-black text-slate-950">No pudimos mostrar este producto</h1><p className="mt-3 font-medium text-red-700">{error ?? "El producto no está disponible."}</p><Link to="/products" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"><FiArrowLeft aria-hidden="true" /> Volver al catálogo</Link></div></main>;

    const finalPrice = product.discountPrice ?? product.price;
    const hasDiscount = product.discountPrice !== undefined && product.discountPrice < product.price;

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
            <div className="mx-auto max-w-7xl">
                <Link to="/products" className="mb-6 inline-flex items-center gap-2 rounded-lg font-bold text-blue-600 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"><FiArrowLeft aria-hidden="true" /> Volver al catálogo</Link>
                <div className="grid gap-8 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.45)] sm:p-8 lg:grid-cols-2 lg:gap-12 lg:p-10">
                    <div className="flex min-h-80 items-center justify-center rounded-2xl bg-slate-50 p-6 sm:min-h-[32rem]">
                        <img src={product.images[0] ?? fallbackImage} alt={product.name} className="max-h-[30rem] h-full w-full object-contain" />
                    </div>
                    <div className="flex flex-col py-2">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">{product.category?.name ?? "Tecnología"}</p>
                        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">{product.name}</h1>
                        {product.brand && <p className="mt-3 text-slate-500">Marca: <span className="font-bold text-blue-600">{product.brand}</span></p>}
                        <p className="mt-6 text-base leading-7 text-slate-600 sm:text-lg">{product.description}</p>
                        <div className="mt-7 flex flex-wrap items-baseline gap-3"><span className="text-4xl font-black text-slate-950">${finalPrice}</span>{hasDiscount && <span className="text-lg font-bold text-slate-400 line-through">${product.price}</span>}</div>
                        <p className={`mt-4 flex items-center gap-2 font-bold ${product.stock > 0 ? "text-emerald-600" : "text-red-600"}`}><span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs text-white ${product.stock > 0 ? "bg-emerald-500" : "bg-red-500"}`}>{product.stock > 0 ? <FiCheck aria-hidden="true" /> : "!"}</span>{product.stock > 0 ? `Disponible: ${product.stock} unidades` : "Sin stock"}</p>

                        {product.specs && Object.keys(product.specs).length > 0 && <section className="mt-8" aria-labelledby="specs-title"><h2 id="specs-title" className="text-xl font-black text-slate-950">Especificaciones</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{Object.entries(product.specs).map(([key, value]) => <div key={key} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-black uppercase tracking-wide text-slate-500">{key}</p><p className="mt-1 font-extrabold text-slate-950">{value}</p></div>)}</div></section>}

                        <button disabled={product.stock <= 0 || isMutating} onClick={() => addItem(product._id, 1)} className="mt-8 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"><FiShoppingCart className="text-xl" aria-hidden="true" />{isMutating ? "Agregando..." : product.stock <= 0 ? "Producto agotado" : "Agregar al carrito"}</button>
                        {cartError && <p role="alert" className="mt-3 text-sm font-semibold text-red-700">{cartError}</p>}

                    </div>
                </div>
            </div>
        </main>
    );
};
