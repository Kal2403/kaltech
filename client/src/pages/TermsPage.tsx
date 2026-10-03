import { Link } from "react-router-dom";
import { FiArrowLeft, FiFileText, FiHelpCircle } from "react-icons/fi";

import { ROUTES } from "../routes/paths";

export const TermsPage = () => {
    return (
        <section className="min-h-screen bg-slate-50 py-12 sm:py-16">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                {/* Navigation Back */}
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
                        <FiFileText aria-hidden="true" />
                    </div>
                    <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                        Términos y Condiciones de Uso
                    </h1>
                    <p className="mt-2 text-sm font-medium text-slate-500">
                        Última actualización: 1 de octubre de 2026 • Versión 1.0
                    </p>
                    <p className="mt-4 text-base leading-relaxed text-slate-600">
                        Bienvenido a <strong>KalTech</strong>. Al navegar, registrarte o realizar compras en nuestra plataforma digital, aceptas y te comprometes a cumplir los siguientes Términos y Condiciones generales de uso y contratación. Te recomendamos leerlos detalladamente antes de completar cualquier pedido.
                    </p>
                </header>

                {/* Content Sections */}
                <div className="mt-8 space-y-6">
                    {/* Section 1 */}
                    <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
                        <h2 className="text-xl font-bold text-slate-900">
                            1. Información General y Titularidad
                        </h2>
                        <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                            <p>
                                El presente sitio web y la plataforma de comercio electrónico son operados bajo la denominación comercial <strong>KalTech</strong>.
                            </p>
                            <p>
                                Para cualquier consulta legal, sugerencia o reclamación, puedes ponerte en contacto con nuestro departamento de atención al cliente a través del correo electrónico <a href="mailto:legal@kaltech.com" className="font-semibold text-blue-600 underline">legal@kaltech.com</a> o mediante nuestra <Link to={ROUTES.contact} className="font-semibold text-blue-600 underline">página de contacto</Link>.
                            </p>
                        </div>
                    </article>

                    {/* Section 2 */}
                    <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
                        <h2 className="text-xl font-bold text-slate-900">
                            2. Registro y Seguridad de la Cuenta
                        </h2>
                        <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                            <p>
                                Para realizar compras no es obligatorio crear una cuenta, pero registrarse te permite acceder a tu historial de pedidos, guardar múltiples direcciones de entrega y gestionar tu lista de deseos.
                            </p>
                            <p>
                                Al crear una cuenta, te comprometes a proporcionar información veraz, exacta y actualizada. Es tu responsabilidad mantener la confidencialidad de tus credenciales de acceso y notificarnos de inmediato cualquier uso no autorizado.
                            </p>
                        </div>
                    </article>

                    {/* Section 3 */}
                    <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
                        <h2 className="text-xl font-bold text-slate-900">
                            3. Catálogo, Precios y Disponibilidad
                        </h2>
                        <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                            <p>
                                Todos los precios mostrados en la tienda están expresados en dólares estadounidenses ($ USD) e incluyen los impuestos aplicables, salvo indicación expresa en contrario. Los costes de envío se calculan y desglosan antes de confirmar el pedido.
                            </p>
                            <p>
                                Nos esforzamos por mantener la información de inventario actualizada en tiempo real. En el caso improbable de que un producto adquirido no cuente con disponibilidad por rotura de stock, te informaremos a la brevedad y procederemos al reembolso total de las sumas abonadas.
                            </p>
                        </div>
                    </article>

                    {/* Section 4 */}
                    <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
                        <h2 className="text-xl font-bold text-slate-900">
                            4. Métodos de Pago y Cupones
                        </h2>
                        <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                            <p>
                                Aceptamos las principales tarjetas de crédito/débito, PayPal y pago contra entrega (según disponibilidad geográfica). Toda transacción electrónica se realiza bajo estándares seguros de cifrado.
                            </p>
                            <p>
                                Los códigos de descuento y cupones promocionales están sujetos a sus condiciones específicas de validez, importe mínimo de compra y número de usos máximos. No son acumulables a menos que se especifique lo contrario.
                            </p>
                        </div>
                    </article>

                    {/* Section 5 */}
                    <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
                        <h2 className="text-xl font-bold text-slate-900">
                            5. Derecho de Desistimiento y Devoluciones
                        </h2>
                        <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                            <p>
                                Dispones de un plazo legal de <strong>14 días naturales</strong> (ampliado a <strong>30 días</strong> por cortesía de KalTech) desde la recepción del producto para desistir de la compra sin necesidad de justificación.
                            </p>
                            <p>
                                Para ser elegible a la devolución, el producto debe encontrarse en perfectas condiciones, sin indicios de uso indebido y preferiblemente con sus embalajes y accesorios originales. Para más detalles, consulta nuestra <Link to={ROUTES.shipping} className="font-semibold text-blue-600 underline">Política de Envíos y Devoluciones</Link>.
                            </p>
                        </div>
                    </article>

                    {/* Section 6 */}
                    <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
                        <h2 className="text-xl font-bold text-slate-900">
                            6. Garantía de los Productos
                        </h2>
                        <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                            <p>
                                Todos los artículos nuevos comercializados por KalTech disponen de una <strong>garantía legal de 3 años</strong> frente a faltas de conformidad y defectos de fabricación desde la fecha de entrega.
                            </p>
                            <p>
                                La garantía no cubre daños derivados de golpes, uso inadecuado, accidentes, manipulación por servicios técnicos no autorizados o desgaste natural de consumibles (baterías, cables, etc.).
                            </p>
                        </div>
                    </article>

                    {/* Section 7 */}
                    <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
                        <h2 className="text-xl font-bold text-slate-900">
                            7. Propiedad Intelectual
                        </h2>
                        <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                            <p>
                                Los textos, diseños, gráficos, logotipos, iconos de botones, imágenes y software presentes en este sitio web son propiedad exclusiva de KalTech o de sus respectivos titulares y proveedores, protegidos por las leyes de propiedad intelectual e industrial.
                            </p>
                        </div>
                    </article>

                    {/* Section 8 */}
                    <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
                        <h2 className="text-xl font-bold text-slate-900">
                            8. Legislación Aplicable
                        </h2>
                        <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                            <p>
                                Las presentes condiciones se rigen por la legislación civil y mercantil vigente. En caso de litigio, las partes se someterán a los juzgados y tribunales del domicilio del consumidor.
                            </p>
                        </div>
                    </article>
                </div>

                {/* Help Banner */}
                <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-3xl bg-blue-600 p-8 text-center text-white sm:flex-row sm:text-left">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-2xl">
                            <FiHelpCircle aria-hidden="true" />
                        </div>
                        <div>
                            <p className="font-bold text-lg">¿Tienes alguna duda sobre nuestros términos?</p>
                            <p className="text-sm text-blue-100">Nuestro equipo de soporte está disponible para orientarte.</p>
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
