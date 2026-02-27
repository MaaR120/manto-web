// components/OrderActions.tsx
"use client";

import Link from "next/link";
import { Eye, MessageCircle, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";

interface OrderActionsProps {
  id: number;
  telefono?: string | null; 
  nombreCliente: string;
}

export default function OrderActions({ id, telefono, nombreCliente }: OrderActionsProps) {



  // Lógica para limpiar el teléfono y armar el link de WhatsApp
  const cleanPhone = telefono?.replace(/[^0-9]/g, ''); // Quita espacios y símbolos
  const whatsappUrl = cleanPhone 
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hola ${nombreCliente}, te contacto por tu pedido #${id} en MANTO.`)}`
    : null;

  return (
    <div className="flex items-center justify-center gap-2">
      
      {/* 1. VER DETALLE */}
      <Link 
        href={`/admin/ventas/${id}`}
        className="p-2 bg-gray-50 hover:bg-manto-teal/10 text-gray-400 hover:text-manto-teal rounded-lg transition-colors border border-gray-200 hover:border-manto-teal/30"
        title="Ver Detalle"
      >
        <Eye size={18} />
      </Link>

      {/* 2. WHATSAPP (Solo si hay teléfono) */}
      {whatsappUrl ? (
        <a 
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700 rounded-lg transition-colors border border-green-200"
          title="Contactar al Cliente"
        >
          <MessageCircle size={18} />
        </a>
      ) : (
        // Botón deshabilitado si no hay teléfono
        <span className="p-2 bg-gray-50 text-gray-300 rounded-lg cursor-not-allowed border border-gray-100" title="Sin teléfono">
           <MessageCircle size={18} />
        </span>
      )}


    </div>
  );
}