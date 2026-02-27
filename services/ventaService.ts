import { createClient } from "@/lib/supabaseServer";

// 1. Creamos una interfaz para agrupar todos los filtros
export interface FiltrosVenta {
  estadoPedidoId?: string;
  estadoPagoId?: string;
  searchQuery?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  proveedorPago?: string;
}

// 2. La función ahora recibe UN SOLO parámetro (el objeto)
export const getVentas = async (filtros: FiltrosVenta = {}) => {
  const supabase = await createClient();

  let query = supabase
  .from("pedido")
  .select(`
    id,
    fecha_pedido,
    fecha_despacho,
    fecha_entrega,
    total,
    cod_seguimiento,
    proveedor_pago,
    cliente!inner (nombre, email, telefono, instagram),
    estado_pedido ( id, nombre ),
    estado_pago ( id, nombre )
  `);
  
  // Aplicamos los filtros leyendo las propiedades del objeto
  if (filtros.estadoPedidoId && filtros.estadoPedidoId !== "todos") {
    query = query.eq("estado_pedido_id", Number(filtros.estadoPedidoId));
  }

  if (filtros.estadoPagoId && filtros.estadoPagoId !== "todos") {
    query = query.eq("estado_pago_id", Number(filtros.estadoPagoId));
  }

  if (filtros.proveedorPago && filtros.proveedorPago !== "todos") {
    query = query.eq("proveedor_pago", filtros.proveedorPago);
  }

  if (filtros.fechaDesde) {
    query = query.gte("fecha_pedido", `${filtros.fechaDesde}T00:00:00.000Z`);
  }

  if (filtros.fechaHasta) {
    query = query.lte("fecha_pedido", `${filtros.fechaHasta}T23:59:59.999Z`);
  }

  if (filtros.searchQuery) {
    const q = `%${filtros.searchQuery}%`;
    query = query.or(
      `nombre.ilike.${q},email.ilike.${q},telefono.ilike.${q},instagram.ilike.${q}`, 
      { foreignTable: "cliente" }
    );
  }

  const { data, error } = await query.order("fecha_pedido", { ascending: false }); 

  if (error) {
    console.error("Error cargando ventas:", error);
    return [];
  }

  return data;
};