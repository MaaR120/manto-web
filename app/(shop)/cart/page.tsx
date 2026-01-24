"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/utils/format";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Necesario para redirigir
import { supabase } from "@/lib/supabase"; // Necesario para guardar en BD
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, Loader2, CheckCircle } from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  // --- FUNCIÓN PARA GENERAR PEDIDO (MOCK) ---
  const handleConfirmOrder = async () => {
    setLoading(true);

    try {
      // 1. Verificar Usuario de Auth
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !user.email) {
        alert("Debes iniciar sesión para confirmar la compra.");
        router.push("/login");
        return;
      }

      // 2. CORRECCIÓN ERROR 1: Buscar el ID numérico del cliente
      // Usamos el email para encontrar al cliente real en tu tabla
      const { data: clienteData, error: clienteError } = await supabase
        .from('cliente')
        .select('id, direccion')
        .eq('email', user.email)
        .single();

      if (clienteError || !clienteData) {
        throw new Error("No se encontró la información del cliente. Por favor, contacta soporte.");
      }

      // 3. Insertar Cabecera del Pedido usando el ID numérico
      const { data: pedidoData, error: pedidoError } = await supabase
        .from('pedido')
        .insert({
          cliente_id: clienteData.id, // <--- ¡Ahora sí es un número!
          direccion_envio: clienteData.direccion || "Sin dirección",
          total: totalPrice,
          fecha_pedido: new Date().toISOString(),
          estado_pedido_id: 1 
        })
        .select()
        .single();

      if (pedidoError) throw pedidoError;
      if (!pedidoData) throw new Error("No se pudo crear el pedido");

      // 4. CORRECCIÓN ERROR 2: Incluir precio_unitario
      const itemsParaInsertar = cart.map(item => ({
        pedido_id: pedidoData.id,
        item_id: item.id,
        cantidad: item.quantity,
        precio_unitario: item.precio // <--- ¡Agregado obligatorio!
      }));

      // 5. Insertar Detalles
      const { error: itemsError } = await supabase
        .from('pedido_item')
        .insert(itemsParaInsertar);

      if (itemsError) throw itemsError;

      // 6. ¡Éxito!
      clearCart();
      alert("¡Pedido generado con éxito! Vamos a verlo.");
      router.push("/dashboard");

    } catch (error: unknown) { // <--- CORRECCIÓN ERROR 3: Usamos 'unknown'
      console.error("Error al generar pedido:", error);
      
      let mensaje = "Error desconocido";
      if (error instanceof Error) {
        mensaje = error.message;
      } else if (typeof error === "object" && error !== null && "message" in error) {
         // Captura errores de Supabase que a veces son objetos genéricos
         mensaje = (error as { message: string }).message;
      }

      alert("Hubo un error al procesar tu pedido: " + mensaje);
      setLoading(false);
    }
  };

  // --- RENDERIZADO (Igual que antes, solo cambia el botón de acción) ---

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-manto-teal/5 p-8 rounded-full mb-6">
            <ShoppingBag size={64} className="text-manto-teal/40" />
        </div>
        <h1 className="text-3xl font-bold text-manto-teal mb-2">Tu carrito está vacío</h1>
        <p className="text-gray-500 mb-8 max-w-md">
          Parece que aún no has agregado nada. ¡Nuestros mates te están esperando!
        </p>
        <Link 
          href="/" 
          className="bg-manto-teal text-white px-8 py-3 rounded-xl font-bold hover:bg-manto-teal/90 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-1"
        >
          <ArrowLeft size={20} /> Ir a la Tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-manto-teal mb-8 flex items-center gap-3">
        Tu Carrito <span className="text-sm bg-manto-orange/10 text-manto-orange px-3 py-1 rounded-full">{cart.length} items</span>
      </h1>

      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* LISTA DE PRODUCTOS */}
        <div className="flex-1 space-y-6">
          {cart.map((item) => (
            <div key={item.id} className="group bg-white rounded-2xl p-4 border border-manto-teal/10 shadow-sm hover:shadow-md transition-all flex items-center gap-6">
              {/* Imagen */}
              <div className="w-24 h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 relative">
                 {item.imagen_url ? (
                    <Image src={item.imagen_url} alt={item.nombre} fill className="object-cover"/>
                 ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🧉</div>
                 )}
              </div>

              {/* Info y Controles */}
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="font-bold text-manto-teal text-lg">{item.nombre}</h3>
                    <p className="text-sm text-gray-500">Precio unitario: {formatCurrency(item.precio)}</p>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                    <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-md text-manto-teal hover:text-manto-orange shadow-sm disabled:opacity-50 transition-colors"
                        disabled={item.quantity <= 1}
                    >
                        <Minus size={14} />
                    </button>
                    <span className="font-bold w-4 text-center text-gray-700">{item.quantity}</span>
                    <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-md text-manto-teal hover:text-manto-orange shadow-sm transition-colors"
                    >
                        <Plus size={14} />
                    </button>
                </div>

                <div className="flex items-center gap-6 sm:justify-end min-w-[120px]">
                    <p className="font-bold text-lg text-manto-teal">
                        {formatCurrency(item.precio * item.quantity)}
                    </p>
                    <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
              </div>
            </div>
          ))}

          <button onClick={clearCart} className="text-red-400 text-sm font-medium hover:text-red-600 hover:underline flex items-center gap-2 mt-4">
            <Trash2 size={16} /> Vaciar carrito
          </button>
        </div>

        {/* RESUMEN DE COMPRA */}
        <div className="lg:w-96">
            <div className="bg-white p-8 rounded-3xl border border-manto-teal/10 shadow-lg sticky top-24">
                <h2 className="text-xl font-bold text-manto-teal mb-6">Resumen</h2>
                
                <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>{formatCurrency(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Envío</span>
                        <span className="text-green-500 font-medium">¡Gratis!</span>
                    </div>
                    <div className="h-px bg-gray-200 my-4"></div>
                    <div className="flex justify-between text-xl font-bold text-manto-teal">
                        <span>Total</span>
                        <span>{formatCurrency(totalPrice)}</span>
                    </div>
                </div>

                {/* BOTÓN CONFIRMAR COMPRA */}
                <button 
                    onClick={handleConfirmOrder}
                    disabled={loading}
                    className="w-full bg-manto-teal text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                           <Loader2 className="animate-spin" /> Generando Pedido...
                        </>
                    ) : (
                        <>
                           Confirmar Compra <CheckCircle size={20} />
                        </>
                    )}
                </button>

                <p className="text-xs text-center text-gray-400 mt-4 flex items-center justify-center gap-2">
                    🔒 Simulación de prueba (Sin cargo real)
                </p>
            </div>
        </div>

      </div>
    </div>
  );
}