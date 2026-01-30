// services/dashboardService.ts
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/utils/format';
import { SupabaseClient } from '@supabase/supabase-js';

// 1. Definimos la interfaz de Dirección (Igual que en tu Frontend)
export interface AddressData {
  calle: string;
  altura: string;
  piso?: string;
  cp: string;
  ciudad: string;
  provincia: string;
}

// 2. Interfaces de Respuesta DB
interface PedidoDashboard {
  id: number;
  fecha_pedido: string | null;
  total: number;
  estado_pedido: { 
    nombre: string 
  } | null;
  pedido_item: { 
    cantidad: number;
    item: { 
      nombre: string 
    } | null;
  }[];
}

interface UpdateProfilePayload {
  nombre: string;
  direccion: AddressData | null;
}

export const dashboardService = {
  async obtenerIdUsuarioLogueado(clienteSupabase: SupabaseClient | null = null) {
    const cliente = clienteSupabase || supabase;

    // A. Auth
    const { data: { user }, error: authError } = await cliente.auth.getUser();
    if (authError || !user || !user.email) return null;

    // B. Base de Datos
    const { data: usuarioDB, error: dbError } = await cliente 
      .from('cliente')
      .select('id')
      .eq('email', user.email)
      .single();

    if (dbError || !usuarioDB) return null;
    return usuarioDB.id;
  },

  async obtenerDatosDashboard(clienteSupabase: SupabaseClient | null = null) {
    const usuarioId = await this.obtenerIdUsuarioLogueado(clienteSupabase);
    if (usuarioId === null) return null;
    
    // 1. Obtener Cliente (Datos básicos)
    const { data: cliente } = await supabase
      .from('cliente')
      .select('*')
      .eq('id', usuarioId)
      .single();

    // 2. Obtener Dirección Principal (NUEVO: Desde la tabla direccion_cliente)
    const { data: dirPrincipal } = await supabase
      .from('direccion_cliente')
      .select('*')
      .eq('cliente_id', usuarioId)
      .eq('es_principal', true)
      .maybeSingle();

    // 3. Obtener Suscripción
    const { data: suscripcion } = await supabase
      .from('suscripcion')
      .select('*, estado_suscripcion(nombre)') 
      .eq('cliente_id', usuarioId)
      .maybeSingle();

    // 4. Obtener Pedidos Recientes
    const { data: pedidos } = await supabase
      .from('pedido')
      .select(`
        id, 
        fecha_pedido, 
        total, 
        estado_pedido(nombre),
        pedido_item(cantidad, item(nombre))
      `)
      .eq('cliente_id', usuarioId)
      .order('fecha_pedido', { ascending: false })
      .limit(5);

    // 5. Mapeamos la dirección de la DB a la interfaz del Frontend
    let direccionFormateada: AddressData | null = null;
    if (dirPrincipal) {
        direccionFormateada = {
            calle: dirPrincipal.calle,
            altura: dirPrincipal.altura,
            piso: dirPrincipal.piso || "",
            cp: dirPrincipal.codigo_postal, // OJO: Mapeamos codigo_postal -> cp
            ciudad: dirPrincipal.ciudad,
            provincia: dirPrincipal.provincia
        };
    }

    // 6. Retornamos todo empaquetado
    return {
      usuario: {
        id: cliente?.id,
        nombre: cliente?.nombre || 'Usuario',
        email: cliente?.email || '',
        // Ahora devolvemos el OBJETO, no el string viejo
        direccion: direccionFormateada, 
        nivel: cliente?.etiqueta || 'Matero Iniciado', 
        puntos: cliente?.puntos_acumulados || 0,
      },
      suscripcion: suscripcion ? {
        estado: suscripcion.estado_suscripcion?.nombre || 'Desconocido',
        proximoCobro: new Date(suscripcion.fecha_cobro).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' }),
        direccion: suscripcion.direccion_envio
      } : null,
      pedidos: (pedidos || []).map((p: PedidoDashboard) => ({ // Usamos any temporalmente en el map para evitar error de tipo estricto en el join
        id: `${p.id.toString().padStart(3, '0')}`,
        fecha_pedido: p.fecha_pedido 
        ? new Date(p.fecha_pedido).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'Fecha desconocida',
        estado_pedido: p.estado_pedido?.nombre || 'Pendiente',
        total: formatCurrency(p.total),
        descripcion: p.pedido_item.length > 0 
            ? `${p.pedido_item[0].cantidad}x ${p.pedido_item[0].item?.nombre}` + (p.pedido_item.length > 1 ? '...' : '')
            : 'Sin items'
        }))
    };
  },

  // --- LÓGICA DE ACTUALIZACIÓN PROFESIONAL ---
  async actualizarPerfil(usuarioId: number, data: UpdateProfilePayload) {
    
    // 1. Actualizamos el nombre en tabla 'cliente'
    const { error: userError } = await supabase
      .from('cliente')
      .update({ nombre: data.nombre }) 
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
            codigo_postal: data.direccion.cp, // Mapeo inverso cp -> codigo_postal
            ciudad: data.direccion.ciudad,
            provincia: data.direccion.provincia,
            es_principal: true,
            alias: 'Casa'
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