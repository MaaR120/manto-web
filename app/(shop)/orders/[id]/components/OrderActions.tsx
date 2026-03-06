"use client";

import { CreditCard, XCircle } from "lucide-react";
import { cancelarPedidoAction } from "@/actions/order-actions";

interface Props {
    orderId: number;
    urlPago?: string | null;
    isPendiente: boolean;
}

export function OrderActions({ orderId, urlPago, isPendiente }: Props) {
    // Si no está pendiente, no renderizamos nada
    if (!isPendiente) return null;

    const handleCancelar = async () => {
        if (confirm('¿Estás seguro de cancelar este pedido? Esta acción no se puede deshacer.')) {
            const res = await cancelarPedidoAction(orderId);
            if (!res.success) {
                alert("Error al cancelar: " + res.message);
            }
        }
    };

    return (
        <div className="flex items-center gap-2">
            {urlPago && (
                <a
                    href={urlPago}
                    title="Terminar Pago"
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors text-sm font-bold"
                >
                    <CreditCard size={16} /> Pagar
                </a>
            )}
            <button
                onClick={handleCancelar}
                title="Cancelar Pedido"
                className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors text-sm font-bold"
            >
                <XCircle size={16} /> Cancelar
            </button>
        </div>
    );
}