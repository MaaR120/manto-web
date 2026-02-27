// services/ventaDetailService.ts
import { SupabaseClient } from "@supabase/supabase-js";
import { formatCurrency } from "@/utils/format";

export const ventaDetailService = {
  async getVentaById(id: number, supabase: SupabaseClient) {
    const { data, error } = await supabase
      .from('pedido')
      .select(`
        id,
        fecha_pedido,
        fecha_despacho,
        fecha_entrega,
        total,
        direccion_envio,
        envio_provincia,
        cod_seguimiento,
        proveedor_pago,
        estado_pedido_id,
        estado_pago_id,
        cliente!inner (
          id,
          nombre,
          email,
          telefono,
          instagram
        ),
        estado_pedido ( nombre ),
        estado_pago ( nombre ),
        pedido_item (
          cantidad,
          precio_unitario,
          item (
            id,
            nombre,
            imagen_url
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error("Error fetching venta detail:", error);
      return null;
    }

    // Mapeo seguro de items
    const items = data.pedido_item?.map((pi: any) => {
      const itemObj = pi.item;
      let imagen_url = null;
      if (itemObj?.item_imagen && itemObj.item_imagen.length > 0) {
        imagen_url = itemObj.item_imagen[0].url;
      }
      return {
        item_id: itemObj?.id,
        nombre_item: itemObj?.nombre || 'Producto',
        cantidad: pi.cantidad,
        precio_unitario: formatCurrency(pi.precio_unitario),
        subtotal: formatCurrency(pi.cantidad * pi.precio_unitario),
        imagen_url,
      };
    }) || [];

    // Formateo de fechas
    const formatDate = (dateString: string | null) => {
      if (!dateString) return null;
      return new Date(dateString).toLocaleDateString('es-AR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    };

    // Aplanar el cliente si viene como array
    const cliente = Array.isArray(data.cliente) ? data.cliente[0] : data.cliente;
    const estadoPedido = Array.isArray(data.estado_pedido) ? data.estado_pedido[0] : data.estado_pedido;
    const estadoPago = Array.isArray(data.estado_pago) ? data.estado_pago[0] : data.estado_pago;

    return {
      id: data.id,
      fecha_pedido: formatDate(data.fecha_pedido),
      fecha_despacho: formatDate(data.fecha_despacho),
      fecha_entrega: formatDate(data.fecha_entrega),
      estado_pedido: estadoPedido?.nombre || 'Pendiente',
      estado_pedido_id: data.estado_pedido_id,
      estado_pago: estadoPago?.nombre || 'Pendiente',
      estado_pago_id: data.estado_pago_id,
      proveedor_pago: data.proveedor_pago,
      direccion_envio: data.direccion_envio,
      provincia: data.envio_provincia,
      cod_seguimiento: data.cod_seguimiento,
      total_formateado: formatCurrency(data.total),
      total_numero: data.total,
      cliente: cliente,
      items,
    };
  }
};