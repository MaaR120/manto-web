"use client";

import { useState } from "react";
import Image from "next/image";
import { Item } from "@/types";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/utils/format";
import { X, ShoppingCart, Minus, Plus, Truck, ShieldCheck, Star } from "lucide-react";

interface Props {
  producto: Item | null; // Puede ser null si está cerrado
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductModal({ producto, isOpen, onClose }: Props) {
  const { addToCart } = useCart();
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);

  // Si no está abierto o no hay producto, no renderizamos nada
  if (!isOpen || !producto) return null;

  const handleAddToCart = () => {
    for (let i = 0; i < cantidad; i++) {
      addToCart(producto);
    }
    setAgregado(true);
    setTimeout(() => {
        setAgregado(false);
        onClose(); // Opcional: cerrar modal tras agregar
        setCantidad(1); // Reset cantidad
    }, 1000);
  };

  // Resetear cantidad al cerrar manualmente
  const handleCloseClick = () => {
    setCantidad(1);
    onClose();
  }

  return (
    // 1. BACKDROP (Fondo oscuro y borroso)
    <div 
      className="fixed inset-0 z-[100] bg-manto-teal/30 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300"
      onClick={handleCloseClick} // Click afuera cierra el modal
    >
      
      {/* 2. CONTENEDOR DEL MODAL (La caja blanca) */}
      <div 
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300 flex flex-col md:flex-row max-h-[90vh] md:max-h-[600px]"
        onClick={(e) => e.stopPropagation()} // Evita que clicks adentro cierren el modal
      >
        
        {/* Botón Cerrar (X) */}
        <button 
          onClick={handleCloseClick}
          className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur p-2 rounded-full text-gray-400 hover:text-manto-orange hover:bg-white transition-all shadow-sm"
        >
          <X size={24} />
        </button>

        {/* --- COLUMNA IZQUIERDA: IMAGEN --- */}
        <div className="w-full md:w-1/2 bg-manto-teal/5 relative flex items-center justify-center p-8 min-h-[300px]">
             {producto.imagen_url ? (
                 <Image 
                     src={producto.imagen_url} 
                     alt={producto.nombre} 
                     fill
                     className="object-contain p-4 transition-transform duration-500 hover:scale-105"
                 />
             ) : (
                 <span className="text-9xl">🧉</span>
             )}
             {/* Puntos (Overlay) */}
             {producto.precio_puntos && (
                <div className="absolute top-4 left-4 bg-manto-orange text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    Canje: {producto.precio_puntos} pts
                </div>
             )}
        </div>

        {/* --- COLUMNA DERECHA: INFO (Scrollable si es muy alta) --- */}
        <div className="w-full md:w-1/2 p-8 flex flex-col overflow-y-auto custom-scrollbar">
            
            <div className="mb-auto">
                <h2 className="text-2xl font-black text-manto-teal mb-2 leading-tight">
                    {producto.nombre}
                </h2>

                 {/* Fake Rating 
                 <div className="flex items-center gap-2 mb-4">
                    <div className="flex text-yellow-400 text-sm">
                        <Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" className="text-gray-200" />
                    </div>
                    <span className="text-xs text-gray-400">(Quick View)</span>
                </div>
                */}
                <p className="text-3xl font-bold text-manto-orange mb-6">
                    {formatCurrency(producto.precio)}
                </p>

                {/* Descripción Fake */}
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                    {/* Aquí iría producto.descripcion */}
                    Este es un producto destacado de la colección Manto. Diseñado para ofrecer la mejor experiencia matera, combinando tradición y calidad premium. Ideal para el uso diario o para regalar.
                </p>
            </div>
            
            {/* Controles de Compra */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex gap-4">
                     {/* Selector de Cantidad */}
                    <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 w-fit">
                        <button onClick={() => setCantidad(c => Math.max(1, c - 1))} className="p-3 text-manto-teal hover:bg-white rounded-l-xl transition-colors"><Minus size={18} /></button>
                        <span className="w-10 text-center font-bold text-gray-700">{cantidad}</span>
                        <button onClick={() => setCantidad(c => c + 1)} className="p-3 text-manto-teal hover:bg-white rounded-r-xl transition-colors"><Plus size={18} /></button>
                    </div>

                    {/* Botón Agregar Principal */}
                    <button 
                        onClick={handleAddToCart}
                        className={`
                            flex-1 py-3 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-md
                            ${agregado ? "bg-green-500 text-white scale-95" : "bg-manto-teal text-white hover:bg-manto-teal/90 hover:shadow-lg"}
                        `}
                    >
                        <ShoppingCart size={20} className={agregado ? "animate-bounce" : ""} />
                        {agregado ? "¡Listo!" : `Agregar ${cantidad > 1 ? `(${cantidad})` : ''}`}
                    </button>
                </div>
                
                 {/* Beneficios */}
                <div className="flex items-center justify-between text-xs text-gray-500 px-2">
                     <div className="flex items-center gap-2"><Truck size={16} className="text-manto-teal"/> Envío a todo el país</div>
                     <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-manto-teal"/> Garantía oficial</div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}