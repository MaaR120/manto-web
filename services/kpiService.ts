// services/dashboard.service.ts
import { createClient } from "@/lib/supabaseServer";

export interface DashboardStats {
  ingresosTotales: number;
  pedidosCount: number;
  clientesCount: number;
  stockBajoCount: number;
  productosCount: number;
}

export const kpiService = async (): Promise<DashboardStats> => {
  const supabase = await createClient();

  // Ejecutamos las consultas en paralelo para máxima velocidad
  const [
    { count: clientesCount },
    { count: productosCount },
    { count: pedidosCount, data: pedidosData },
    { count: stockBajoCount }
  ] = await Promise.all([
    // 1. Clientes (excluyendo admins)
    supabase.from("cliente").select("*", { count: "exact", head: true }).neq('rol', 'admin'),

    // 2. Productos Totales
    supabase.from("item").select("*", { count: "exact", head: true }),

    // 3. Pedidos (traemos el total para sumar)
    supabase.from("pedido").select("total, estado_pago_id", { count: "exact" }),

    // 4. Stock Bajo (< 5 unidades)
    supabase.from("item").select("*", { count: "exact", head: true }).lt('stock', 5)
  ]);

  // Lógica de negocio: Calcular suma de ingresos
  // Lógica de negocio: Calcular suma SOLO de los pagados
  const ingresosTotales = pedidosData?.reduce((acc, pedido) => {
    // Solo sumamos si el estado coincide con PAGADO
    if (pedido.estado_pago_id === 2) {
      return acc + (pedido.total || 0);
    }
    // Si no está pagado, devolvemos el acumulador sin cambios
    return acc;
  }, 0) || 0;

  // Retornamos datos limpios y listos para usar
  return {
    ingresosTotales,
    pedidosCount: pedidosCount || 0,
    clientesCount: clientesCount || 0,
    stockBajoCount: stockBajoCount || 0,
    productosCount: productosCount || 0,
  };
};