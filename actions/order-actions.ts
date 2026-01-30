"use server";

import { createClient } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";
import { Item } from '@/types'; 

interface DireccionEstructurada {
  calle: string;
  altura: string;
  piso?: string;
  cp: string;
  ciudad: string;
  provincia: string;
}

interface CheckoutPayload {
  items: Item[];
  total: number;
  direccion: DireccionEstructurada; // <--- Cambio aquí
  guardarDireccion: boolean; 
  cardId: number | null; 
}

export async function createOrderAction(payload: CheckoutPayload) {
  const supabase = await createClient();
  
  // 1. Verificar Usuario
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) return { success: false, message: "No autenticado" };

  // 2. Obtener Cliente
  const { data: cliente } = await supabase.from('cliente').select('id').eq('email', user.email).single();
  if (!cliente) return { success: false, message: "Cliente no encontrado" };

  // 3. (Opcional) Actualizar dirección predeterminada del cliente
  if (payload.guardarDireccion) {
    // A. Quitamos 'es_principal' de otras direcciones si esta será la nueva principal
    await supabase
        .from('direccion_cliente')
        .update({ es_principal: false })
        .eq('cliente_id', cliente.id);

    // B. Insertamos la nueva desglosada
    await supabase.from('direccion_cliente').insert({
        cliente_id: cliente.id,
        calle: payload.direccion.calle,
        altura: payload.direccion.altura,
        piso: payload.direccion.piso,
        codigo_postal: payload.direccion.cp,
        ciudad: payload.direccion.ciudad,
        provincia: payload.direccion.provincia,
        es_principal: true,
        alias: "Casa" // Default
    });
  }

  // 4. Crear Pedido con SNAPSHOT (Copia fiel de los datos en ese momento)
  const { data: pedido, error: pedidoError } = await supabase
    .from('pedido')
    .insert({
      cliente_id: cliente.id,
      total: payload.total,
      fecha_pedido: new Date().toISOString(),
      estado_pedido_id: 1,
      
      // Guardamos desglosado para futuras integraciones logísticas
      envio_calle: payload.direccion.calle,
      envio_altura: payload.direccion.altura,
      envio_piso: payload.direccion.piso,
      envio_cp: payload.direccion.cp,
      envio_ciudad: payload.direccion.ciudad,
      envio_provincia: payload.direccion.provincia,
      
      // Mantenemos la vieja columna 'direccion_envio' como string formateado 
      // solo para mostrar rápido en listas simples, si quieres.
      direccion_envio: `${payload.direccion.calle} ${payload.direccion.altura}, ${payload.direccion.ciudad}`
    })
    .select()
    .single();

  if (pedidoError || !pedido) {
    console.error(pedidoError);
    return { success: false, message: "Error al crear el pedido" };
  }

  // 5. Insertar Items
  const itemsParaInsertar = payload.items.map(item => ({
    pedido_id: pedido.id,
    item_id: item.id,
    cantidad: item.quantity,
    precio_unitario: item.precio
  }));

  const { error: itemsError } = await supabase
    .from('pedido_item')
    .insert(itemsParaInsertar);

  if (itemsError) return { success: false, message: "Error al guardar items" };

  revalidatePath('/dashboard');
  return { success: true, pedidoId: pedido.id };
}