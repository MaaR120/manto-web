"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/utils/format";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase"; 
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, Loader2, CheckCircle, MapPin, CreditCard, Truck, Home } from "lucide-react";
import { createOrderAction } from "@/actions/order-actions";

// Tipos para el estado local
interface UserData {
  direccion: string | null;
  tarjetas: any[];
}

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  
  // Estados de Carga y Usuario
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [userData, setUserData] = useState<UserData>({ direccion: null, tarjetas: [] });

  // Estados del Formulario
  const [useSavedAddress, setUseSavedAddress] = useState(true);
  const [addressForm, setAddressForm] = useState({
    calle: "", altura: "", piso: "", cp: "", provincia: "Mendoza", ciudad: ""
  });
  
  const [selectedCardId, setSelectedCardId] = useState<number | 'new' | null>(null);

  // 1. Cargar datos del usuario al iniciar (Dirección guardada y Tarjetas)
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
          setInitializing(false);
          return;
      }

      // Buscar cliente y dirección
      const { data: cliente } = await supabase
        .from('cliente')
        .select('id, direccion')
        .eq('email', user.email)
        .single();

      if (cliente) {
        // Buscar tarjetas guardadas
        const { data: tarjetas } = await supabase
             .from('metodo_pago')
             .select('*')
             .eq('cliente_id', cliente.id);

        setUserData({
            direccion: cliente.direccion,
            tarjetas: tarjetas || []
        });
        
        // Pre-seleccionar tarjeta default si existe
        const defaultCard = tarjetas?.find((t: any) => t.es_default);
        if (defaultCard) setSelectedCardId(defaultCard.id);
        else if (tarjetas && tarjetas.length > 0) setSelectedCardId(tarjetas[0].id);
        else setSelectedCardId('new');
      }
      setInitializing(false);
    };

    fetchUserData();
  }, []);


  // --- MANEJADORES ---

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAddressForm({ ...addressForm, [e.target.name]: e.target.value });
  };

  const getFinalAddress = () => {
    if (useSavedAddress && userData.direccion) return userData.direccion;
    // Formatear dirección bonita
    const { calle, altura, piso, ciudad, provincia, cp } = addressForm;
    return `${calle} ${altura}${piso ? ` (Piso ${piso})` : ''}, ${ciudad}, ${provincia} - CP ${cp}`;
  };

  const handleConfirmOrder = async () => {
    setLoading(true);

    try {
      const direccionFinal = getFinalAddress();
      
      // Validación básica
      if (!useSavedAddress && (!addressForm.calle || !addressForm.altura || !addressForm.cp)) {
          alert("Por favor completa los campos obligatorios de la dirección.");
          setLoading(false);
          return;
      }

      // Llamar a la Server Action
      const result = await createOrderAction({
        items: cart,
        total: totalPrice,
        direccionEnvio: direccionFinal,
        guardarDireccion: !useSavedAddress, // Si escribió una nueva, la guardamos
        cardId: selectedCardId === 'new' ? null : (selectedCardId as number),
        newCardToken: selectedCardId === 'new' ? "tok_fake_visa_123" : undefined // Simulación
      });

      if (!result.success) throw new Error(result.message);

      // Éxito
      clearCart();
      router.push("/dashboard?orderSuccess=true");

    } catch (error: any) {
      alert(error.message || "Error al procesar pedido");
    } finally {
      setLoading(false);
    }
  };


  // --- RENDERIZADO DE ESTADO VACÍO ---
  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-manto-teal/5 p-8 rounded-full mb-6">
            <ShoppingBag size={64} className="text-manto-teal/40" />
        </div>
        <h1 className="text-3xl font-bold text-manto-teal mb-2">Tu carrito está vacío</h1>
        <Link href="/" className="bg-manto-teal text-white px-8 py-3 rounded-xl font-bold mt-6 hover:bg-manto-teal/90 transition-all flex items-center gap-2 shadow-lg">
          <ArrowLeft size={20} /> Ir a la Tienda
        </Link>
      </div>
    );
  }

  if (initializing) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-manto-teal" /></div>;

  // --- RENDERIZADO PRINCIPAL ---
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-32">
      <h1 className="text-3xl font-bold text-manto-teal mb-8 flex items-center gap-3">
        Finalizar Compra
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* COLUMNA IZQUIERDA: FORMULARIOS */}
        <div className="lg:col-span-2 space-y-8">
            
            {/* SECCIÓN 1: ENVÍO */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Truck className="text-manto-orange" /> Dirección de Envío
                </h2>

                {/* Opción: Usar Guardada */}
                {userData.direccion && (
                    <div 
                        onClick={() => setUseSavedAddress(true)}
                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all mb-4 flex items-center gap-4 ${useSavedAddress ? 'border-manto-teal bg-manto-teal/5' : 'border-gray-100 hover:border-gray-200'}`}
                    >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${useSavedAddress ? 'border-manto-teal' : 'border-gray-300'}`}>
                            {useSavedAddress && <div className="w-2.5 h-2.5 rounded-full bg-manto-teal" />}
                        </div>
                        <div>
                            <p className="font-bold text-gray-700">Usar dirección guardada</p>
                            <p className="text-sm text-gray-500">{userData.direccion}</p>
                        </div>
                    </div>
                )}

                {/* Opción: Nueva Dirección */}
                <div 
                    onClick={() => setUseSavedAddress(false)}
                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all mb-4 flex items-center gap-4 ${!useSavedAddress ? 'border-manto-teal bg-white' : 'border-gray-100 hover:border-gray-200'}`}
                >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${!useSavedAddress ? 'border-manto-teal' : 'border-gray-300'}`}>
                        {!useSavedAddress && <div className="w-2.5 h-2.5 rounded-full bg-manto-teal" />}
                    </div>
                    <span className="font-bold text-gray-700">Enviar a otra dirección</span>
                </div>

                {/* Formulario Detallado (Se muestra solo si elige Nueva) */}
                {!useSavedAddress && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pl-2 animate-in fade-in slide-in-from-top-2">
                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Calle / Avenida</label>
                            <input name="calle" value={addressForm.calle} onChange={handleAddressChange} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-manto-teal" placeholder="Ej: San Martín" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Altura (Número)</label>
                            <input name="altura" value={addressForm.altura} onChange={handleAddressChange} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-manto-teal" placeholder="1234" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Piso / Depto (Opcional)</label>
                            <input name="piso" value={addressForm.piso} onChange={handleAddressChange} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-manto-teal" placeholder="PB, 5B" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Código Postal</label>
                            <input name="cp" value={addressForm.cp} onChange={handleAddressChange} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-manto-teal" placeholder="5500" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Ciudad</label>
                            <input name="ciudad" value={addressForm.ciudad} onChange={handleAddressChange} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-manto-teal" placeholder="Mendoza" />
                        </div>
                    </div>
                )}
            </div>

            {/* SECCIÓN 2: PAGO */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <CreditCard className="text-manto-orange" /> Método de Pago
                </h2>

                <div className="space-y-3">
                    {/* Tarjetas Guardadas */}
                    {userData.tarjetas.map((tarjeta: any) => (
                        <div 
                            key={tarjeta.id}
                            onClick={() => setSelectedCardId(tarjeta.id)}
                            className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center justify-between ${selectedCardId === tarjeta.id ? 'border-manto-teal bg-manto-teal/5' : 'border-gray-100 hover:border-gray-200'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedCardId === tarjeta.id ? 'border-manto-teal' : 'border-gray-300'}`}>
                                    {selectedCardId === tarjeta.id && <div className="w-2.5 h-2.5 rounded-full bg-manto-teal" />}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-700 capitalize">{tarjeta.marca} •••• {tarjeta.ultimos_4}</p>
                                    <p className="text-xs text-gray-400">Vence: {tarjeta.exp_mes}/{tarjeta.exp_anio}</p>
                                </div>
                            </div>
                            <CreditCard className="text-gray-300" />
                        </div>
                    ))}

                    {/* Nueva Tarjeta */}
                    <div 
                        onClick={() => setSelectedCardId('new')}
                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${selectedCardId === 'new' ? 'border-manto-teal bg-manto-teal/5' : 'border-gray-100 hover:border-gray-200'}`}
                    >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedCardId === 'new' ? 'border-manto-teal' : 'border-gray-300'}`}>
                            {selectedCardId === 'new' && <div className="w-2.5 h-2.5 rounded-full bg-manto-teal" />}
                        </div>
                        <span className="font-bold text-gray-700">Usar otra tarjeta</span>
                    </div>

                    {selectedCardId === 'new' && (
                        <div className="p-4 bg-gray-50 rounded-xl mt-2 animate-in fade-in">
                            <p className="text-sm text-gray-500 mb-2">Simulación de formulario seguro:</p>
                            <input disabled placeholder="0000 0000 0000 0000" className="w-full p-3 bg-white border border-gray-200 rounded-lg mb-2 cursor-not-allowed opacity-70" />
                            <div className="flex gap-2">
                                <input disabled placeholder="MM/AA" className="w-1/2 p-3 bg-white border border-gray-200 rounded-lg cursor-not-allowed opacity-70" />
                                <input disabled placeholder="CVC" className="w-1/2 p-3 bg-white border border-gray-200 rounded-lg cursor-not-allowed opacity-70" />
                            </div>
                        </div>
                    )}
                </div>
            </div>

             {/* RESUMEN DE ITEMS (Versión Compacta para móviles) */}
             <div className="lg:hidden">
                {/* Aquí podrías repetir la lista de items si quieres que se vea en móvil antes de confirmar */}
             </div>
        </div>

        {/* COLUMNA DERECHA: RESUMEN STICKY */}
        <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-3xl border border-manto-teal/10 shadow-lg sticky top-32">
                <h2 className="text-lg font-bold text-manto-teal mb-4">Resumen del Pedido</h2>
                
                {/* Lista Mini de Items */}
                <div className="max-h-60 overflow-y-auto space-y-3 mb-4 pr-2 scrollbar-thin">
                    {cart.map((item) => (
                        <div key={item.id} className="flex gap-3 text-sm">
                            <div className="relative w-12 h-12 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                                {item.imagen_url && <Image src={item.imagen_url} fill alt={item.nombre} className="object-cover" />}
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-gray-700 line-clamp-1">{item.nombre}</p>
                                <p className="text-gray-500">{item.quantity} x {formatCurrency(item.precio)}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="h-px bg-gray-100 my-4"></div>

                <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>{formatCurrency(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Envío</span>
                        <span className="text-green-500 font-bold">Gratis</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-manto-teal pt-2 border-t border-gray-100">
                        <span>Total</span>
                        <span>{formatCurrency(totalPrice)}</span>
                    </div>
                </div>

                <button 
                    onClick={handleConfirmOrder}
                    disabled={loading || selectedCardId === null}
                    className="w-full bg-manto-teal text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <>Confirmar y Pagar <CheckCircle size={20} /></>}
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}