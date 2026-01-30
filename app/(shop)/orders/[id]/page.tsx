"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
// Importamos solo el servicio y el tipo, ya no supabase directo
import { orderDetailService, DTODetallePedido } from "@/services/orderDetailService"; 
import { 
  ArrowLeft, Package, Calendar, MapPin, 
  CreditCard, Loader2, CheckCircle, Clock, Truck, CalendarCheck 
} from "lucide-react";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  // Usamos el tipo DTO que definimos en el servicio
  const [pedido, setPedido] = useState<DTODetallePedido | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!params.id) return;
      const orderId = Number(params.id);

      if (isNaN(orderId)) {
          console.error("ID inválido");
          setLoading(false);
          return;
      }

      // --- CAMBIO CLAVE: Usamos el servicio ---
      const data = await orderDetailService.getOrderDetailById(orderId);
      setPedido(data);
      setLoading(false);
    };

    fetchOrder();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-manto-teal mb-4" size={48} />
        <p className="text-gray-500">Buscando tu pedido...</p>
      </div>
    );
  }


  if (!pedido) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold text-manto-teal mb-4">Pedido no encontrado</h1>
        <Link href="/dashboard" className="text-manto-orange hover:underline flex items-center gap-2">
          <ArrowLeft size={20} /> Volver a mis pedidos
        </Link>
      </div>
    );
  }

  const handleBack = () => {
    router.back();
  };

  // Helper actualizado para recibir STRING (que es lo que devuelve el servicio)
  const getStatusBadge = (status: string) => {
    // Normalizamos a minúsculas para comparar seguro
    const s = status.toLowerCase();
    
    if (s.includes('pendiente')) 
        return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2"><Clock size={14}/> {status}</span>;
    
    if (s.includes('enviado') || s.includes('camino')) 
        return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2"><Truck size={14}/> {status}</span>;
    
    if (s.includes('entregado')) 
        return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2"><CheckCircle size={14}/> {status}</span>;
    
    // Default
    return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-bold">{status}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Cabecera y Navegación */}
        <div className="flex items-center justify-between mb-8">
            <button 
                onClick={handleBack}
                className="group flex items-center gap-2 text-gray-500 hover:text-manto-teal transition-all font-medium"
            >
                <div className="p-2 bg-white rounded-full shadow-sm border border-gray-200 group-hover:border-manto-teal/30 transition-colors">
                    <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform"/> 
                </div>
                Volver
            </button>
            <span className="text-sm text-gray-400 font-mono tracking-wider">ID: #{String(pedido.id).padStart(3, '0')}</span>
        </div>

        {/* Tarjeta Principal */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-manto-teal/10">
            
            {/* Header del Pedido */}
            <div className="bg-manto-teal/5 p-8 border-b border-manto-teal/10 flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-manto-teal mb-2">Detalle de Pedido</h1>
                    <div className="flex items-center gap-2 text-gray-500">
                        <Calendar size={18} />
                        Creado el {pedido.fecha_pedido}
                    </div>
                </div>
                <div>
                    {getStatusBadge(pedido.estado_pedido)}
                </div>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-12">
                
                {/* COLUMNA IZQUIERDA: ITEMS (Ocupa 2 espacios) */}
                <div className="md:col-span-2 space-y-6">
                    <h3 className="font-bold text-gray-700 flex items-center gap-2 text-lg border-b pb-2">
                        <Package size={20} className="text-manto-orange" /> Productos
                    </h3>
                    
                    <div className="space-y-4">
                        {/* Ahora usamos 'pedido.items' que viene limpio del servicio */}
                        {pedido.items.map((detalle, index) => (
                            <div key={index} className="flex gap-4 items-center">
                                {/* Imagen Miniatura */}
                                <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden relative border border-gray-200 flex-shrink-0">
                                    {detalle.imagen_url ? (
                                        <Image src={detalle.imagen_url} alt={detalle.nombre_item} fill className="object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-xl">🧉</div>
                                    )}
                                </div>
                                
                                {/* Info */}
                                <div className="flex-1">
                                    <p className="font-bold text-gray-800">{detalle.nombre_item}</p>
                                    <p className="text-sm text-gray-500">Cantidad: {detalle.cantidad}</p>
                                </div>

                                {/* Precio (Ya viene formateado del servicio) */}
                                <div className="text-right">
                                    <p className="font-bold text-manto-teal">{detalle.subtotal}</p>
                                    <p className="text-xs text-gray-400">{detalle.precio_unitario} c/u</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* COLUMNA DERECHA: RESUMEN (Ocupa 1 espacio) */}
                <div className="space-y-8">
                    
                    {/* Dirección y Fechas de Logística */}
                    <div>
                        <h3 className="font-bold text-gray-700 flex items-center gap-2 text-lg border-b pb-2 mb-4">
                            <MapPin size={20} className="text-manto-orange" /> Envío
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-xl space-y-4">
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Dirección</p>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {pedido.direccion_envio}
                                </p>
                            </div>

                            {/* --- AQUÍ AGREGAMOS LAS FECHAS DE DESPACHO Y ENTREGA --- */}
                            <div className="border-t border-gray-200 pt-3 flex flex-col gap-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 flex items-center gap-2"><Truck size={14}/> Despacho:</span>
                                    <span className="font-medium text-gray-700">{pedido.fecha_despacho}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 flex items-center gap-2"><CalendarCheck size={14}/> Entrega:</span>
                                    <span className="font-medium text-gray-700">{pedido.fecha_entrega}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Totales */}
                    <div>
                        <h3 className="font-bold text-gray-700 flex items-center gap-2 text-lg border-b pb-2 mb-4">
                            <CreditCard size={20} className="text-manto-orange" /> Resumen
                        </h3>
                        <div className="bg-manto-teal/5 p-6 rounded-2xl space-y-3">
                            <div className="flex justify-between text-gray-600 text-sm">
                                <span>Subtotal</span>
                                {/* Usamos el total formateado del servicio */}
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

            {/* Footer con ayuda */}
            <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
                <p className="text-sm text-gray-400">
                    ¿Necesitas ayuda con este pedido? <Link href="/#contacto" className="text-manto-orange font-bold hover:underline">Contáctanos</Link>
                </p>
            </div>

        </div>
      </div>
    </div>
  );
}