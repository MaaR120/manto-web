// services/dashboardService.ts
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/utils/format';
import { SupabaseClient } from '@supabase/supabase-js';


// Define la forma EXACTA de los datos que devuelve tu consulta de Supabase
interface PedidoDashboard {
  id: number;
  fecha_pedido: string | null;
  total: number;
  estado_pedido: { 
    nombre: string 
  } | null;
  // OJO: Supabase devuelve un array aquí porque un pedido tiene varios items
  pedido_item: { 
    cantidad: number;
    item: { 
      nombre: string 
    } | null;
  }[];
}

export const dashboardService = {
  async obtenerDatosUsuarioLogueado(clienteSupabase: SupabaseClient | null = null) {
    const cliente = clienteSupabase || supabase;

    // 1. Log de Auth
    const { data: { user }, error: authError } = await cliente.auth.getUser();
    
    if (authError) {
        console.log("🔴 Error de Auth:", authError.message);
        return null;
    }
    
    if (!user || !user.email) { 
        console.log("🔴 No hay usuario o no tiene email.");
        return null;
    }
    
    console.log("🟢 Usuario Auth OK:", user.email);

    // 2. Log de Base de Datos
    const { data: usuarioDB, error: dbError } = await cliente 
      .from('cliente')
      .select('id')
      .eq('email', user.email)
      .single(); // <--- Aquí puede fallar si hay más de 1 o ninguno

    if (dbError) {
        console.log("🔴 Error buscando en tabla Cliente:", dbError.message);
        return null; // Probablemente sea: "Row not found"
    }

    if (!usuarioDB) {
        console.log("🔴 El email existe en Auth, pero NO en la tabla 'cliente'.");
        return null;
    }

    console.log("🟢 Usuario DB encontrado ID:", usuarioDB.id);
    
    return await this.obtenerDatosDashboard(usuarioDB.id);
  },

    async obtenerDatosDashboard(usuarioId: number) {
    
    // 1. Obtener Cliente (Perfil)
    const { data: cliente, error: errorCliente } = await supabase
      .from('cliente') // Singular
      .select('*')
      .eq('id', usuarioId)
      .single();

    if (errorCliente) console.error("Error cliente:", errorCliente);

    // 2. Obtener Suscripción (Si tiene)
    // OJO: Asumimos que la tabla de estados se llama 'estado_suscripcion'
    const { data: suscripcion } = await supabase
      .from('suscripcion') // Singular
      .select('*, estado_suscripcion(nombre)') 
      .eq('cliente_id', usuarioId)
      .maybeSingle();

    // 3. Obtener Pedidos Recientes
    // Traemos el pedido + nombre del estado + items dentro
    const { data: pedidos } = await supabase
      .from('pedido') // Singular
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

    // 4. Empaquetamos todo limpio para el Frontend
    return {
      usuario: {
        id: cliente?.id,
        nombre: cliente?.nombre || 'Usuario',
        email: cliente?.email || '',
        direccion: cliente?.direccion || '',
        nivel: cliente?.etiqueta || 'Matero Iniciado', 
        puntos: cliente?.puntos_acumulados || 0,
      },
      suscripcion: suscripcion ? {
        // @ ts-ignore (A veces TS se queja de los joins anidados automáticos)
        estado: suscripcion.estado_suscripcion?.nombre || 'Desconocido',
        proximoCobro: new Date(suscripcion.fecha_cobro).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' }),
        direccion: suscripcion.direccion_envio
      } : null,
      pedidos: (pedidos || []).map((p: PedidoDashboard) => ({
        id: `#MN-${p.id.toString().padStart(3, '0')}`,
        fecha: p.fecha_pedido 
        ? new Date(p.fecha_pedido).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'Fecha desconocida',
        estado: p.estado_pedido?.nombre || 'Pendiente',
        total: formatCurrency(p.total),
        
        // Lógica visual corregida con nombres en SINGULAR
        descripcion: p.pedido_item.length > 0 
            ? `${p.pedido_item[0].cantidad}x ${p.pedido_item[0].item?.nombre}` + (p.pedido_item.length > 1 ? '...' : '')
            : 'Sin items'
        }))
    };
    
  },
  async actualizarPerfil(usuarioId: number, datos: { nombre: string; direccion: string }) {
    const { error } = await supabase
      .from('cliente')
      .update(datos)
      .eq('id', usuarioId);

    if (error) throw error;
    return true;
  }
  
  
};