import { Link } from "react-router-dom";
import { FiArrowLeft, FiCheckCircle, FiLock, FiMail, FiShield, FiUserCheck } from "react-icons/fi";

import { ROUTES } from "../routes/paths";

export const PrivacyPage = () => {
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
                        <FiShield aria-hidden="true" />
                    </div>
                    <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                        Política de Privacidad y Protección de Datos
                    </h1>
                    <p className="mt-2 text-sm font-medium text-slate-500">
                        Última actualización: 1 de octubre de 2026 • Conforme a RGPD y LOPD-GDD
                    </p>
                    <p className="mt-4 text-base leading-relaxed text-slate-600">
                        En <strong>KalTech</strong> nos tomamos muy en serio la seguridad y confidencialidad de tu información personal. Esta Política de Privacidad describe de manera transparente qué datos recopilamos, cómo los utilizamos, con quién los compartimos y qué derechos puedes ejercer sobre ellos en todo momento.
                    </p>
                </header>

                {/* Key Guarantees Banner */}
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <FiLock aria-hidden="true" />
                        </span>
                        <h3 className="mt-3 font-bold text-slate-900">Cifrado Seguro</h3>
                        <p className="mt-1 text-xs text-slate-500">Tus datos viajan siempre encriptados mediante protocolos HTTPS/TLS.</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <FiUserCheck aria-hidden="true" />
                        </span>
                        <h3 className="mt-3 font-bold text-slate-900">Control Total</h3>
                        <p className="mt-1 text-xs text-slate-500">Puedes solicitar el acceso, rectificación o eliminación de tus datos cuando desees.</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                            <FiCheckCircle aria-hidden="true" />
                        </span>
                        <h3 className="mt-3 font-bold text-slate-900">Sin Venta a Terceros</h3>
                        <p className="mt-1 text-xs text-slate-500">Nunca venderemos ni alquilaremos tus datos a empresas de publicidad externa.</p>
                    </div>
                </div>

                {/* Policy Sections */}
                <div className="mt-8 space-y-6">
                    {/* Section 1 */}
                    <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
                        <h2 className="text-xl font-bold text-slate-900">
                            1. Responsable del Tratamiento
                        </h2>
                        <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                            <p>
                                El responsable del tratamiento de los datos recabados en este sitio web es <strong>KalTech</strong>, con dirección de contacto en <a href="mailto:privacidad@kaltech.com" className="font-semibold text-blue-600 underline">privacidad@kaltech.com</a>.
                            </p>
                        </div>
                    </article>

                    {/* Section 2 */}
                    <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
                        <h2 className="text-xl font-bold text-slate-900">
                            2. Datos Personales que Recopilamos
                        </h2>
                        <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                            <p>Recopilamos la información estrictamente necesaria para prestar nuestros servicios:</p>
                            <ul className="list-inside list-disc space-y-1.5 pl-2">
                                <li><strong>Datos de registro e identificación:</strong> Nombre completo, dirección de correo electrónico y contraseña cifrada con algoritmo seguro (bcrypt).</li>
                                <li><strong>Datos de facturación y envío:</strong> Dirección postal, ciudad, código postal, país y número de teléfono de contacto.</li>
                                <li><strong>Datos de transacciones y pedidos:</strong> Historial de compras, productos solicitados, estado de los pagos y cupones aplicados.</li>
                                <li><strong>Datos técnicos:</strong> Dirección IP, tipo de navegador e identificadores de sesión para prevenir fraudes.</li>
                            </ul>
                            <p className="text-xs text-slate-500 italic">
                                * KalTech no almacena los números completos de tu tarjeta de crédito ni códigos CVV en sus servidores; los pagos son gestionados por proveedores de pago certificados bajo la normativa PCI-DSS.
                            </p>
                        </div>
                    </article>

                    {/* Section 3 */}
                    <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
                        <h2 className="text-xl font-bold text-slate-900">
                            3. Finalidad del Tratamiento de los Datos
                        </h2>
                        <div className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
                            <p>Tus datos se utilizan con las siguientes finalidades legítimas:</p>
                            <ul className="list-inside list-disc space-y-1.5 pl-2">
                                <li>Gestionar, tramitar y entregar tus pedidos de productos tecnológicos.</li>
                                <li>Enviarte notificaciones transaccionales (confirmación de compra, actualización de estado de envío y factura digital).</li>
                                <li>Atender tus consultas, dudas y solicitudes mediante nuestro canal de soporte al cliente.</li>
                                <li>Detectar, prevenir e investigar actividades sospechosas de fraude electrónico.</li>
                            </ul>
                        </div>
                    </article>

                    {/* Section 4 */}
                    <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
                        <h2 className="text-xl font-bold text-slate-900">
                            4. Destinatarios y Cesión a Terceros
                        </h2>
                        <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                            <p>
                                Para completar tus pedidos, necesitamos compartir determinados datos con proveedores de servicios de total confianza:
                            </p>
                            <ul className="list-inside list-disc space-y-1.5 pl-2">
                                <li><strong>Empresas de logística y paquetería:</strong> Para entregar los paquetes en tu domicilio.</li>
                                <li><strong>Pasarelas de pago seguro:</strong> Para procesar transacciones electrónicas.</li>
                                <li><strong>Servicios de infraestructura en la nube:</strong> Para alojar de forma segura nuestra base de datos y enviar correos transaccionales.</li>
                            </ul>
                        </div>
                    </article>

                    {/* Section 5 */}
                    <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
                        <h2 className="text-xl font-bold text-slate-900">
                            5. Tus Derechos de Privacidad
                        </h2>
                        <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                            <p>Bajo la normativa vigente de protección de datos, dispones de los siguientes derechos:</p>
                            <ul className="list-inside list-disc space-y-1.5 pl-2">
                                <li><strong>Acceso:</strong> Conocer qué datos tuyos estamos tratando.</li>
                                <li><strong>Rectificación:</strong> Modificar tus datos si son inexactos o incompletos desde tu panel de perfil.</li>
                                <li><strong>Supresión ("Derecho al olvido"):</strong> Solicitar el borrado de tus datos cuando ya no sean necesarios para los fines que fueron recabados.</li>
                                <li><strong>Portabilidad:</strong> Recibir tus datos en un formato estructurado y legible.</li>
                            </ul>
                            <p>
                                Para ejercer cualquiera de estos derechos, basta con enviar un correo electrónico a <a href="mailto:privacidad@kaltech.com" className="font-semibold text-blue-600 underline">privacidad@kaltech.com</a> indicando tu solicitud.
                            </p>
                        </div>
                    </article>
                </div>

                {/* Direct Contact for Privacy */}
                <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 text-center sm:text-left shadow-sm">
                    <div className="flex flex-col sm:flex-row items-center gap-5">
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600">
                            <FiMail aria-hidden="true" />
                        </span>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">¿Preguntas sobre privacidad o tratamiento de datos?</h3>
                            <p className="mt-1 text-sm text-slate-600">
                                Escríbenos a nuestro delegado de protección de datos en <a href="mailto:privacidad@kaltech.com" className="font-semibold text-blue-600 underline">privacidad@kaltech.com</a>. Te responderemos en un plazo máximo de 48 horas laborales.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
