import type { IOrder, OrderStatus } from "../models/Order.model.js";

const baseEmailLayout = (title: string, previewText: string, content: string): string => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
        table { border-collapse: collapse; width: 100%; }
        td { padding: 0; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f1f5f9; padding: 40px 10px; }
        .main-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px 28px; text-align: center; }
        .brand { font-size: 26px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff; text-decoration: none; margin: 0; }
        .brand-accent { color: #3b82f6; }
        .tagline { color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-top: 6px; font-weight: 700; }
        .body { padding: 36px 32px; color: #334155; line-height: 1.6; font-size: 15px; }
        .footer { background-color: #f8fafc; padding: 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
        .button { display: inline-block; padding: 14px 28px; background-color: #2563eb; color: #ffffff !important; font-weight: 700; font-size: 14px; text-decoration: none; border-radius: 12px; margin-top: 24px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25); }
        .badge { display: inline-block; padding: 6px 14px; border-radius: 9999px; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
        .badge-success { background-color: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
        .badge-info { background-color: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
        .badge-warning { background-color: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
        .badge-purple { background-color: #faf5ff; color: #7e22ce; border: 1px solid #e9d5ff; }
        .card { background-color: #f8fafc; border-radius: 14px; padding: 20px; margin: 20px 0; border: 1px solid #e2e8f0; }
        .item-row { border-bottom: 1px solid #f1f5f9; padding: 12px 0; }
        .total-row { font-size: 18px; font-weight: 900; color: #0f172a; padding-top: 12px; }
    </style>
</head>
<body>
    <div style="display: none; max-height: 0px; overflow: hidden;">${previewText}</div>
    <div class="wrapper">
        <div class="main-container">
            <div class="header">
                <div class="brand"><span class="brand-accent">KAL</span>TECH</div>
                <div class="tagline">Tecnología que mejora tu día</div>
            </div>
            <div class="body">
                ${content}
            </div>
            <div class="footer">
                <p style="margin: 0 0 6px 0;">© ${new Date().getFullYear()} KalTech Inc. Todos los derechos reservados.</p>
                <p style="margin: 0;">Recibes este correo porque tienes una cuenta activa o realizaste una compra en KalTech.</p>
            </div>
        </div>
    </div>
</body>
</html>
`;

export const welcomeEmailTemplate = ({
    name,
}: {
    name: string;
}): { subject: string; html: string; text: string } => {
    const subject = `¡Bienvenido a KalTech, ${name}! Tu cuenta está lista`;
    const previewText = "Comienza a explorar lo último en tecnología, laptops, smartphones y accesorios.";

    const content = `
        <h1 style="color: #0f172a; font-size: 22px; font-weight: 800; margin-top: 0;">¡Hola ${name}! Te damos la bienvenida a KalTech</h1>
        <p>Estamos muy felices de tenerte con nosotros. A partir de ahora podrás disfrutar de una experiencia de compra diseñada para los amantes de la tecnología:</p>

        <div class="card">
            <h3 style="margin-top: 0; color: #0f172a; font-size: 15px;">¿Qué puedes hacer en KalTech?</h3>
            <ul style="padding-left: 20px; margin-bottom: 0; color: #475569;">
                <li style="margin-bottom: 8px;"><strong>Explorar el catálogo:</strong> Laptops, teléfonos, accesorios y componentes de primeras marcas.</li>
                <li style="margin-bottom: 8px;"><strong>Lista de deseos:</strong> Guarda tus productos favoritos para comprarlos cuando quieras.</li>
                <li style="margin-bottom: 8px;"><strong>Libreta de direcciones:</strong> Guarda tus direcciones de entrega para finalizar compras en 1 clic.</li>
                <li><strong>Pagos seguros:</strong> Paga con tarjeta de débito/crédito, PayPal o contra entrega.</li>
            </ul>
        </div>

        <div style="text-align: center;">
            <a href="http://localhost:5173/products" class="button">Explorar Productos</a>
        </div>
    `;

    const text = `¡Hola ${name}! Te damos la bienvenida a KalTech. Tu cuenta ha sido creada exitosamente. Explora nuestro catálogo en http://localhost:5173/products`;

    return {
        subject,
        html: baseEmailLayout(subject, previewText, content),
        text,
    };
};

export const orderCreatedEmailTemplate = ({
    order,
    customerName,
    customerEmail,
}: {
    order: IOrder;
    customerName: string;
    customerEmail?: string;
}): { subject: string; html: string; text: string } => {
    const orderIdStr = order._id.toString();
    const subject = `Confirmación de Pedido #${orderIdStr} - KalTech`;
    const previewText = `Tu pedido de ${order.items.length} productos por $${order.total.toFixed(2)} ha sido registrado con éxito.`;

    const itemsHtml = order.items
        .map(
            (item) => `
            <tr class="item-row">
                <td style="padding: 10px 0; vertical-align: top;">
                    <strong style="color: #0f172a; display: block;">${item.name}</strong>
                    <span style="color: #64748b; font-size: 13px;">Cantidad: ${item.quantity}</span>
                </td>
                <td style="padding: 10px 0; text-align: right; vertical-align: top; font-weight: 700; color: #0f172a;">
                    $${(item.price * item.quantity).toFixed(2)}
                </td>
            </tr>
        `
        )
        .join("");

    const paymentMethodLabel =
        order.paymentMethod === "card"
            ? "Tarjeta de crédito / débito"
            : order.paymentMethod === "paypal"
            ? "PayPal"
            : "Pago contra entrega (Efectivo)";

    const content = `
        <h1 style="color: #0f172a; font-size: 22px; font-weight: 800; margin-top: 0;">¡Gracias por tu compra, ${customerName}!</h1>
        <p>Hemos recibido tu pedido <strong>#${orderIdStr}</strong> y ya se encuentra registrado en nuestro sistema.</p>

        <div class="card">
            <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Resumen del Pedido</h3>
            <table>
                ${itemsHtml}
            </table>
            <table style="margin-top: 14px; border-top: 1px solid #e2e8f0; padding-top: 10px;">
                <tr>
                    <td style="color: #64748b; padding: 4px 0;">Subtotal</td>
                    <td style="text-align: right; font-weight: 600; color: #334155;">$${order.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                    <td style="color: #64748b; padding: 4px 0;">Impuestos (18%)</td>
                    <td style="text-align: right; font-weight: 600; color: #334155;">$${order.tax.toFixed(2)}</td>
                </tr>
                <tr>
                    <td style="color: #64748b; padding: 4px 0;">Envío</td>
                    <td style="text-align: right; font-weight: 600; color: #334155;">${order.shippingCost === 0 ? "Gratis" : `$${order.shippingCost.toFixed(2)}`}</td>
                </tr>
                <tr class="total-row">
                    <td style="padding-top: 10px;">Total</td>
                    <td style="text-align: right; color: #2563eb; padding-top: 10px;">$${order.total.toFixed(2)}</td>
                </tr>
            </table>
        </div>

        <div class="card">
            <h3 style="margin-top: 0; color: #0f172a; font-size: 14px;">Dirección de Entrega</h3>
            <p style="margin: 0; color: #475569; font-size: 14px;">
                <strong>${order.shippingAddress.fullName}</strong><br>
                ${order.shippingAddress.address}<br>
                ${order.shippingAddress.city}, ${order.shippingAddress.postalCode} • ${order.shippingAddress.country}<br>
                Teléfono: ${order.shippingAddress.phone}
            </p>
            <div style="margin-top: 12px; font-size: 13px; color: #64748b;">
                Método de pago: <strong>${paymentMethodLabel}</strong>
            </div>
        </div>

        <div style="text-align: center;">
            <a href="http://localhost:5173/orders/${orderIdStr}" class="button">Ver Detalles de la Orden</a>
        </div>
    `;

    const text = `¡Gracias por tu compra, ${customerName}! Tu pedido #${orderIdStr} por $${order.total.toFixed(2)} ha sido registrado con éxito. Ver detalles en http://localhost:5173/orders/${orderIdStr}`;

    return {
        subject,
        html: baseEmailLayout(subject, previewText, content),
        text,
    };
};

export const paymentConfirmedEmailTemplate = ({
    order,
    customerName,
    customerEmail,
}: {
    order: IOrder;
    customerName: string;
    customerEmail?: string;
}): { subject: string; html: string; text: string } => {
    const orderIdStr = order._id.toString();
    const subject = `Pago Confirmado para Pedido #${orderIdStr} - KalTech`;
    const previewText = `Tu pago de $${order.total.toFixed(2)} ha sido procesado exitosamente. Recibo: ${order.paymentResult?.id ?? "N/A"}`;

    const content = `
        <div style="text-align: center; margin-bottom: 24px;">
            <span class="badge badge-success">Pago Confirmado</span>
        </div>
        <h1 style="color: #0f172a; font-size: 22px; font-weight: 800; margin-top: 0; text-align: center;">
            ¡Hemos recibido tu pago con éxito!
        </h1>
        <p style="text-align: center; color: #64748b;">
            Hola <strong>${customerName}</strong>, el pago correspondiente a tu pedido <strong>#${orderIdStr}</strong> se ha procesado de manera satisfactoria.
        </p>

        <div class="card">
            <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Recibo de Pago</h3>
            <table style="font-size: 14px;">
                <tr>
                    <td style="color: #64748b; padding: 6px 0;">Número de Recibo:</td>
                    <td style="text-align: right; font-family: monospace; font-weight: 700; color: #0f172a;">${order.paymentResult?.id || "N/A"}</td>
                </tr>
                <tr>
                    <td style="color: #64748b; padding: 6px 0;">Monto Pagado:</td>
                    <td style="text-align: right; font-weight: 800; color: #059669; font-size: 16px;">$${order.total.toFixed(2)}</td>
                </tr>
                <tr>
                    <td style="color: #64748b; padding: 6px 0;">Método:</td>
                    <td style="text-align: right; font-weight: 600; color: #334155;">${order.paymentResult?.method || order.paymentMethod}</td>
                </tr>
                <tr>
                    <td style="color: #64748b; padding: 6px 0;">Fecha:</td>
                    <td style="text-align: right; color: #334155;">${order.paidAt ? new Date(order.paidAt).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" }) : new Date().toLocaleDateString("es-ES")}</td>
                </tr>
            </table>
        </div>

        <p style="text-align: center; font-size: 14px; color: #475569;">
            Tu pedido ha pasado a estado <strong>En Preparación</strong> y nuestro equipo se encargará de despacharlo a la brevedad.
        </p>

        <div style="text-align: center;">
            <a href="http://localhost:5173/orders/${orderIdStr}" class="button">Rastrear mi Pedido</a>
        </div>
    `;

    const text = `Hola ${customerName}, tu pago de $${order.total.toFixed(2)} para el pedido #${orderIdStr} fue confirmado. Recibo: ${order.paymentResult?.id ?? "N/A"}. Sigue tu pedido en http://localhost:5173/orders/${orderIdStr}`;

    return {
        subject,
        html: baseEmailLayout(subject, previewText, content),
        text,
    };
};

export const orderStatusUpdatedEmailTemplate = ({
    order,
    customerName,
    customerEmail,
    newStatus,
}: {
    order: IOrder;
    customerName: string;
    customerEmail?: string;
    newStatus: OrderStatus;
}): { subject: string; html: string; text: string } => {
    const orderIdStr = order._id.toString();

    const statusConfig: Record<
        OrderStatus,
        { label: string; badgeClass: string; message: string }
    > = {
        pending: {
            label: "Pendiente",
            badgeClass: "badge-warning",
            message: "Tu pedido está pendiente de confirmación o pago.",
        },
        processing: {
            label: "En Preparación",
            badgeClass: "badge-info",
            message: "Tu pedido está siendo preparado y empaquetado cuidadosamente en nuestro centro de distribución.",
        },
        shipped: {
            label: "Enviado",
            badgeClass: "badge-purple",
            message: "¡Buenas noticias! Tu pedido va en camino a tu dirección de entrega con nuestro servicio de courier prioritario.",
        },
        delivered: {
            label: "Entregado",
            badgeClass: "badge-success",
            message: "¡Tu pedido ha sido entregado en tu dirección! Esperamos que disfrutes de tu nueva tecnología.",
        },
        cancelled: {
            label: "Cancelado",
            badgeClass: "badge-warning",
            message: "Tu pedido ha sido cancelado. Si no solicitaste esta cancelación, por favor contáctanos de inmediato.",
        },
    };

    const currentConfig = statusConfig[newStatus] || statusConfig.pending;
    const subject = `Actualización de Pedido #${orderIdStr}: ${currentConfig.label} - KalTech`;
    const previewText = `Tu pedido #${orderIdStr} ha cambiado a estado: ${currentConfig.label}.`;

    const content = `
        <div style="text-align: center; margin-bottom: 20px;">
            <span class="badge ${currentConfig.badgeClass}">${currentConfig.label}</span>
        </div>
        <h1 style="color: #0f172a; font-size: 22px; font-weight: 800; margin-top: 0; text-align: center;">
            Estado de tu Pedido #${orderIdStr}
        </h1>
        <p style="text-align: center; color: #475569; font-size: 16px;">
            Hola <strong>${customerName}</strong>, te informamos que tu pedido ha sido actualizado.
        </p>

        <div class="card" style="text-align: center; padding: 24px;">
            <p style="font-size: 15px; color: #334155; margin: 0; line-height: 1.6;">
                ${currentConfig.message}
            </p>
        </div>

        <div class="card">
            <h4 style="margin: 0 0 10px 0; color: #0f172a; font-size: 13px; text-transform: uppercase;">Dirección de Entrega</h4>
            <p style="margin: 0; color: #64748b; font-size: 13px;">
                ${order.shippingAddress.fullName} • ${order.shippingAddress.address}, ${order.shippingAddress.city}
            </p>
        </div>

        <div style="text-align: center;">
            <a href="http://localhost:5173/orders/${orderIdStr}" class="button">Ver Estado en KalTech</a>
        </div>
    `;

    const text = `Hola ${customerName}, tu pedido #${orderIdStr} ha sido actualizado a: ${currentConfig.label}. ${currentConfig.message} Ver en http://localhost:5173/orders/${orderIdStr}`;

    return {
        subject,
        html: baseEmailLayout(subject, previewText, content),
        text,
    };
};
