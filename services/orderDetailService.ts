import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/utils/format";

// 1. Interfaz de SALIDA (Para tu Frontend)
export interface DTODetallePedido {
  id: number;
  fecha_pedido: string;
  fecha_despacho: string;
  fecha_entrega: string;
  total: number;
  total_formateado: string;
  estado_pedido: string;
  direccion_envio: string;
  items: {
    nombre_item: string;
    cantidad: number;
    precio_unitario: string;
    subtotal: string;
    imagen_url: string | null;
  }[];
}

// 2. Interfaz de ENTRADA (Lo que responde Supabase crudo)
// Esta debe coincidir EXACTAMENTE con la estructura de tu .select()
interface PedidoDBResponse {
  id: number;
  fecha_pedido: string | null;
  fecha_despacho: string | null;
  fecha_entrega: string | null;
  total: number;
  direccion_envio: string | null;
  // Relaciones (Joins)
  estado_pedido: {
    nombre: string;
  } | null; 
  pedido_item: {
    cantidad: number;
    precio_unitario: number;
    item: {
      nombre: string;
      imagen_url: string | null;
    } | null;
  }[];
}

export const orderDetailService = {
  async getOrderDetailById(orderId: number): Promise<DTODetallePedido | null> {

    const { data, error } = await supabase
      .from('pedido')
      .select(`
        *,
        estado_pedido ( nombre ),
        pedido_item (
            cantidad,
            precio_unitario,
            item (
                nombre,
                imagen_url
            )
        )
      `)
      .eq('id', orderId)
      .single();

    if (error || !data) {
      console.error("Error al cargar pedido:", error);
      return null;
    }

    // 3. Tipado Seguro: "Casteamos" la data desconocida a nuestra interfaz DB
    // Usamos 'unknown' como paso intermedio seguro en lugar de 'any'
    const pedido = data as unknown as PedidoDBResponse;

    // Ahora TypeScript sabe exáctamente qué propiedades tiene 'pedido'
    return {
      id: pedido.id,
      fecha_pedido: pedido.fecha_pedido
        ? new Date(pedido.fecha_pedido).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : "-",
      fecha_despacho: pedido.fecha_despacho
        ? new Date(pedido.fecha_despacho).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : "-",
      fecha_entrega: pedido.fecha_entrega
        ? new Date(pedido.fecha_entrega).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : "-",

      estado_pedido: pedido.estado_pedido?.nombre || "Desconocido",
      total: pedido.total,
      total_formateado: formatCurrency(pedido.total),
      direccion_envio: pedido.direccion_envio || "Retiro en tienda",

      // Al saber que 'pedido' es 'PedidoDBResponse', aquí ya no da error
      items: pedido.pedido_item.map((pi) => ({
        nombre_item: pi.item?.nombre || "Producto eliminado",
        cantidad: pi.cantidad,
        precio_unitario: formatCurrency(pi.precio_unitario),
        subtotal: formatCurrency(pi.cantidad * pi.precio_unitario),
        imagen_url: pi.item?.imagen_url || null
      }))
    };
  }
};