"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // Hook para leer la URL
import Image from "next/image";
import Link from "next/link";
import { catalogService } from "@/services/catalogService";
import { useCart } from "@/context/CartContext";
import { Item } from "@/types";
import { formatCurrency } from "@/utils/format";
import { 
  ShoppingCart, ArrowLeft, Truck, ShieldCheck, 
  Minus, Plus, Loader2, Star 
} from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const { addToCart } = useCart();
  
  const [producto, setProducto] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);

  // 1. Cargar el producto al entrar
  useEffect(() => {
    const fetchProduct = async () => {
      if (!params.id) return;
      // 1. Convertimos el string de la URL a número real
      const idNumerico = Number(params.id);

      // 2. Validamos que sea un número válido (por si alguien escribe /product/hola)
      if (isNaN(idNumerico)) {
          console.error("ID inválido");
          return;
      }
      const data = await catalogService.obtenerProductoPorId(idNumerico);
      setProducto(data);
      setLoading(false);
    };
    fetchProduct();
  }, [params.id]);

  // 2. Función para agregar varias unidades
  const handleAddToCart = () => {
    if (!producto) return;
    
    // Como tu addToCart del contexto suma de a 1, 
    // hacemos un bucle simple o (mejor) podrías mejorar el contexto luego.
    // Por ahora, para simplificar, lo llamamos 'cantidad' veces.
    for (let i = 0; i < cantidad; i++) {
        addToCart(producto);
    }

    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-manto-orange mb-4" size={48} />
        <p className="text-manto-teal/50">Cargando detalle...</p>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-manto-teal mb-4">Producto no encontrado</h2>
        <Link href="/" className="text-manto-orange hover:underline flex items-center gap-2">
          <ArrowLeft size={20} /> Volver a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Breadcrumb / Volver */}
      <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-manto-teal mb-8 transition-colors">
        <ArrowLeft size={18} /> Volver al catálogo
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        
        {/* --- COLUMNA IZQUIERDA: IMAGEN --- */}
        <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-manto-teal/10 p-8 shadow-sm flex items-center justify-center aspect-square relative overflow-hidden group">
                {/* Fondo decorativo */}
                <div className="absolute inset-0 bg-gradient-to-br from-manto-teal/5 to-transparent opacity-50" />
                
                {producto.imagen_url ? (
                    <Image 
                        src={producto.imagen_url} 
                        alt={producto.nombre} 
                        fill
                        className="object-contain p-8 drop-shadow-xl transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <span className="text-9xl">🧉</span>
                )}
            </div>
            {/* Miniaturas (Visuales) */}
            <div className="flex gap-4 overflow-x-auto pb-2">
                 {[1,2,3].map((i) => (
                    <button key={i} className="w-20 h-20 rounded-xl border border-gray-200 bg-white hover:border-manto-orange transition-all flex-shrink-0 flex items-center justify-center opacity-70 hover:opacity-100">
                        {producto.imagen_url ? (
                             <Image src={producto.imagen_url} alt="vista" width={40} height={40} className="object-cover" />
                        ) : <span>🧉</span>}
                    </button>
                 ))}
            </div>
        </div>

        {/* --- COLUMNA DERECHA: INFO --- */}
        <div className="flex flex-col">
            
            <h1 className="text-3xl sm:text-4xl font-black text-manto-teal mb-2 leading-tight">
                {producto.nombre}
            </h1>

            {/* Rating Fake (Estético) *
            <div className="flex items-center gap-2 mb-6">
                <div className="flex text-yellow-400">
                    <Star size={18} fill="currentColor" />
                    <Star size={18} fill="currentColor" />
                    <Star size={18} fill="currentColor" />
                    <Star size={18} fill="currentColor" />
                    <Star size={18} fill="currentColor" className="text-gray-200" />
                </div>
                <span className="text-sm text-gray-400">(24 reseñas)</span>
            </div>
            {/* Rating Fake (Estético) */}
            
            <p className="text-3xl font-bold text-manto-orange mb-6">
                {formatCurrency(producto.precio)}
            </p>

            {/* Descripción (Si no hay en BD, ponemos texto genérico) */}
            <div className="prose prose-sm text-gray-600 mb-8">
                <p>
                  {/* Aquí iría producto.descripcion si existiera en tu DB */}
                  Disfruta de la mejor calidad con este producto seleccionado especialmente para tus momentos de mate. 
                  Elaborado con materiales de primera y diseñado para durar. Ideal para compartir o regalar.
                </p>
                <ul className="list-disc pl-5 mt-4 space-y-1">
                    <li>Calidad Premium garantizada.</li>
                    <li>Envío rápido a todo el país.</li>
                    <li>Producto oficial Manto.</li>
                </ul>
            </div>

            <div className="h-px bg-gray-100 my-6" />

            {/* Selector de Cantidad + Botón */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 w-fit">
                    <button 
                        onClick={() => setCantidad(c => Math.max(1, c - 1))}
                        className="w-12 h-12 flex items-center justify-center text-manto-teal hover:bg-white rounded-l-xl transition-colors"
                    >
                        <Minus size={20} />
                    </button>
                    <span className="w-12 text-center font-bold text-xl text-gray-700">{cantidad}</span>
                    <button 
                        onClick={() => setCantidad(c => c + 1)}
                        className="w-12 h-12 flex items-center justify-center text-manto-teal hover:bg-white rounded-r-xl transition-colors"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                <button 
                    onClick={handleAddToCart}
                    className={`
                        flex-1 py-3 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-lg
                        ${agregado 
                            ? "bg-green-500 text-white scale-95" 
                            : "bg-manto-teal text-white hover:bg-manto-teal/90 hover:-translate-y-1"
                        }
                    `}
                >
                    <ShoppingCart size={24} className={agregado ? "animate-bounce" : ""} />
                    {agregado ? "¡Agregado al Carrito!" : "Agregar al Carrito"}
                </button>
            </div>

            {/* Beneficios Extra */}
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 text-blue-800">
                    <Truck size={24} className="opacity-80" />
                    <span className="font-bold">Envío Gratis</span>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 text-green-800">
                    <ShieldCheck size={24} className="opacity-80" />
                    <span className="font-bold">Garantía de Calidad</span>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}