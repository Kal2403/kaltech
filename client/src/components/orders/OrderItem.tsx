import type { OrderItem as OrderItemType } from "../../types/order.types";

interface OrderItemProps {
    item: OrderItemType;
}

export const OrderItem = ({ item }: OrderItemProps) => {
    const subtotal = item.price * item.quantity;

    return (
        <article className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="h-24 w-24 overflow-hidden rounded-xl bg-slate-100">
                <img
                    src={item.image || "https://placehold.co/200x200?text=KalTech"}
                    alt={item.name}
                    className="h-full w-full object-cover"
                    onError={(event) => {
                        event.currentTarget.src =
                            "https://placehold.co/200x200?text=KalTech";
                    }}
                />
            </div>

            <div className="flex flex-1 flex-col justify-between">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">
                        {item.name}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        Quantity: {item.quantity}
                    </p>

                    <p className="text-sm text-slate-500">
                        Unit price: ${item.price.toFixed(2)}
                    </p>
                </div>

                <div className="mt-3">
                    <p className="text-lg font-black text-slate-950">
                        ${subtotal.toFixed(2)}
                    </p>
                </div>
            </div>
        </article>
    );
}
