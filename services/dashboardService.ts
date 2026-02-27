// services/dashboardService.ts
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/utils/format';
import { SupabaseClient } from '@supabase/supabase-js';
import type { DTOPedido } from '@/services/orderService';

// 1. Definimos la interfaz de Dirección (Igual que en tu Frontend)
export interface AddressData {
  calle: string;
  altura: string;
  piso?: string;
  cp: string;
  ciudad: string;
  provincia: string;
  alias: string;
}

// 2. Interfaces de Respuesta DB
type EstadoPedidoRel = { nombre: string } | { nombre: string }[] | null;
type EstadoPagoRel = { nombre: string } | { nombre: string }[] | null;
type ItemRel = { nombre: string } | { nombre: string }[] | null;

interface PedidoDashboard {
  id: number;
  fecha_pedido: string | null;
  fecha_despacho: string | null;
  fecha_entrega: string | null;
  total: number;
  estado_pedido: EstadoPedidoRel;
  estado_pago: EstadoPagoRel;
  pedido_item: { cantidad: number; item: ItemRel }[];
}

interface UpdateProfilePayload {
  nombre: string;
  telefono: string | null;
  direccion: AddressData | null;
}

export const dashboardService = {
  async obtenerIdUsuarioLogueado(clienteSupabase: SupabaseClient | null = null) {
    const cliente = clienteSupabase || supabase;

    // A. Auth
    const { data: { user }, error: authError } = await cliente.auth.getUser();
    if (authError || !user || !user.email) return null;

    // B. Base de Datos
    const { data: usuarioDB, error: dbError } = await cliente.from('cliente').select('id').eq('id_auth', user.id).single();

    if (dbError || !usuarioDB) return null;
    return usuarioDB.id;
  },

  async obtenerDatosDashboard(clienteSupabase: SupabaseClient | null = null) {
    const usuarioId = await this.obtenerIdUsuarioLogueado(clienteSupabase);
    if (usuarioId === null) return null;

    const db = clienteSupabase || supabase;
    
    // 1. Obtener Cliente (Datos básicos)
    const { data: cliente } = await db
      .from('cliente')
      .select('*')
      .eq('id', usuarioId)
      .single();

      console.log("--- DEBUG DASHBOARD ---");
      console.log("1. Usuario ID logueado:", usuarioId);
      
    // 2. Obtener Dirección Principal
    const { data: dirPrincipal, error: dirError } = await db
      .from('direccion_cliente')
      .select('*')
      .eq('cliente_id', usuarioId)
      .eq('es_principal', true)
      .maybeSingle();

      console.log("2. Resultado Dirección:", dirPrincipal);
      console.log("3. Error Dirección (si hay):", dirError);
      console.log("-----------------------");
      
    // 3. Obtener Suscripción
    const { data: suscripcion } = await db
      .from('suscripcion')
      .select('*, estado_suscripcion(nombre)') 
      .eq('cliente_id', usuarioId)
      .maybeSingle();

    // 4. Obtener Pedidos Recientes
    const { data: pedidos } = await db
      .from('pedido')
      .select(`
        id, 
        fecha_pedido, 
        fecha_despacho, 
        fecha_entrega, 
        total, 
        estado_pedido(nombre),
        estado_pago(nombre),
        pedido_item(cantidad, item(nombre))
      `)
      .eq('cliente_id', usuarioId)
      .order('fecha_pedido', { ascending: false })
      .limit(5);

    // Si no hay cliente, no podemos mostrar el dashboard
    if (!cliente) return null;

    // 5. Mapeamos la dirección de la DB a la interfaz del Frontend
    let direccionFormateada: AddressData | null = null;
    if (dirPrincipal) {
        direccionFormateada = {
            calle: dirPrincipal.calle,
            altura: dirPrincipal.altura,
            piso: dirPrincipal.piso || "",
            cp: dirPrincipal.codigo_postal, 
            ciudad: dirPrincipal.ciudad,
            provincia: dirPrincipal.provincia,
            alias: dirPrincipal.alias || ''
        };
    }

    // 6. Retornamos todo empaquetado
    return {
      usuario: {
        id: cliente.id,
        nombre: cliente.nombre || 'Usuario',
        email: cliente.email || '',
        telefono: cliente.telefono || '', // <--- ¡CORRECCIÓN: Agregamos el teléfono acá!
        direccion: direccionFormateada, 
        nivel: cliente.etiqueta || 'Matero Iniciado', 
        puntos: cliente.puntos_acumulados || 0,
      },
      suscripcion: suscripcion ? {
        estado: suscripcion.estado_suscripcion?.nombre || 'Desconocido',
        proximoCobro: new Date(suscripcion.fecha_cobro).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' }),
        direccion: suscripcion.direccion_envio
      } : null,
      pedidos: (pedidos || []).map((p: PedidoDashboard): DTOPedido => {
        const estadoPedido = Array.isArray(p.estado_pedido) ? p.estado_pedido[0] : p.estado_pedido;
        const estadoPago = Array.isArray(p.estado_pago) ? p.estado_pago[0] : p.estado_pago;
        const items = p.pedido_item ?? [];
        const firstItem = items[0];
        const itemObj = firstItem?.item;
        const itemNombre = itemObj
          ? (Array.isArray(itemObj) ? itemObj[0]?.nombre : itemObj.nombre)
          : undefined;
        return {
          id: p.id,
          displayId: `#MN-${String(p.id).padStart(3, '0')}`,
          fecha_pedido: p.fecha_pedido
            ? new Date(p.fecha_pedido).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
            : 'Fecha desconocida',
          fecha_despacho: p.fecha_despacho
            ? new Date(p.fecha_despacho).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
            : '-',
          fecha_entrega: p.fecha_entrega
            ? new Date(p.fecha_entrega).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
            : '-',
          estado_pedido: estadoPedido?.nombre || 'Pendiente',
          estado_pago: estadoPago?.nombre || 'Pendiente',
          total: formatCurrency(p.total),
          totalNumber: p.total,
          descripcion: items.length > 0 && firstItem
            ? `${firstItem.cantidad}x ${itemNombre ?? 'Producto'}` + (items.length > 1 ? '...' : '')
            : 'Sin items',
        };
      })
    };
  },

  // --- LÓGICA DE ACTUALIZACIÓN PROFESIONAL ---
  async actualizarPerfil(usuarioId: number, data: UpdateProfilePayload) {
    
    // 1. Actualizamos el nombre y teléfono en tabla 'cliente'
    const { error: userError } = await supabase
      .from('cliente')
      .update({ nombre: data.nombre, telefono: data.telefono }) 
      .eq('id', usuarioId);

    if (userError) throw userError;

    // 2. Gestionamos la dirección en tabla 'direccion_cliente'
    if (data.direccion) {
        
        // A. Buscamos si ya tiene dirección principal
        const { data: existingAddress } = await supabase
            .from('direccion_cliente')
            .select('id')
            .eq('cliente_id', usuarioId)
            .eq('es_principal', true)
            .maybeSingle();

        // B. Preparamos datos limpios
        const datosDireccion = {
            calle: data.direccion.calle,
            altura: data.direccion.altura,
            piso: data.direccion.piso || null,
            codigo_postal: data.direccion.cp, 
            ciudad: data.direccion.ciudad,
            provincia: data.direccion.provincia,
            es_principal: true,
            alias: data.direccion.alias || 'Mi Casa' // <--- ¡CORRECCIÓN: Usamos el alias del form!
        };

        if (existingAddress) {
            // C. UPDATE
            const { error: addrError } = await supabase
                .from('direccion_cliente')
                .update(datosDireccion)
                .eq('id', existingAddress.id);
            if (addrError) throw addrError;
        } else {
            // D. INSERT
            const { error: addrError } = await supabase
                .from('direccion_cliente')
                .insert({
                    cliente_id: usuarioId,
                    ...datosDireccion
                });
            if (addrError) throw addrError;
        }
    }
    return true;
  }
};