"use server";

import { createClient } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";
import type { CartItem } from '@/context/CartContext';

interface DireccionEstructurada {
  calle: string;
  altura: string;
  piso?: string;
  depto?: string; // Lo sumamos por las dudas
  codigo_postal: string; // <-- CORREGIDO: Coincide con el frontend
  ciudad: string;
  provincia: string;
}

interface CheckoutPayload {
  items: CartItem[];
  total: number;
  direccion: DireccionEstructurada;
  guardarDireccion: boolean;
  proveedor_pago: string; // <-- NUEVO: 'MERCADO_PAGO' o 'EFECTIVO_REPARTIDOR'
}

export async function createOrderAction(payload: CheckoutPayload) {
  const supabase = await createClient();

  // 1. Verificar Usuario
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) return { success: false, message: "No autenticado" };

  // 2. Obtener Cliente
  const { data: cliente } = await supabase.from('cliente').select('id').eq('id_auth', user.id).single();
  if (!cliente) return { success: false, message: "Cliente no encontrado" };

  // 3. (Opcional) Actualizar dirección predeterminada del cliente
  if (payload.guardarDireccion) {
    // A. Quitamos 'es_principal' de otras direcciones
    await supabase
      .from('direccion_cliente')
      .update({ es_principal: false })
      .eq('cliente_id', cliente.id);

    // B. Insertamos la nueva desglosada
    await supabase.from('direccion_cliente').insert({
      cliente_id: cliente.id,
      calle: payload.direccion.calle,
      altura: payload.direccion.altura,
      piso: payload.direccion.piso || null,
      codigo_postal: payload.direccion.codigo_postal, // Corregido
      ciudad: payload.direccion.ciudad,
      provincia: payload.direccion.provincia,
      es_principal: true,
      alias: "Casa"
    });
  }

  // 4. Armar el string completo de la dirección (para vistas rápidas)
  const pisoStr = payload.direccion.piso ? ` Piso ${payload.direccion.piso}` : '';
  const deptoStr = payload.direccion.depto ? ` Dpto ${payload.direccion.depto}` : '';
  const direccionCompleta = `${payload.direccion.calle} ${payload.direccion.altura}${pisoStr}${deptoStr}, ${payload.direccion.ciudad}, ${payload.direccion.provincia} (CP: ${payload.direccion.codigo_postal})`;


  // 5. Crear Pedido con SNAPSHOT
  const { data: pedido, error: pedidoError } = await supabase
    .from('pedido')
    .insert({
      cliente_id: cliente.id,
      total: payload.total,
      fecha_pedido: new Date().toISOString(),

      // --- NUEVA LÓGICA DE ESTADOS ---
      estado_pedido_id: 1, // Logística: 1 (Recibido)
      estado_pago_id: 1,   // Finanzas: 1 (Pendiente)
      proveedor_pago: payload.proveedor_pago,

      // --- DATOS DE ENVÍO DESGLOSADOS ---
      envio_calle: payload.direccion.calle,
      envio_altura: payload.direccion.altura,
      envio_piso: payload.direccion.piso || null,
      envio_cp: payload.direccion.codigo_postal, // Corregido
      envio_ciudad: payload.direccion.ciudad,
      envio_provincia: payload.direccion.provincia,

      // Resumen
      direccion_envio: direccionCompleta
    })
    .select()
    .single();

  if (pedidoError || !pedido) {
    console.error("Error al crear el pedido:", pedidoError);
    return { success: false, message: "Error al crear el pedido" };
  }

  // 6. Insertar Items
  const itemsParaInsertar = payload.items.map(item => ({
    pedido_id: pedido.id,
    item_id: item.id,
    cantidad: item.quantity,
    precio_unitario: item.precio
  }));

  const { error: itemsError } = await supabase
    .from('pedido_item')
    .insert(itemsParaInsertar);

  if (itemsError) {
    console.error("Error al guardar items:", itemsError);
    return { success: false, message: "Error al guardar items" };
  }

  revalidatePath('/dashboard');
  revalidatePath('/admin/ventas');
  return { success: true, pedidoId: pedido.id };
}


// Le agregamos el 3er parámetro opcional: newPaymentStatusId
export async function updateOrderStatus(orderId: number, newStatusId: number, newPaymentStatusId?: number) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, message: "No autenticado" };

  // 1. Preparamos los datos a actualizar en la logística
  const updateData: any = {
    estado_pedido_id: newStatusId,
    fecha_entrega: newStatusId === 4 ? new Date().toISOString() : null,
    // (Opcional) podés dejar que la fecha_despacho no se borre si ya estaba, pero lo dejamos como lo tenías por ahora
    fecha_despacho: newStatusId === 3 ? new Date().toISOString() : null
  };

  // 2. Si nos mandan un nuevo estado de pago, lo sumamos al paquete
  if (newPaymentStatusId) {
    updateData.estado_pago_id = newPaymentStatusId;
  }

  // 3. Actualizamos todo en un solo viaje a la base de datos
  const { data, error } = await supabase
    .from('pedido')
    .update(updateData)
    .eq('id', orderId)
    .select();

  if (error || !data || data.length === 0) {
    return { success: false, message: "Error al actualizar la base de datos." };
  }

  // Refrescamos las rutas
  revalidatePath('/admin/ventas');
  revalidatePath(`/admin/ventas/${orderId}`);
  revalidatePath('/dashboard');
  revalidatePath(`/orders/${orderId}`);

  return { success: true };
}