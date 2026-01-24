import { Package } from "lucide-react";

interface Pedido {
  id: string;
  fecha: string;
  estado: string;
  total: string;
  descripcion: string;
}

interface Props {
  pedidos: Pedido[];
}

export function OrderList({ pedidos }: Props) {
  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl border border-manto-teal/10 shadow-sm overflow-hidden h-full">
      <div className="p-8 border-b border-manto-teal/5">
        <h2 className="text-xl font-bold text-manto-teal flex items-center gap-2">
          <Package size={20} /> Historial de Pedidos
        </h2>
      </div>
      
      {pedidos.length === 0 ? (
         <div className="p-12 text-center text-gray-500">
             <Package size={48} className="mx-auto mb-4 opacity-20" />
             <p>Aún no has realizado pedidos.</p>
         </div>
      ) : (
        <div className="overflow-x-auto">
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
                <tr key={pedido.id} className="hover:bg-white/60 transition-colors cursor-pointer">
                    <td className="px-8 py-6">
                    <span className="font-bold text-manto-teal">{pedido.id}</span>
                    <p className="text-xs text-gray-500 mt-1 max-w-[200px] truncate">{pedido.descripcion}</p>
                    </td>
                    <td className="px-8 py-6 text-gray-600 whitespace-nowrap">{pedido.fecha}</td>
                    <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap
                        ${pedido.estado === 'Entregado' ? 'bg-green-100 text-green-700' : 
                        pedido.estado === 'Enviado' ? 'bg-blue-100 text-blue-700' : 
                        'bg-gray-100 text-gray-700'}
                    `}>
                        {pedido.estado}
                    </span>
                    </td>
                    <td className="px-8 py-6 text-right font-bold text-manto-teal whitespace-nowrap">{pedido.total}</td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      )}
      
      <div className="p-8 border-t border-manto-teal/5 text-center">
        <button className="text-manto-orange font-bold hover:underline">
          Ver todos los pedidos
        </button>
      </div>
    </div>
  );
}