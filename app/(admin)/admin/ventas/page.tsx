import { getVentas } from "@/services/ventaService";
import { formatCurrency } from "@/utils/format";
import { Truck, Calendar, User, CheckCircle, CreditCard } from "lucide-react";
import OrderStatusManager from "@/components/OrderStatusManager";
import OrderActions from "@/components/OrderActions";
import StatusFilter from "@/components/StatusFilter";
import SearchOrders from "@/components/SearchOrders";
import { LOGISTICS_OPTIONS, PAYMENT_OPTIONS, PROVIDER_OPTIONS } from "@/utils/orderStatus";
import { getPaymentBadge } from "@/utils/paymentStatus"
import DateRangeFilter from "@/components/DateRangeFilter";

export const dynamic = 'force-dynamic';

type VentasPageProps = {
  searchParams: Promise<{ estado_pedido?: string; estado_pago?: string; q?: string; fechaDesde?: string; fechaHasta?: string; proveedor_pago?: string }>;
};

export default async function VentasPage({ searchParams }: VentasPageProps) {

  const params = await searchParams;

  // 1. Armamos el objeto con lo que venga de la URL
  const filtrosActivos = {
    estadoPedidoId: params?.estado_pedido,
    estadoPagoId: params?.estado_pago,
    searchQuery: params?.q,
    fechaDesde: params?.fechaDesde,
    fechaHasta: params?.fechaHasta,
    proveedorPago: params?.proveedor_pago,
  };

  // 2. Le pasamos el objeto al servicio (¡adiós errores de posición!)
  const pedidos = await getVentas(filtrosActivos);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Mis Ventas</h1>
          <p className="text-gray-500 mt-1">Gestiona logística y cobros desde un solo lugar.</p>
        </div>
        <div className="text-sm font-medium bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
          Total registros: {pedidos.length}
        </div>
      </div>

      {/* --- BARRA DE HERRAMIENTAS --- */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4">
        {/* Lado izquierdo: Buscador general */}
        <div className="w-full sm:w-auto flex-1">
          <SearchOrders />
        </div>

        {/* Lado derecho: Filtro de fechas */}
        <div className="w-full sm:w-auto">
          <DateRangeFilter />
        </div>
      </div>

      {/* Tabla de Datos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto h-[800px] overflow-y-auto relative custom-scrollbar">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-4 font-bold">ID / Fecha</th>
                <th className="px-6 py-4 font-bold">Cliente</th>

                {/* COLUMNA LOGÍSTICA */}
                <th className="px-6 py-4 font-bold min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <Truck size={14} className="text-gray-400" />
                    Logística
                    <StatusFilter paramKey="estado_pedido" options={LOGISTICS_OPTIONS} />
                  </div>
                </th>

                {/* COLUMNA PAGO */}
                <th className="px-6 py-4 font-bold min-w-[180px]">
                  <div className="flex flex-col gap-2">
                    {/* Filtro 1: Estado (Pagado, Pendiente) */}
                    <div className="flex items-center gap-2">
                      <CreditCard size={14} className="text-gray-400" />
                      Pago
                      <StatusFilter paramKey="estado_pago" options={PAYMENT_OPTIONS} />
                    </div>

                    {/* Filtro 2: Método (Mercado Pago, Efectivo) */}
                    <div className="flex items-center gap-2 text-xs font-normal text-gray-500">
                      Método:
                      <StatusFilter paramKey="proveedor_pago" options={PROVIDER_OPTIONS} />
                    </div>
                  </div>
                </th>

                <th className="px-6 py-4 font-bold">Total</th>
                <th className="px-6 py-4 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pedidos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    No hay ventas que coincidan con los filtros.
                  </td>
                </tr>
              ) : (
                pedidos.map((pedido) => (
                  <tr key={pedido.id} className="hover:bg-gray-50/50 transition-colors group">

                    {/* ID y Fecha */}
                    <td className="px-6 py-4">
                      <div className="font-black text-gray-800 text-base mb-2">#{pedido.id}</div>
                      <div className="flex flex-col gap-1.5 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5" title="Fecha de pedido">
                          <Calendar size={13} />
                          {pedido.fecha_pedido ? new Date(pedido.fecha_pedido).toLocaleDateString() : "—"}
                        </div>
                        {pedido.fecha_despacho && (
                          <div className="flex items-center gap-1.5 text-blue-500 font-medium">
                            <Truck size={13} /> {new Date(pedido.fecha_despacho).toLocaleDateString()}
                          </div>
                        )}
                        {pedido.fecha_entrega && (
                          <div className="flex items-center gap-1.5 text-teal-600 font-medium">
                            <CheckCircle size={13} /> {new Date(pedido.fecha_entrega).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Cliente */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-manto-teal/10 flex items-center justify-center text-manto-teal">
                          <User size={14} />
                        </div>
                        <div>
                          <div className="font-medium text-gray-700">
                            {/* @ts-ignore */}
                            {pedido.cliente?.nombre || "Anónimo"}
                          </div>
                          <div className="text-xs text-gray-400">
                            {/* @ts-ignore */}
                            {pedido.cliente?.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Estado Logístico (Editable) */}
                    {/* Estado Logístico (Editable) */}
                    <td className="px-6 py-4">
                      <OrderStatusManager
                        orderId={pedido.id}
                        // @ts-ignore
                        initialStatusId={pedido.estado_pedido?.id || 1}
                        // @ts-ignore
                        paymentStatusId={pedido.estado_pago?.id || 1}
                        // @ts-ignore
                        paymentProvider={pedido.proveedor_pago}
                        orderTotal={formatCurrency(pedido.total)}
                      />
                    </td>
                    {/* Estado Pago (Visual y Método) */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2 items-start">
                        {/* El Badge de Aprobado/Pendiente que ya tenías */}
                        {/* @ts-ignore */}
                        {getPaymentBadge(pedido.estado_pago?.nombre || 'Pendiente')}

                        {/* El Método de pago (Tarjeta vs Efectivo) */}
                        <div className="text-[11px] font-medium text-gray-500 flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                          {/* @ts-ignore */}
                          {pedido.proveedor_pago === 'MERCADO_PAGO' ? (
                            <><span className="text-sm">💳</span> Mercado Pago</>
                          ) : /* @ts-ignore */
                            pedido.proveedor_pago === 'EFECTIVO_REPARTIDOR' ? (
                              <><span className="text-sm">💵</span> Efectivo en mano</>
                            ) : (
                              <><span className="text-sm">❓</span> Sin definir</>
                            )}
                        </div>
                      </div>
                    </td>


                    {/* Total */}
                    <td className="px-6 py-4 font-bold text-gray-700">
                      {formatCurrency(pedido.total)}
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4 text-center">
                      <OrderActions
                        id={pedido.id}
                        // @ts-ignore
                        telefono={pedido.cliente?.telefono}
                        // @ts-ignore
                        nombreCliente={pedido.cliente?.nombre || "Cliente"}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}