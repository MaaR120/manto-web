"use client"; 

import { CheckCircle, Clock, Package, Truck, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DTOPedido as Pedido } from "@/services/orderService";

interface Props {
  pedidos: Pedido[];
  title?: string;
  showViewAll?: boolean;
}

const getStatusBadge = (statusId: string) => {
    switch (statusId) {
        case "Pendiente": return <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Clock size={12}/> Pendiente</span>;
        case "Enviado": return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Truck size={12}/> Enviado</span>;
        case "Entregado": return <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle size={12}/> Entregado</span>;
        default: return <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-bold w-fit">Desconocido</span>;
    }
};

export function OrderList({ 
  pedidos, 
  title = "Últimos Pedidos", 
  showViewAll = true 
}: Props) {
  
  const router = useRouter(); 

  // --- CORRECCIÓN 1: Recibimos 'number' y lo usamos directo ---
  const handleRowClick = (id: number) => {
    // Ya no hacemos slice. El ID ya viene limpio del servicio (ej: 15)
    router.push(`/orders/${id}`);
  };

  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl border border-manto-teal/10 shadow-sm overflow-hidden h-full flex flex-col">
      
      <div className="p-8 border-b border-manto-teal/5">
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
        <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
            <thead className="bg-manto-teal/5 text-manto-teal uppercase text-xs font-bold tracking-wider">
                <tr>
                <th className="px-8 py-4">Pedido</th>
                <th className="px-8 py-4">Fecha</th>
                <th className="px-8 py-4">Estado</th>
                <th className="px-8 py-4 text-right">Total</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-manto-teal/5">
                {pedidos.map((pedido) => (
                <tr 
                    key={pedido.id} 
                    onClick={() => handleRowClick(pedido.id)}
                    className="hover:bg-white/60 transition-colors cursor-pointer group"
                >
                    <td className="px-8 py-6">
                        <span className="font-bold text-manto-teal group-hover:text-manto-orange transition-colors">
                            {/* --- CORRECCIÓN 2: Usamos displayId que ya trae el #MN-00X --- */}
                            {pedido.displayId}
                        </span>
                        <p className="text-xs text-gray-500 mt-1 max-w-[200px] truncate">{pedido.descripcion}</p>
                    </td>
                    <td className="px-8 py-6 text-gray-600 whitespace-nowrap">{pedido.fecha_pedido}</td>
                    <td className="px-8 py-6">
                        {getStatusBadge(pedido.estado_pedido)} 
                    </td>
                    <td className="px-8 py-6 text-right font-bold text-manto-teal whitespace-nowrap">
                        {pedido.total}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      )}
      
      {showViewAll && (
        <div className="p-8 border-t border-manto-teal/5 text-center bg-white/30">
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