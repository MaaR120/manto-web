"use server";

import { createClient } from "@/lib/supabaseServer"; // Asegúrate que este sea tu cliente de servidor
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// Este DTO simula lo que vendría de un formulario de checkout
interface CheckoutData {
  planId: number; // ID del tipo_suscripcion (ej: 1)
  cardToken: string; // Token de MP/Stripe
  cardBrand: string; // "visa"
  cardLast4: string; // "4242"
}

export async function createSubscriptionAction(data: CheckoutData) {
  const supabase = await createClient();
  
  // 1. Verificar Usuario
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) return { success: false, message: "No autenticado" };

  // 2. Obtener cliente_id de tu tabla 'cliente'
  const { data: cliente } = await supabase.from('cliente').select('id').eq('email', user.email).single();
  if (!cliente) return { success: false, message: "Cliente no encontrado" };

  // 3. Guardar el Método de Pago (La 'Tokenización')
  // OJO: Aquí 'proveedor' y 'tipo' los hardcodeamos por simplicidad, en real vienen del form
  const { data: metodoPago, error: mpError } = await supabase
    .from('metodo_pago')
    .insert({
      cliente_id: cliente.id,
      proveedor: 'mercadopago', // O 'stripe'
      procesador_card_id: data.cardToken, 
      marca: data.cardBrand,
      tipo: 'credito',
      ultimos_4: data.cardLast4,
      exp_mes: 12, // Simulados para el ejemplo
      exp_anio: 2030,
      es_default: true
    })
    .select()
    .single();

  if (mpError || !metodoPago) {
    console.error(mpError);
    return { success: false, message: "Error al guardar tarjeta" };
  }

  // 4. Crear la Suscripción
  const fechaInicio = new Date();
  const proximoCobro = new Date();
  proximoCobro.setMonth(proximoCobro.getMonth() + 1); // +1 Mes

  const { data: suscripcion, error: subError } = await supabase
    .from('suscripcion')
    .insert({
      cliente_id: cliente.id,
      tipo_suscripcion_id: data.planId,
      metodo_pago_id: metodoPago.id,
      estado_suscripcion_id: 1, // Asumiendo 1 = 'Activa' en tu tabla de estados
      fecha_inicio: fechaInicio.toISOString(),
      fecha_cobro: proximoCobro.toISOString(),
      direccion_envio: "Calle Falsa 123, Mendoza" // Debería venir del checkout
    })
    .select()
    .single();

  if (subError) return { success: false, message: "Error al crear suscripción" };

  // 5. Generar el Primer Pedido
  const { data: pedido, error: pedidoError } = await supabase
    .from('pedido')
    .insert({
      cliente_id: cliente.id,
      suscripcion_id: suscripcion.id,
      fecha_pedido: new Date().toISOString(),
      total: 15000, 
      estado_pedido_id: 1, 
      direccion_envio: "Calle Falsa 123, Mendoza"
    })
    .select()
    .single();

  if (pedidoError || !pedido) return { success: false, message: "Error al crear pedido" };

  // --- LÓGICA DE ITEMS (Actualizada) ---

  // A. Buscamos la "receta". 
  // Nota: Como es el primer mes, traemos TODO.
  // (En el futuro Cron Job de renovación, filtrarás 'primer_mes.is.false')
  const { data: itemsDelPlan } = await supabase
    .from('tipo_suscripcion_item')
    .select('item_id, cantidad') // No necesitamos leer 'primer_mes' aquí si traemos todo
    .eq('tipo_suscripcion_id', data.planId);

  if (itemsDelPlan && itemsDelPlan.length > 0) {
    const itemsParaInsertar = itemsDelPlan.map((item) => ({
        pedido_id: pedido.id,
        item_id: item.item_id,
        cantidad: item.cantidad,
        // CORRECCIÓN: Tu tabla se llama 'precio_unitario', no 'precio'
        precio_unitario: 0 
    }));

    const { error: errorItems } = await supabase
        .from('pedido_item')
        .insert(itemsParaInsertar);

      if (errorItems) console.error("Error items:", errorItems);
  }

  // 6. Redireccionar al éxito
  revalidatePath('/dashboard');
  revalidatePath('/club/mi-suscripcion');
  redirect('/club/mi-suscripcion?success=true');
}