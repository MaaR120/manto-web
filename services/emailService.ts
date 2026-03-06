import { Resend } from 'resend';

// Inicializamos el cliente con tu llave secreta
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOrderConfirmationEmail = async (
    emailCliente: string,
    nombreCliente: string,
    orderId: number
) => {
    try {
        const { data, error } = await resend.emails.send({
            from: 'Manto Web <onboarding@resend.dev>', // Esta es la cuenta de prueba de Resend
            to: [emailCliente],
            subject: `¡Pago Aprobado! Confirmación de tu pedido #${orderId}`,
            html: `
        <div style="font-family: sans-serif; padding: 20px; max-w: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 10px;">
          <h2 style="color: #0f766e;">¡Gracias por tu compra, ${nombreCliente}! 🧉</h2>
          <p style="color: #374151; font-size: 16px;">
            Queríamos avisarte que tu pago por Mercado Pago ha sido aprobado exitosamente y ya estamos preparando tu pedido <strong>#${orderId}</strong>.
          </p>
          <div style="background-color: #f0fdfa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #0f766e; font-weight: bold;">
              Podés ver el estado de tu envío y el detalle completo ingresando a tu panel de cliente en nuestra web.
            </p>
          </div>
          <p style="color: #6b7280; font-size: 14px;">¡Un abrazo de parte del equipo de Manto!</p>
        </div>
      `
        });

        if (error) {
            console.error("🔴 Error de Resend:", error);
            return { success: false, error };
        }

        console.log("🟢 Correo enviado con éxito a:", emailCliente);
        return { success: true, data };

    } catch (error) {
        console.error("🔴 Error en emailService:", error);
        return { success: false, error };
    }
};