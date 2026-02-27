// app/(admin)/admin/ventas/[id]/page.tsx
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";
import { ventaDetailService } from "@/services/ventaDetailService";
import {
    ArrowLeft,
    Package,
    Calendar,
    MapPin,
    CreditCard,
    Truck,
    CalendarCheck,
    User,
    Mail,
    Phone,
    Instagram
} from "lucide-react";

import OrderStatusManager from "@/components/OrderStatusManager";
import OrderActions from "@/components/OrderActions"; // Asegurate que soporte ser usado acá
import { getPaymentBadge } from "@/utils/paymentStatus";
import { formatCurrency } from "@/utils/format";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function VentaDetailPage({ params }: Props) {
    const { id } = await params;
    const ventaId = Number(id);

    if (isNaN(ventaId)) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">ID de venta inválido</h1>
                <Link href="/admin/ventas" className="text-manto-teal hover:underline flex items-center gap-2">
                    <ArrowLeft size={20} /> Volver a Ventas
                </Link>
            </div>
        );
    }

    const supabase = await createClient();
    const venta = await ventaDetailService.getVentaById(ventaId, supabase);

    if (!venta) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Venta no encontrada</h1>
                <Link href="/admin/ventas" className="text-manto-teal hover:underline flex items-center gap-2">
                    <ArrowLeft size={20} /> Volver a Ventas
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* Cabecera y Navegación */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <Link href="/admin/ventas" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-manto-teal transition-colors mb-2 font-medium">
                        <ArrowLeft size={16} /> Volver al listado
                    </Link>
                    <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
                        Venta #{String(venta.id).padStart(3, "0")}
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Calendar size={14} /> Registrada el {venta.fecha_pedido}
                    </div>
                </div>

                {/* Acciones Rápidas (WhatsApp, Mail, etc) */}
                <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 px-2 uppercase tracking-wider">Acciones:</span>
                    <OrderActions
                        id={venta.id}
                        telefono={venta.cliente?.telefono}
                        nombreCliente={venta.cliente?.nombre || "Cliente"}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* COLUMNA IZQUIERDA: ESTADOS Y PRODUCTOS */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Panel de Control de Estados */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50/50 p-5 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-bold text-gray-800 flex items-center gap-2">
                                <Package size={18} className="text-manto-teal" /> Gestión del Pedido
                            </h2>
                        </div>
                        <div className="p-6 flex flex-col sm:flex-row gap-8 items-start sm:items-center justify-between">

                            {/* Control Logístico */}
                            <div className="space-y-2 flex-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Estado Logístico</label>
                                <div className="flex items-center gap-4">
                                    <OrderStatusManager
                                        orderId={venta.id}
                                        initialStatusId={venta.estado_pedido_id}
                                        paymentStatusId={venta.estado_pago_id}
                                        paymentProvider={venta.proveedor_pago}
                                        orderTotal={venta.total_formateado}
                                    />
                                </div>
                                {venta.fecha_despacho && <p className="text-xs text-gray-500">Despachado: {venta.fecha_despacho}</p>}
                                {venta.fecha_entrega && <p className="text-xs text-gray-500">Entregado: {venta.fecha_entrega}</p>}
                            </div>

                            <div className="hidden sm:block w-px h-16 bg-gray-100"></div>

                            {/* Info de Pago */}
                            <div className="space-y-2 flex-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Estado Financiero</label>
                                <div className="flex flex-col gap-2">
                                    {getPaymentBadge(venta.estado_pago)}
                                    <div className="text-[11px] font-medium text-gray-500 flex items-center gap-1.5">
                                        {venta.proveedor_pago === 'MERCADO_PAGO' ? (
                                            <><span className="text-sm">💳</span> Mercado Pago</>
                                        ) : venta.proveedor_pago === 'EFECTIVO_REPARTIDOR' ? (
                                            <><span className="text-sm">💵</span> Efectivo en mano</>
                                        ) : (
                                            <><span className="text-sm">❓</span> Sin definir</>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Lista de Productos */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-5 border-b border-gray-100">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <Package size={18} className="text-manto-orange" /> Artículos ({venta.items.length})
                            </h3>
                        </div>
                        <div className="p-2">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Producto</th>
                                        <th className="px-4 py-3 font-medium text-center">Cant.</th>
                                        <th className="px-4 py-3 font-medium text-right">Precio</th>
                                        <th className="px-4 py-3 font-medium text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {venta.items.map((detalle: any, index: number) => (
                                        <tr key={index} className="hover:bg-gray-50/30">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden relative border border-gray-200 flex-shrink-0">
                                                        {detalle.imagen_url ? (
                                                            <Image src={detalle.imagen_url} alt={detalle.nombre_item} fill className="object-cover" />
                                                        ) : (
                                                            <div className="flex items-center justify-center h-full text-xs">🧉</div>
                                                        )}
                                                    </div>
                                                    <span className="font-medium text-gray-800">{detalle.nombre_item}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center text-gray-600 font-medium">{detalle.cantidad}</td>
                                            <td className="px-4 py-3 text-right text-gray-500">{detalle.precio_unitario}</td>
                                            <td className="px-4 py-3 text-right font-bold text-manto-teal">{detalle.subtotal}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Totales */}
                        <div className="bg-manto-teal/5 p-6 border-t border-manto-teal/10 flex justify-end">
                            <div className="w-64 space-y-2">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Subtotal</span>
                                    <span>{venta.total_formateado}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Envío</span>
                                    <span className="text-green-600 font-medium">Bonificado</span>
                                </div>
                                <div className="pt-2 border-t border-manto-teal/10 flex justify-between text-lg font-black text-manto-teal">
                                    <span>Total</span>
                                    <span>{venta.total_formateado}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* COLUMNA DERECHA: CLIENTE Y ENVÍO */}
                <div className="space-y-6">

                    {/* Tarjeta del Cliente */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50/50 p-5 border-b border-gray-100">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <User size={18} className="text-manto-teal" /> Datos del Cliente
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Nombre</p>
                                <p className="font-medium text-gray-800">{venta.cliente?.nombre || 'Anónimo'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Contacto</p>
                                <div className="space-y-2 mt-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Mail size={14} className="text-gray-400" /> {venta.cliente?.email}
                                    </div>
                                    {venta.cliente?.telefono && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Phone size={14} className="text-gray-400" /> {venta.cliente.telefono}
                                        </div>
                                    )}
                                    {venta.cliente?.instagram && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Instagram size={14} className="text-pink-500" /> @{venta.cliente.instagram}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tarjeta de Envío */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50/50 p-5 border-b border-gray-100">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <MapPin size={18} className="text-manto-orange" /> Información de Envío
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Dirección</p>
                                <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    {venta.direccion_envio}
                                </p>
                            </div>

                            {/* Si querés agregar funcionalidad de tracking en el futuro, acá es el lugar */}
                            {venta.cod_seguimiento ? (
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Seguimiento</p>
                                    <p className="text-sm font-mono bg-blue-50 text-blue-700 p-2 rounded border border-blue-100 inline-block">
                                        {venta.cod_seguimiento}
                                    </p>
                                </div>
                            ) : (
                                <div className="pt-2">
                                    {/* Placeholder para un futuro botón de "Agregar Tracking" */}
                                    <button className="text-xs font-bold text-manto-teal hover:underline flex items-center gap-1">
                                        + Agregar código de seguimiento
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}