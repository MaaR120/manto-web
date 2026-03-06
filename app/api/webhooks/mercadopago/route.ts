// app/api/webhooks/mercadopago/route.ts
import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { supabaseAdmin } from "@/lib/supabaseAdmin"; // El cliente con permisos de admin
import { LOGISTICS_STATES, PAYMENT_STATES } from "@/utils/orderStatus";
import { sendOrderConfirmationEmail } from "@/services/emailService";

export async function POST(request: Request) {
    try {
        // 1. Mercado pago nos manda un JSON en el body
        const body = await request.json();

        // MP a veces manda notificaciones de otras cosas, solo nos importan los pagos creados/actualizados
        if (body.type === "payment" || body.topic === "payment") {
            const paymentId = body.data.id;

            // 2. Inicializamos el SDK de MP
            const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });
            const paymentClient = new Payment(client);

            // 3. Le preguntamos a MP los detalles de este pago usando el ID
            const paymentData = await paymentClient.get({ id: paymentId });

            // 4. Extraemos los datos clave
            const estadoPagoMP = paymentData.status; // ej: "approved", "pending", "rejected"
            const pedidoIdString = paymentData.external_reference; // Acá viene nuestro ID de base de datos (Ej: "15")

            if (!pedidoIdString) {
                return NextResponse.json({ success: true, message: "Falta external_reference. Ignorado." });
            }

            const pedidoId = Number(pedidoIdString);

            // 5. Mapeamos el estado de MP a nuestros IDs de base de datos
            let nuevoEstadoPagoId = PAYMENT_STATES.PENDIENTE; // Por defecto (1)
            let nuevoEstadoPedidoId = LOGISTICS_STATES.RECIBIDO; // Por defecto (2)

            if (estadoPagoMP === 'approved') {
                nuevoEstadoPagoId = PAYMENT_STATES.APROBADO; // (2)
                nuevoEstadoPedidoId = LOGISTICS_STATES.PREPARANDO; // (1)
            } else if (estadoPagoMP === 'rejected' || estadoPagoMP === 'cancelled') {
                nuevoEstadoPagoId = PAYMENT_STATES.RECHAZADO; // (3)
                nuevoEstadoPedidoId = LOGISTICS_STATES.CANCELADO; // (5)
            } else if (estadoPagoMP === 'refunded') {
                nuevoEstadoPagoId = PAYMENT_STATES.REEMBOLSADO; // (4)
                nuevoEstadoPedidoId = LOGISTICS_STATES.CANCELADO; // (5)
            }

            // 6. Actualizamos nuestra base de datos como Admin
            const { data: pedidoPagado, error } = await supabaseAdmin
                .from('pedido')
                .update({ estado_pago_id: nuevoEstadoPagoId, estado_pedido_id: nuevoEstadoPedidoId })
                .eq('id', pedidoId)
                .select(`
                id,
                cliente (
                    nombre,
                    email
                )
                `)
                .single();

            if (error) throw error;

            console.log(`✅ Webhook MP: Pedido #${pedidoId} actualizado a estado de pago ID: ${nuevoEstadoPagoId} y estado de pedido ID: ${nuevoEstadoPedidoId}`);

            // 7. Si el pago fue aprobado, mandamos el correo de confirmación
            if (nuevoEstadoPagoId === PAYMENT_STATES.APROBADO && pedidoPagado && pedidoPagado.cliente) {
                // Supabase join devuelve un array, por eso accedemos al índice [0]
                const cliente = Array.isArray(pedidoPagado.cliente) ? pedidoPagado.cliente[0] : pedidoPagado.cliente;
                //const emailDestino = cliente.email;
                const emailDestino = "martineguren120@gmail.com";
                const nombreDestino = cliente.nombre || 'Matero';
                if (cliente && cliente.email) {
                    await sendOrderConfirmationEmail(
                        emailDestino,
                        nombreDestino,
                        pedidoId
                    );
                }
            }
        }

        // Siempre hay que responderle un HTTP 200 a MP rápido para que sepa que recibimos el mensaje
        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("🔴 Error en el Webhook de MP:", error.message);
        // Respondemos 500 para que MP intente enviar la notificación de nuevo más tarde
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}