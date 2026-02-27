"use client";

import { useState } from "react";
import { updateOrderStatus } from "@/actions/order-actions"; // Ajustá tu ruta
import { LOGISTICS_STATES, PAYMENT_STATES, LOGISTICS_OPTIONS, isDangerousTransition } from "@/utils/orderStatus";
import { Loader2 } from "lucide-react";

interface Props {
  orderId: number;
  initialStatusId: number;
  paymentStatusId: number;
  paymentProvider: string;
  orderTotal: string; // NUEVO: Para mostrar en el cartel de Efectivo (Ej: "$ 15.000")
}

export default function OrderStatusManager({ orderId, initialStatusId, paymentStatusId, paymentProvider, orderTotal }: Props) {
  const [statusId, setStatusId] = useState(initialStatusId);
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextId = Number(e.target.value);
    let newPaymentIdToSet = undefined; // Por defecto no tocamos el pago

    // ==========================================
    // 🛡️ REGLAS DE NEGOCIO Y ADVERTENCIAS
    // ==========================================

    const noEstaPagado = paymentStatusId !== PAYMENT_STATES.APROBADO;
    const esEfectivo = paymentProvider === 'EFECTIVO_REPARTIDOR';

    // REGLA 1: Movimientos peligrosos o ir hacia atrás
    if (isDangerousTransition(statusId, nextId)) {
      const confirm = window.confirm("⚠️ Estás retrocediendo el estado del pedido o saltando pasos importantes.\n\n¿Estás seguro de hacer esto?");
      if (!confirm) {
        e.target.value = String(statusId);
        return;
      }
    }

    // REGLA 2: No se puede ENVIAR ni ENTREGAR si no está pagado (Excepto Efectivo)
    if ((nextId === LOGISTICS_STATES.ENVIADO || nextId === LOGISTICS_STATES.ENTREGADO) && noEstaPagado && !esEfectivo) {
      alert("⛔ BLOQUEADO: No puedes enviar ni entregar un pedido que no ha sido pagado por Mercado Pago.");
      e.target.value = String(statusId);
      return;
    }

    // REGLA 3: Efectivo -> Al entregar, se cobra automáticamente
    if (nextId === LOGISTICS_STATES.ENTREGADO && esEfectivo && noEstaPagado) {
      const confirm = window.confirm(`💵 COBRO EN EFECTIVO\n\nSi cambia a Entregado, el estado de pago pasará automáticamente a Pagado.\n\nTotal a cobrar: ${orderTotal}\n\n¿Desea confirmar?`);
      if (!confirm) {
        e.target.value = String(statusId);
        return;
      }
      newPaymentIdToSet = PAYMENT_STATES.APROBADO; // Mandamos la orden de cambiar el pago
    }

    // REGLA 4: Cancelar un pedido ya pagado
    if (nextId === LOGISTICS_STATES.CANCELADO && !noEstaPagado) {
      const confirm = window.confirm(
        "⚠️ ATENCIÓN: Este pedido ya está PAGADO.\n\n" +
        "Si lo cancelas, el dinero NO se devuelve automáticamente. Deberás contactar al cliente para la devolución.\n\n" +
        "¿Estás seguro de que deseas cancelarlo?"
      );
      if (!confirm) {
        e.target.value = String(statusId);
        return;
      }
    }

    // ==========================================
    // 🚀 EJECUCIÓN DEL CAMBIO
    // ==========================================
    setLoading(true);
    try {
      // Le pasamos el 3er parámetro (si aplica)
      const res = await updateOrderStatus(orderId, nextId, newPaymentIdToSet);
      if (res.success) {
        setStatusId(nextId);
      } else {
        alert(res.message);
        e.target.value = String(statusId);
      }
    } catch (error) {
      alert("Error crítico al actualizar el estado.");
      e.target.value = String(statusId);
    } finally {
      setLoading(false);
    }
  };

  const opcionesValidas = LOGISTICS_OPTIONS.filter(opt => opt.id !== "todos");

  return (
    <div className="flex items-center gap-2">
      <select
        value={statusId}
        onChange={handleStatusChange}
        disabled={loading} // <-- ¡CORREGIDO! Ya no bloqueamos si está entregado/cancelado
        className={`text-xs font-bold px-3 py-1.5 rounded-full border outline-none transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-wait ${statusId === LOGISTICS_STATES.RECIBIDO ? "bg-gray-100 text-gray-700 border-gray-200" :
            statusId === LOGISTICS_STATES.PREPARANDO ? "bg-purple-100 text-purple-700 border-purple-200" :
              statusId === LOGISTICS_STATES.ENVIADO ? "bg-blue-100 text-blue-700 border-blue-200" :
                statusId === LOGISTICS_STATES.ENTREGADO ? "bg-teal-100 text-teal-700 border-teal-200" :
                  "bg-red-100 text-red-700 border-red-200"
          }`}
      >
        {opcionesValidas.map(opt => (
          <option key={opt.id} value={opt.id} className="bg-white text-gray-800">
            {opt.label}
          </option>
        ))}
      </select>
      {loading && <Loader2 size={14} className="animate-spin text-manto-teal" />}
    </div>
  );
}