"use client"; 

import { Package, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DTOPedido as Pedido } from "@/services/orderService";
import { getStatusBadge } from "@/utils/estadoPedido";
import { getPaymentBadge } from "@/utils/paymentStatus";

interface Props {
  pedidos: Pedido[];
  title?: string;
  showViewAll?: boolean;
}

export function OrderList({ 
  pedidos, 
  title = "Últimos Pedidos", 
  showViewAll = true 
}: Props) {
  
  const router = useRouter(); 

  const handleRowClick = (id: number) => {
    router.push(`/orders/${id}`);
  };


  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl border border-manto-teal/10 shadow-sm overflow-hidden h-full flex flex-col">
      
      <div className="p-6 sm:p-8 border-b border-manto-teal/5">
        <h2 className="text-xl font-bold text-manto-teal flex items-center gap-2">
          <Package size={20} /> {title}
        </h2>
      </div>
      
      {pedidos.length === 0 ? (
         <div className="p-12 text-center text-gray-500 flex-1">
             <Package size={48} className="mx-auto mb-4 opacity-20" />
             <p>Aún no has realizado pedidos.</p>
         </div>
      ) : (
        <div className="overflow-x-auto flex-1 custom-scrollbar">
            <table className="w-full text-left">
            <thead className="bg-manto-teal/5 text-manto-teal uppercase text-[11px] sm:text-xs font-bold tracking-wider">
                <tr>
                <th className="px-4 py-3 sm:px-6 sm:py-4">Pedido</th>
                <th className="px-4 py-3 sm:px-6 sm:py-4">Fecha</th>
                <th className="px-4 py-3 sm:px-6 sm:py-4">Envío</th>
                <th className="px-4 py-3 sm:px-6 sm:py-4">Pago</th>
                <th className="px-4 py-3 sm:px-6 sm:py-4 text-right">Total</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-manto-teal/5">
                {pedidos.map((pedido) => (
                <tr 
                    key={pedido.id} 
                    onClick={() => handleRowClick(pedido.id)}
                    className="hover:bg-white/60 transition-colors cursor-pointer group"
                >
                    <td className="px-4 py-4 sm:px-6 sm:py-5">
                        <span className="font-bold text-manto-teal group-hover:text-manto-orange transition-colors">
                            {pedido.displayId}
                        </span>
                        {/* Achicamos el max-width de la descripción para que no empuje las otras columnas */}
                        <p className="text-[11px] sm:text-xs text-gray-500 mt-1 max-w-[120px] sm:max-w-[160px] truncate">{pedido.descripcion}</p>
                    </td>
                    <td className="px-4 py-4 sm:px-6 sm:py-5 text-sm text-gray-600 whitespace-nowrap">{pedido.fecha_pedido}</td>
                    <td className="px-4 py-4 sm:px-6 sm:py-5 whitespace-nowrap">
                        {getStatusBadge(pedido.estado_pedido)} 
                    </td>
                    <td className="px-4 py-4 sm:px-6 sm:py-5 whitespace-nowrap">
                        {getPaymentBadge(pedido.estado_pago)}
                    </td>
                    <td className="px-4 py-4 sm:px-6 sm:py-5 text-right font-bold text-manto-teal whitespace-nowrap">
                        {pedido.total}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      )}
      
      {showViewAll && (
        <div className="p-6 border-t border-manto-teal/5 text-center bg-white/30">
          <Link 
            href="/orders" 
            className="text-manto-orange font-bold hover:underline inline-flex items-center gap-2 transition-all hover:gap-3"
          >
            Ver todos los pedidos <ArrowRight size={16} />
          </Link>
        </div>
      )}

    </div>
  );
}