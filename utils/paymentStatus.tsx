// Función local para colorear el estado de pago
export const getPaymentBadge = (estado: string) => {
    switch(estado?.toLowerCase()) {
      case 'aprobado':
        return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">{estado}</span>;
      case 'pendiente':
        return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200">{estado}</span>;
      case 'rechazado':
        return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200">{estado}</span>;
      case 'reembolsado':
        return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">{estado}</span>;
      default:
        return <span className="bg-gray-50 text-gray-500 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">{estado}</span>;
    }
  };