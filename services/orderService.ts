import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/utils/format";
import { SupabaseClient } from "@supabase/supabase-js";

// 1. Interfaz de SALIDA (Para el Frontend)
export interface DTOPedido {
  id: number;
  displayId: string;
  fecha_pedido: string;
  fecha_despacho: string;
  fecha_entrega: string;
  estado_pedido: string;
  total: string;
  totalNumber: number;
  descripcion: string;
  
}

// 2. Interfaz de ENTRADA (Para tipar lo que viene de Supabase y evitar 'any')
interface PedidoDBResponse {
  id: number;
  fecha_pedido: string | null;
  fecha_despacho: string | null;
  fecha_entrega: string | null;
  total: number;
  estado_pedido: { nombre: string } | null;
  suscripcion_id: boolean;
  pedido_item: {
    cantidad: number;
    item: { nombre: string } | null;
  }[];
}

export const orderService = {
  
  async getOrdersByUser(userId: number, client: SupabaseClient | null = null): Promise<DTOPedido[]> {
    
    const supabaseClient = client || supabase; 

    const { data, error } = await supabaseClient
      .from('pedido')
      .select(`
        *, 
        estado_pedido ( nombre ), 
        pedido_item (
          cantidad, 
          item ( nombre )
        )
      `)
      .eq('cliente_id', userId) // <--- ¡AQUÍ ESTABA EL ERROR! (Decía usuario_id)
      .order('fecha_pedido', { ascending: false });

    if (error || !data) {
      console.error("Error fetching orders:", error);
      return [];
    }

    // Casteo seguro para que TypeScript entienda la estructura de los Joins
    const pedidosRaw = data as unknown as PedidoDBResponse[];

    return pedidosRaw.map((p) => ({
      id: p.id, 
      displayId: `#MN-${String(p.id).padStart(3, '0')}`,
      
      fecha_pedido: p.fecha_pedido 
        ? new Date(p.fecha_pedido).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric'}) 
        : "-",

      fecha_despacho: p.fecha_despacho 
          ? new Date(p.fecha_despacho).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })
          : "-", 
      
      fecha_entrega: p.fecha_entrega 
          ? new Date(p.fecha_entrega).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })
          : "-",

      estado_pedido: p.estado_pedido?.nombre || 'Desconocido',
      
      total: formatCurrency(p.total),
      totalNumber: p.total,

      es_suscripcion: !!p.suscripcion_id,
      
      descripcion: p.pedido_item?.length > 0 
            ? `${p.pedido_item[0].cantidad}x ${p.pedido_item[0].item?.nombre || 'Producto'}` + (p.pedido_item.length > 1 ? '...' : '')
            : 'Sin items'
    }));
  }
};