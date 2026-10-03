import { Link } from "react-router-dom";
import {
    FiArrowLeft,
    FiBox,
    FiClock,
    FiCornerDownLeft,
    FiHelpCircle,
    FiPackage,
    FiShield,
    FiTruck,
} from "react-icons/fi";

import { ROUTES } from "../routes/paths";

export const ShippingPage = () => {
    return (
        <section className="min-h-screen bg-slate-50 py-12 sm:py-16">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                {/* Back Link */}
                <div className="mb-6">
                    <Link
                        to={ROUTES.home}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
                    >
                        <FiArrowLeft aria-hidden="true" />
                        <span>Volver al inicio</span>
                    </Link>
                </div>

                {/* Header */}
                <header className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm sm:p-10">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600">
                        <FiTruck aria-hidden="true" />
                    </div>
                    <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                        Envíos, Entregas y Devoluciones
                    </h1>
                    <p className="mt-2 text-sm font-medium text-slate-500">
                        Información clara y transparente para que compres con total tranquilidad en KalTech.
                    </p>
                    <p className="mt-4 text-base leading-relaxed text-slate-600">
                        Nos comprometemos a entregar tu tecnología favorita en el menor tiempo posible y con la máxima seguridad en el embalaje. Si no quedas completamente satisfecho con tu compra, dispones de hasta 30 días para solicitar tu cambio o devolución.
                    </p>
                </header>

                {/* Key Benefits Grid */}
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <FiTruck aria-hidden="true" />
                        </span>
                        <h3 className="mt-3 font-bold text-slate-900">Envío Rápido 24-48h</h3>
                        <p className="mt-1 text-xs text-slate-500">Despacho en el mismo día para pedidos realizados antes de las 14:00h.</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <FiCornerDownLeft aria-hidden="true" />
                        </span>
                        <h3 className="mt-3 font-bold text-slate-900">30 Días de Devolución</h3>
                        <p className="mt-1 text-xs text-slate-500">Derecho de desistimiento ampliado para tu total comodidad.</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                            <FiShield aria-hidden="true" />
                        </span>
                        <h3 className="mt-3 font-bold text-slate-900">Garantía de 3 Años</h3>
                        <p className="mt-1 text-xs text-slate-500">Cobertura oficial completa contra defectos de fábrica.</p>
                    </div>
                </div>

                {/* Detailed Sections */}
                <div className="mt-8 space-y-6">
                    {/* Section 1 */}
                    <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
                        <h2 className="flex items-center gap-2.5 text-xl font-bold text-slate-900">
                            <FiClock className="text-blue-600" aria-hidden="true" />
                            <span>1. Plazos de Preparación y Entrega</span>
                        </h2>
                        <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                            <p>
                                <strong>Preparación:</strong> Los pedidos recibidos de lunes a viernes antes de las 14:00 horas son procesados y expedidos el mismo día laboral. Los pedidos realizados en fines de semana o festivos se preparan el siguiente día hábil.
                            </p>
                            <p>
                                <strong>Plazo de Entrega:</strong>
                            </p>
                            <ul className="list-inside list-disc space-y-1.5 pl-2">
                                <li><strong>Envío Estándar:</strong> De 24 a 48 horas laborables en territorio peninsular y áreas metropolitanas principales.</li>
                                <li><strong>Envío a Zonas Remotas o Islas:</strong> De 3 a 5 días laborables según la compañía de mensajería asignada.</li>
                            </ul>
                        </div>
                    </article>

                    {/* Section 2 */}
                    <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
                        <h2 className="flex items-center gap-2.5 text-xl font-bold text-slate-900">
                            <FiBox className="text-blue-600" aria-hidden="true" />
                            <span>2. Tarifas de Envío</span>
                        </h2>
                        <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                <div className="flex items-center justify-between text-sm font-bold text-slate-900">
                                    <span>Pedidos superiores a $1,000</span>
                                    <span className="text-emerald-600 uppercase">¡Envío Gratis!</span>
                                </div>
                                <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2 text-sm text-slate-600">
                                    <span>Pedidos inferiores a $1,000</span>
                                    <span className="font-bold text-slate-900">Tarifa fija: $25.00</span>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500">
                                El coste exacto del envío se calcula automáticamente en el <Link to={ROUTES.cart} className="font-semibold text-blue-600 underline">carrito de compras</Link> antes de que introduzcas tus datos de pago.
                            </p>
                        </div>
                    </article>

                    {/* Section 3 */}
                    <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
                        <h2 className="flex items-center gap-2.5 text-xl font-bold text-slate-900">
                            <FiPackage className="text-blue-600" aria-hidden="true" />
                            <span>3. Seguimiento en Tiempo Real de tu Pedido</span>
                        </h2>
                        <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                            <p>
                                En cuanto tu paquete salga de nuestros almacenes, recibirás un correo electrónico automático con el estado actualizado y podrás consultar su evolución en cualquier momento desde tu cuenta en la sección <Link to={ROUTES.orders} className="font-semibold text-blue-600 underline">Mis Órdenes</Link>.
                            </p>
                            <p>
                                Podrás ver los 4 estados principales del pedido:
                                <span className="mt-2 block font-semibold text-slate-800">
                                    Pendiente → En Preparación → Enviado → Entregado
                                </span>
                            </p>
                        </div>
                    </article>

                    {/* Section 4 */}
                    <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
                        <h2 className="flex items-center gap-2.5 text-xl font-bold text-slate-900">
                            <FiCornerDownLeft className="text-blue-600" aria-hidden="true" />
                            <span>4. Cómo Solicitar una Devolución</span>
                        </h2>
                        <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                            <p>
                                Si deseas devolver un producto adquirido en KalTech, sigue estos sencillos pasos:
                            </p>
                            <ol className="list-inside list-decimal space-y-2 pl-2">
                                <li>
                                    <strong>Contacta a soporte:</strong> Envía un mensaje desde la <Link to={ROUTES.contact} className="font-semibold text-blue-600 underline">página de contacto</Link> indicando tu número de pedido y el motivo de la devolución.
                                </li>
                                <li>
                                    <strong>Prepara el paquete:</strong> Guarda el artículo en su embalaje original con todos sus accesorios, manuales y cables.
                                </li>
                                <li>
                                    <strong>Recogida o entrega:</strong> Te facilitaremos una etiqueta de mensajería para que un transportista recoja el paquete o lo entregues en el punto convenido.
                                </li>
                                <li>
                                    <strong>Reembolso inmediato:</strong> Tras recibir el producto y verificar su estado en nuestro centro de logística, emitiremos el reembolso íntegro a tu método de pago original en un plazo de 3 a 5 días laborables.
                                </li>
                            </ol>
                        </div>
                    </article>

                    {/* Section 5 */}
                    <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
                        <h2 className="flex items-center gap-2.5 text-xl font-bold text-slate-900">
                            <FiShield className="text-blue-600" aria-hidden="true" />
                            <span>5. Incidencias en la Entrega o Paquetes Dañados</span>
                        </h2>
                        <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                            <p>
                                Si en el momento de la entrega observas que la caja exterior se encuentra visiblemente golpeada o dañada, por favor indícalo en el albarán del transportista y toma fotografías antes de abrirlo.
                            </p>
                            <p>
                                Escríbenos inmediatamente a <a href="mailto:soporte@kaltech.com" className="font-semibold text-blue-600 underline">soporte@kaltech.com</a> con las fotografías adjuntas. Gestionaremos la reposición inmediata del producto sin ningún coste adicional para ti.
                            </p>
                        </div>
                    </article>
                </div>

                {/* Support Banner */}
                <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-3xl bg-blue-600 p-8 text-center text-white sm:flex-row sm:text-left">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-2xl">
                            <FiHelpCircle aria-hidden="true" />
                        </div>
                        <div>
                            <p className="font-bold text-lg">¿Necesitas ayuda con un envío en curso?</p>
                            <p className="text-sm text-blue-100">Indícanos tu número de pedido y revisaremos su estado al instante.</p>
                        </div>
                    </div>
                    <Link
                        to={ROUTES.contact}
                        className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-bold text-blue-600 transition hover:bg-blue-50"
                    >
                        Contactar Soporte
                    </Link>
                </div>
            </div>
        </section>
    );
};
