import { Clock, Truck, CheckCircle, XCircle, DollarSign, Package } from "lucide-react";

export const getStatusBadge = (statusName: string | null | undefined) => {
    
    // 1. Protección contra nulos
    if (!statusName) return <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-xs font-bold border border-gray-200">Sin estado</span>;

    // 2. Normalización (Hacemos que no importe si dice "Pendiente" o "pendiente")
    const status = statusName.toLowerCase().trim();

    // 3. Lógica flexible (usamos 'includes' por si el estado dice "Pago Confirmado" en vez de solo "Pagado")
    if (status.includes("pendiente")) {
        return (
            <span className="bg-yellow-100 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                <Clock size={12}/> Pendiente
            </span>
        );
    }

    if (status.includes("pagado") || status.includes("aprobado")) {
        return (
            <span className="bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                <DollarSign size={12}/> Pagado
            </span>
        );
    }

    if (status.includes("enviado") || status.includes("despachado")) {
        return (
            <span className="bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                <Truck size={12}/> Enviado
            </span>
        );
    }

    if (status.includes("entregado")) {
        return (
            <span className="bg-teal-100 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                <CheckCircle size={12}/> Entregado
            </span>
        );
    }

    if (status.includes("cancelado") || status.includes("rechazado")) {
        return (
            <span className="bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                <XCircle size={12}/> Cancelado
            </span>
        );
    }

    // Default
    return (
        <span className="bg-gray-100 text-gray-600 border border-gray-200 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
            <Package size={12}/> {statusName}
        </span>
    );
};