import { kpiService } from "@/services/kpiService"; // Importamos el servicio
import { formatCurrency } from "@/utils/format";
import { DollarSign, ShoppingBag, Users, Package, TrendingUp, AlertTriangle } from "lucide-react";

// Forzamos dinamismo porque los datos cambian constantemente
export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  // 1. LLAMADA AL SERVICIO (Una sola línea limpia)
  const { 
    ingresosTotales, 
    pedidosCount, 
    clientesCount, 
    stockBajoCount 
  } = await kpiService();

  // 2. RENDERIZADO (Solo UI)
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Panel de Control</h1>
        <p className="text-gray-500 mt-2">Bienvenido, Jefe. Aquí está el pulso de tu negocio hoy.</p>
      </div>

      {/* GRID DE TARJETAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Tarjeta 1: Ingresos */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-manto-teal/30 transition-all">
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Ingresos Totales</p>
            <h3 className="text-2xl font-black text-gray-800 mt-1">{formatCurrency(ingresosTotales)}</h3>
          </div>
          <div className="bg-green-100 p-3 rounded-xl text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
            <DollarSign size={24} />
          </div>
        </div>

        {/* Tarjeta 2: Ventas */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-manto-teal/30 transition-all">
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Pedidos Totales</p>
            <h3 className="text-2xl font-black text-gray-800 mt-1">{pedidosCount}</h3>
          </div>
          <div className="bg-blue-100 p-3 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <ShoppingBag size={24} />
          </div>
        </div>

        {/* Tarjeta 3: Clientes */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-manto-teal/30 transition-all">
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Clientes Activos</p>
            <h3 className="text-2xl font-black text-gray-800 mt-1">{clientesCount}</h3>
          </div>
          <div className="bg-manto-teal/10 p-3 rounded-xl text-manto-teal group-hover:bg-manto-teal group-hover:text-white transition-colors">
            <Users size={24} />
          </div>
        </div>

        {/* Tarjeta 4: Stock Bajo */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-manto-teal/30 transition-all">
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Alertas Stock</p>
            <h3 className="text-2xl font-black text-gray-800 mt-1">{stockBajoCount}</h3>
            <p className="text-xs text-orange-500 mt-1 font-medium">
              {stockBajoCount > 0 ? "Reponer urgente" : "Todo en orden"}
            </p>
          </div>
          <div className={`p-3 rounded-xl transition-colors ${stockBajoCount > 0 ? 'bg-orange-100 text-orange-600 group-hover:bg-orange-600 group-hover:text-white' : 'bg-gray-100 text-gray-400'}`}>
            {stockBajoCount > 0 ? <AlertTriangle size={24} /> : <Package size={24} />}
          </div>
        </div>
      </div>

      {/* Placeholders UI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[300px] flex flex-col items-center justify-center text-center">
            <TrendingUp size={48} className="text-gray-200 mb-4" />
            <h3 className="text-lg font-bold text-gray-400">Gráfico de Ventas</h3>
            <p className="text-sm text-gray-400">Próximamente...</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[300px] flex flex-col items-center justify-center text-center">
             <Package size={48} className="text-gray-200 mb-4" />
            <h3 className="text-lg font-bold text-gray-400">Productos Más Vendidos</h3>
            <p className="text-sm text-gray-400">Próximamente...</p>
        </div>
      </div>
    </div>
  );
}