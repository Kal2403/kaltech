import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import type { CartItem } from '../../types/cart.types';

interface CartItemCardProps { item: CartItem; onUpdateQuantity: (productId: string, quantity: number) => void; onRemove: (productId: string) => void; isMutating: boolean; }
export const CartItemCard = ({ item, onUpdateQuantity, onRemove, isMutating = false }: CartItemCardProps) => {
    const { product } = item;
    const price = product.discountPrice ?? product.price;
    return <article className="grid gap-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_18px_60px_-38px_rgba(15,23,42,0.35)] sm:grid-cols-[132px_minmax(0,1fr)_auto] sm:p-5">
        <div className="aspect-square overflow-hidden rounded-2xl bg-slate-100"><img src={product.images[0] ?? 'https://placehold.co/300x300?text=KalTech'} alt={product.name} onError={(event) => { event.currentTarget.src = 'https://placehold.co/300x300?text=KalTech'; }} className="h-full w-full object-contain p-2" /></div>
        <div className="min-w-0"><p className="text-xs font-black uppercase tracking-wider text-blue-600">{product.brand}</p><h3 className="mt-1 text-lg font-black text-slate-950 sm:text-xl">{product.name}</h3><p className="mt-2 text-sm text-slate-500">{product.stock} unidades disponibles</p>
            <div className="mt-4 inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1" aria-label={`Cantidad de ${product.name}`}>
                <button type="button" aria-label="Disminuir cantidad" disabled={isMutating || item.quantity <= 1} onClick={() => onUpdateQuantity(product._id, item.quantity - 1)} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 transition hover:bg-white hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-35"><FiMinus /></button><span className="min-w-10 text-center font-black" aria-live="polite">{item.quantity}</span><button type="button" aria-label="Aumentar cantidad" disabled={isMutating || item.quantity >= product.stock} onClick={() => onUpdateQuantity(product._id, item.quantity + 1)} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 transition hover:bg-white hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-35"><FiPlus /></button>
            </div>
        </div>
        <div className="flex items-end justify-between gap-4 sm:flex-col sm:items-end"><div className="sm:text-right"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Subtotal</p><p className="mt-1 text-xl font-black text-slate-950">${(price * item.quantity).toFixed(2)}</p></div><button type="button" aria-label={`Eliminar ${product.name} del carrito`} disabled={isMutating} onClick={() => onRemove(product._id)} className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"><FiTrash2 /> <span className="hidden sm:inline">Eliminar</span></button></div>
    </article>;
};
