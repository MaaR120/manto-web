"use client";

import { Item } from '@/types'; 
import { formatCurrency } from "@/utils/format";
import { ShoppingCart, Eye } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import Image from "next/image"; // <--- Importamos Image

interface Props {
  producto: Item;
  onClickDetail: () => void;
}

export default function ProductCard({ producto, onClickDetail }: Props) {
  const { addToCart } = useCart();
  const [agregado, setAgregado] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que clickar el botón dispare el "Ver Detalle" si la card fuera un link
    addToCart(producto);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 500);
  };

  return (
    <div onClick={onClickDetail} className="group relative w-full bg-white/50 backdrop-blur-sm rounded-3xl border border-manto-teal/10 hover:border-manto-orange/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col overflow-hidden">
      
      {/* 1. Contenedor Principal con Padding Generoso y GAP */}
      <div className="p-6 flex flex-col items-center flex-grow gap-4">
        
        {/* Imagen Circular */}
        <div className="relative w-40 h-40 flex-shrink-0">
            <div className="absolute inset-0 bg-manto-teal/5 rounded-full group-hover:bg-manto-orange/10 transition-colors duration-300" />
            {producto.imagen_url ? (
              <Image 
                src={producto.imagen_url} 
                alt={producto.nombre} 
                width={160} 
                height={160}
                className="rounded-full object-cover p-2 w-full h-full drop-shadow-sm transition-transform duration-300 group-hover:scale-110"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-5xl">🧉</div>
            )}
        </div>

        {/* Info del Producto */}
        <div className="text-center space-y-2 w-full">
          <h3 className="text-lg font-bold text-manto-teal leading-tight line-clamp-2 h-12 flex items-center justify-center">
            {producto.nombre}
          </h3>
          
          <div className="flex flex-col items-center justify-center gap-1">
            <p className="text-2xl font-black text-manto-orange tracking-tight">
              {formatCurrency(producto.precio)}
            </p>
            
            {/* Etiqueta de Puntos (con altura fija para no saltar si no tiene) */}
            <div className="h-6">
                {producto.precio_puntos && (
                <span className="text-[10px] font-bold text-manto-teal/80 bg-manto-teal/10 px-3 py-1 rounded-full uppercase tracking-wider">
                    Canje: {producto.precio_puntos} pts
                </span>
                )}
            </div>
          </div>
        </div>

      </div>

      {/* 2. Sección de Botones (Footer integrado) */}
      <div className="px-6 pb-6 pt-0 mt-auto flex flex-col gap-3">
        
        {/* Botón Ver Detalle (Secundario) */}

          <button onClick={(e) => {
            e.stopPropagation(); // Evita doble click si la card entera tuviera onClick
            onClickDetail(); // <--- LLAMAMOS A LA FUNCIÓN DEL PADRE
          }} 
          className="w-full py-2.5 rounded-xl text-sm font-bold text-manto-teal border border-manto-teal/20 hover:bg-manto-teal/5 hover:border-manto-teal transition-colors flex items-center justify-center gap-2">
            <Eye size={16} /> Ver Detalle
          </button>

        {/* Botón Agregar (Principal) */}
        <button 
          onClick={handleAdd}
          className={`
            w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-md
            ${agregado 
              ? "bg-green-500 text-white scale-95 ring-2 ring-green-200" 
              : "bg-manto-teal text-white hover:bg-manto-teal/90 hover:shadow-lg"
            }
          `}
        >
          <ShoppingCart size={18} className={agregado ? "animate-bounce" : ""} />
          {agregado ? "¡Listo!" : "Agregar al carrito"}
        </button>
      </div>
      
    </div>
  );
}