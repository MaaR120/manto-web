"use server";

import { createClient } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";
import type { CartItem } from '@/context/CartContext';
// 1. Importamos Mercado Pago
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { supabaseAdmin } from "@/lib/supabaseAdmin";



interface DireccionEstructurada {
  calle: string;
  altura: string;
  piso?: string;
  depto?: string;
  codigo_postal: string;
  ciudad: string;
  provincia: string;
}

interface CheckoutPayload {
  items: CartItem[];
  total: number;
  direccion: DireccionEstructurada;
  guardarDireccion: boolean;
  proveedor_pago: string;
}

export async function createOrderAction(payload: CheckoutPayload) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) return { success: false, message: "No autenticado" };

  const { data: cliente } = await supabase.from('cliente').select('id, nombre').eq('id_auth', user.id).single();
  if (!cliente) return { success: false, message: "Cliente no encontrado" };

  if (payload.guardarDireccion) {
    await supabaseAdmin.from('direccion_cliente').update({ es_principal: false }).eq('cliente_id', cliente.id);
    await supabaseAdmin.from('direccion_cliente').insert({
      cliente_id: cliente.id,
      calle: payload.direccion.calle,
      altura: payload.direccion.altura,
      piso: payload.direccion.piso || null,
      codigo_postal: payload.direccion.codigo_postal,
      ciudad: payload.direccion.ciudad,
      provincia: payload.direccion.provincia,
      es_principal: true,
      alias: "Casa"
    });
  }

  const pisoStr = payload.direccion.piso ? ` Piso ${payload.direccion.piso}` : '';
  const deptoStr = payload.direccion.depto ? ` Dpto ${payload.direccion.depto}` : '';
  const direccionCompleta = `${payload.direccion.calle} ${payload.direccion.altura}${pisoStr}${deptoStr}, ${payload.direccion.ciudad}, ${payload.direccion.provincia} (CP: ${payload.direccion.codigo_postal})`;

  // ==========================================
  // 🛡️ INICIO DE LA "TRANSACCIÓN"
  // ==========================================
  let pedidoCreadoId: number | null = null;
  // Guardamos los items procesados para poder devolver el stock si algo falla
  let itemsProcesados: { id: number, quantity: number }[] = [];

  try {
    // 1. CREAMOS EL PEDIDO
    const { data: pedido, error: pedidoError } = await supabaseAdmin
      .from('pedido')
      .insert({
        cliente_id: cliente.id,
        total: payload.total,
        fecha_pedido: new Date().toISOString(),
        estado_pedido_id: 1,
        estado_pago_id: 1,
        proveedor_pago: payload.proveedor_pago,
        envio_calle: payload.direccion.calle,
        envio_altura: payload.direccion.altura,
        envio_piso: payload.direccion.piso || null,
        envio_cp: payload.direccion.codigo_postal,
        envio_ciudad: payload.direccion.ciudad,
        envio_provincia: payload.direccion.provincia,
        direccion_envio: direccionCompleta
      })
      .select()
      .single();

    if (pedidoError || !pedido) throw new Error("Error al crear la cabecera del pedido.");

    // Guardamos el ID por si tenemos que dar marcha atrás
    pedidoCreadoId = pedido.id;

    // 2. INSERTAMOS ITEMS Y BAJAMOS STOCK
    for (const item of payload.items) {
      // Insertar item en el pedido
      const { error: itemInsertError } = await supabaseAdmin.from('pedido_item').insert({
        pedido_id: pedido.id,
        item_id: item.id,
        cantidad: item.quantity,
        precio_unitario: item.precio
      });

      if (itemInsertError) throw new Error(`Error al insertar item ${item.nombre}`);

      // BAJAR STOCK vía RPC
      const { error: stockError } = await supabaseAdmin.rpc('bajar_stock', {
        item_id_param: item.id,
        cantidad_param: item.quantity
      });

      if (stockError) throw new Error(`No hay stock suficiente para ${item.nombre}`);

      // Si salió bien, lo anotamos por si hay que revertir después
      itemsProcesados.push({ id: item.id, quantity: item.quantity });
    }

    // 3. INTEGRACIÓN MERCADO PAGO
    let initPoint = null;

    if (payload.proveedor_pago === 'MERCADO_PAGO') {
      const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });
      const preference = new Preference(client);

      const mpItems = payload.items.map(item => ({
        id: String(item.id),
        title: item.nombre,
        quantity: item.quantity,
        unit_price: Number(item.precio),
        currency_id: 'ARS',
      }));

      const result = await preference.create({
        body: {
          items: mpItems,
          external_reference: String(pedido.id),
          payer: {
            name: cliente.nombre || "Cliente Manto",
            email: user.email,
          },
          back_urls: {
            success: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?status=success`,
            failure: `${process.env.NEXT_PUBLIC_SITE_URL}/cart?status=failure`,
            pending: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?status=pending`,
          },
          auto_return: 'approved',
        }
      });

      initPoint = result.init_point;

      if (initPoint) {
        await supabaseAdmin
          .from('pedido')
          .update({ url_pago_checkout: initPoint })
          .eq('id', pedido.id);
      }
    }
    // Si todo salió perfecto, refrescamos y devolvemos éxito
    revalidatePath('/dashboard');
    revalidatePath('/admin/ventas');
    return { success: true, pedidoId: pedido.id, initPoint };

  } catch (error: any) {
    console.error("🔴 ERROR EN LA TRANSACCIÓN:", error.message);

    // ==========================================
    // 🚨 ROLLBACK EXTENDIDO
    // ==========================================

    // 1. Devolvemos el stock de lo que llegamos a procesar
    for (const item of itemsProcesados) {
      await supabaseAdmin.rpc('subir_stock', {
        item_id_param: item.id,
        cantidad_param: item.quantity
      });
    }

    // 2. Borramos el pedido fantasma
    if (pedidoCreadoId) {
      await supabaseAdmin.from('pedido').delete().eq('id', pedidoCreadoId);
    }

    return { success: false, message: error.message || "Error al procesar la compra." };
  }
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


export async function cancelarPedidoAction(orderId: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "No autenticado" };

  try {
    // 1. Buscamos el pedido, verificamos dueño y TRAEMOS LOS ITEMS
    // Usamos supabaseAdmin para asegurarnos de traer los items aunque haya RLS estrictos
    const { data: pedido, error: fetchError } = await supabaseAdmin
      .from('pedido')
      .select(`
        id, 
        cliente!inner(id_auth), 
        pedido_item(item_id, cantidad)
      `)
      .eq('id', orderId)
      .single();

    if (fetchError || !pedido) return { success: false, message: "Pedido no encontrado" };

    // Verificación de seguridad: ¿El pedido es del pibe que está logueado?
    const clienteData = Array.isArray(pedido.cliente) ? pedido.cliente[0] : pedido.cliente;

    if (!clienteData || clienteData.id_auth !== user.id) {
      return { success: false, message: "No autorizado para cancelar este pedido" };
    }

    // 2. REPOSICIÓN DE STOCK
    // Iteramos los items que tenía el pedido y los devolvemos al inventario
    const promesasStock = pedido.pedido_item.map(item =>
      supabaseAdmin.rpc('subir_stock', {
        item_id_param: item.item_id,
        cantidad_param: item.cantidad
      })
    );

    // Ejecutamos todas las subidas de stock en paralelo para que sea más rápido
    const resultadosStock = await Promise.all(promesasStock);

    // Check rápido por si falló algún RPC
    if (resultadosStock.some(r => r.error)) {
      throw new Error("Error al intentar devolver los items al stock.");
    }

    // 3. ACTUALIZAMOS EL ESTADO DEL PEDIDO
    const { error: updateError } = await supabaseAdmin
      .from('pedido')
      .update({
        estado_pedido_id: 5, // 5 = Cancelado
        url_pago_checkout: null // Matamos el link de Mercado Pago
      })
      .eq('id', orderId);

    if (updateError) throw new Error("No se pudo actualizar el estado del pedido.");

    // Refrescamos las rutas para que el usuario vea el cambio al toque
    revalidatePath('/dashboard');
    revalidatePath(`/orders/${orderId}`);
    revalidatePath('/admin/ventas');

    return { success: true };

  } catch (error: any) {
    console.error("🔴 Error al cancelar pedido:", error.message);
    return { success: false, message: error.message };
  }
}
