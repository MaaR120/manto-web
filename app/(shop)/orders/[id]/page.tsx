import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";
import { orderDetailService } from "@/services/orderDetailService";
import {
  ArrowLeft,
  Package,
  Calendar,
  MapPin,
  CreditCard,
  Truck,
  CalendarCheck,
} from "lucide-react";

// Importamos tus nuevas utilidades centralizadas
import { getStatusBadge } from "@/utils/estadoPedido"; // Ajustá esta ruta si tu archivo se llama diferente
import { getPaymentBadge } from "@/utils/paymentStatus";


export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const orderId = Number(id);

  if (isNaN(orderId)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold text-manto-teal mb-4">ID de pedido inválido</h1>
        <Link href="/dashboard" className="text-manto-orange hover:underline flex items-center gap-2">
          <ArrowLeft size={20} /> Volver
        </Link>
      </div>
    );
  }

  const supabase = await createClient();
  const pedido = await orderDetailService.getOrderDetailById(orderId, supabase);

  if (!pedido) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold text-manto-teal mb-4">Pedido no encontrado</h1>
        <Link href="/orders" className="text-manto-orange hover:underline flex items-center gap-2">
          <ArrowLeft size={20} /> Volver a mis pedidos
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Cabecera y Navegación */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/orders"
            className="group flex items-center gap-2 text-gray-500 hover:text-manto-teal transition-all font-medium"
          >
            <div className="p-2 bg-white rounded-full shadow-sm border border-gray-200 group-hover:border-manto-teal/30 transition-colors">
              <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            </div>
            Volver
          </Link>
          <span className="text-sm text-gray-400 font-mono tracking-wider">
            ID: #{String(pedido.id).padStart(3, "0")}
          </span>
        </div>

        {/* Tarjeta Principal */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-manto-teal/10">
          
          {/* Header del Pedido (Actualizado con ambos Badges) */}
          <div className="bg-manto-teal/5 p-8 border-b border-manto-teal/10 flex flex-col md:flex-row justify-between md:items-start gap-6">
            <div>
              <h1 className="text-3xl font-bold text-manto-teal mb-2">Detalle de Pedido</h1>
              <div className="flex items-center gap-2 text-gray-500">
                <Calendar size={18} />
                Creado el {pedido.fecha_pedido}
              </div>
            </div>
            
            {/* Contenedor de Badges */}
            <div className="flex flex-col items-start md:items-end gap-3 bg-white/60 p-4 rounded-xl border border-manto-teal/10">
               <div className="flex items-center gap-3 w-full justify-between md:justify-end">
                   <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Logística:</span>
                   {getStatusBadge(pedido.estado_pedido)}
               </div>
               <div className="flex items-center gap-3 w-full justify-between md:justify-end">
                   <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pago:</span>
                   {getPaymentBadge(pedido.estado_pago)}
               </div>
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* COLUMNA IZQUIERDA: ITEMS */}
            <div className="md:col-span-2 space-y-6">
              <h3 className="font-bold text-gray-700 flex items-center gap-2 text-lg border-b pb-2">
                <Package size={20} className="text-manto-orange" /> Productos
              </h3>

              <div className="space-y-4">
                {pedido.items.map((detalle, index) => (
                  <div key={index} className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden relative border border-gray-200 flex-shrink-0">
                      {detalle.imagen_url ? (
                        <Image
                          src={detalle.imagen_url}
                          alt={detalle.nombre_item}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-xl">🧉</div>
                      )}
                    </div>

                    <div className="flex-1">
                      <p className="font-bold text-gray-800">{detalle.nombre_item}</p>
                      <p className="text-sm text-gray-500">Cantidad: {detalle.cantidad}</p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-manto-teal">{detalle.subtotal}</p>
                      <p className="text-xs text-gray-400">{detalle.precio_unitario} c/u</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* COLUMNA DERECHA: RESUMEN */}
            <div className="space-y-8">
              <div>
                <h3 className="font-bold text-gray-700 flex items-center gap-2 text-lg border-b pb-2 mb-4">
                  <MapPin size={20} className="text-manto-orange" /> Envío
                </h3>
                <div className="bg-gray-50 p-4 rounded-xl space-y-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Dirección</p>
                    <p className="text-gray-600 text-sm leading-relaxed">{pedido.direccion_envio}</p>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 flex items-center gap-2">
                        <Truck size={14} /> Despacho:
                      </span>
                      <span className="font-medium text-gray-700">{pedido.fecha_despacho}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 flex items-center gap-2">
                        <CalendarCheck size={14} /> Entrega:
                      </span>
                      <span className="font-medium text-gray-700">{pedido.fecha_entrega}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-700 flex items-center gap-2 text-lg border-b pb-2 mb-4">
                  <CreditCard size={20} className="text-manto-orange" /> Resumen
                </h3>
                <div className="bg-manto-teal/5 p-6 rounded-2xl space-y-3">
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Subtotal</span>
                    <span>{pedido.total_formateado}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Envío</span>
                    <span className="text-green-600 font-medium">Bonificado</span>
                  </div>
                  <div className="h-px bg-manto-teal/10 my-2"></div>
                  <div className="flex justify-between text-xl font-black text-manto-teal">
                    <span>Total</span>
                    <span>{pedido.total_formateado}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
            <p className="text-sm text-gray-400">
              ¿Necesitas ayuda con este pedido?{" "}
              <Link href="/#contacto" className="text-manto-orange font-bold hover:underline">
                Contáctanos
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}