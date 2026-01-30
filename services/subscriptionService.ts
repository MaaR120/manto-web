import { supabase } from "@/lib/supabase";
import { SupabaseClient } from "@supabase/supabase-js";

// 1. DTOs de SALIDA (Para el Frontend)
export interface DTOMetodoPago {
  marca: string;      
  ultimos_4: string;  
  tipo: string;       
  expiracion: string; 
}

export interface DTOSuscripcion {
  id: number;
  estado: string;
  fecha_inicio: string;
  proximo_cobro: string;
  direccion_envio: string;
  plan: string;
  monto: string;
  metodo_pago: DTOMetodoPago | null; 
}

// 2. Interfaz de ENTRADA (Refleja la respuesta cruda de Supabase)
// Esta interfaz define CÓMO vienen los datos de la base de datos con los Joins
interface SuscripcionDBResponse {
  id: number;
  fecha_inicio: string;
  fecha_cobro: string;
  direccion_envio: string | null;
  // Relaciones
  estado_suscripcion: { nombre: string } | null;
  metodo_pago: {
    marca: string;
    ultimos_4: string;
    tipo: string;
    exp_mes: number;
    exp_anio: number;
  } | null;
  tipo_suscripcion: {
    nombre: string;
    precio_recurrente: number;
  } | null;
}

export const subscriptionService = {
  
  async getSubscriptionByEmail(email: string, client: SupabaseClient | null = null): Promise<DTOSuscripcion | null> {
    const supabaseClient = client || supabase;

    // A. Obtener ID de cliente
    const { data: cliente } = await supabaseClient
      .from('cliente')
      .select('id')
      .eq('email', email)
      .single();

    if (!cliente) return null;

    // B. Obtener Suscripción + JOINs
    const { data, error } = await supabaseClient
      .from('suscripcion')
      .select(`
        *,
        estado_suscripcion ( nombre ),
        metodo_pago (
            marca,
            ultimos_4,
            tipo,
            exp_mes,
            exp_anio
        ),
        tipo_suscripcion (
            nombre,
            precio_recurrente
        )
      `)
      .eq('cliente_id', cliente.id)
      .single();

    if (error || !data) return null;

    // C. Casting Seguro: Le decimos a TS que 'data' cumple con nuestra interfaz DB
    const sub = data as unknown as SuscripcionDBResponse;

    // D. Helper para formatear tarjeta
    // Ahora 'sub.metodo_pago' ya está tipado, no necesitamos 'any'
    let metodoPagoFormateado: DTOMetodoPago | null = null;

    if (sub.metodo_pago) {
        metodoPagoFormateado = {
            marca: sub.metodo_pago.marca,
            ultimos_4: sub.metodo_pago.ultimos_4,
            tipo: sub.metodo_pago.tipo || 'credito',
            // Formateamos la fecha MM/AA
            expiracion: `${String(sub.metodo_pago.exp_mes).padStart(2, '0')}/${String(sub.metodo_pago.exp_anio).slice(-2)}`
        };
    }

    // E. Retornar DTO completo
    return {
      id: sub.id,
      estado: sub.estado_suscripcion?.nombre || 'Desconocido',
      
      fecha_inicio: new Date(sub.fecha_inicio).toLocaleDateString('es-AR', {
        day: 'numeric', month: 'long', year: 'numeric'
      }),
      
      proximo_cobro: new Date(sub.fecha_cobro).toLocaleDateString('es-AR', {
        day: 'numeric', month: 'long', year: 'numeric'
      }),

      direccion_envio: sub.direccion_envio || 'Sin dirección registrada',
      
      // Datos dinámicos desde la nueva relación 'tipo_suscripcion'
      plan: sub.tipo_suscripcion?.nombre || 'Plan Desconocido',
      
      // Formateo simple del precio
      monto: `$ ${sub.tipo_suscripcion?.precio_recurrente?.toLocaleString('es-AR') || '15.000'}`,

      metodo_pago: metodoPagoFormateado 
    };
  }
};