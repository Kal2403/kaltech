import { Link } from "react-router-dom";

export const EmptyCart = () => {
    return (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <h2 className="text-3xl font-black text-slate-950">
                Tu Carrito esta vacio
            </h2>

            <p className="mx-auto mt-3 max-w-md text-slate-600">
                Agrega productos al carrito para continuar con tu compra.
            </p>

            <Link
                to="/products"
                className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
            >
                Explora productos
            </Link>
        </div>
    );
};
