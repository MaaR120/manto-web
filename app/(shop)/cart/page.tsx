"use client";

import { createOrderAction } from "@/actions/order-actions"; // Ajustá esta ruta
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/utils/format";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, Loader2, CheckCircle, MapPin, CreditCard, ClipboardList } from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  // --- ESTADOS DEL CHECKOUT ---
  const [step, setStep] = useState(1); // 1: Carrito, 2: Envío, 3: Pago, 4: Revisión
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  // --- NUEVOS ESTADOS PARA ENVÍO ---
  const [direcciones, setDirecciones] = useState<any[]>([]);
  const [selectedAlias, setSelectedAlias] = useState<string>("nueva");
  const [loadingDir, setLoadingDir] = useState(false);

  // Formulario que se autocompleta
  const [shippingForm, setShippingForm] = useState({
    calle: "", altura: "", piso: "", depto: "", ciudad: "", provincia: "", codigo_postal: ""
  });


  useEffect(() => {
    if (step === 2 && direcciones.length === 0) {
      cargarDirecciones();
    }
  }, [step]);


  const cargarDirecciones = async () => {
    setLoadingDir(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user && user.email) {
      // 1. Buscamos el ID del cliente
      const { data: cliente } = await supabase.from('cliente').select('id').eq('email', user.email).single();

      if (cliente) {
        // 2. Traemos sus direcciones
        const { data: dirs } = await supabase.from('direccion_cliente').select('*').eq('cliente_id', cliente.id);

        if (dirs && dirs.length > 0) {
          setDirecciones(dirs);

          // 3. Buscamos la principal para precargarla
          const principal = dirs.find(d => d.es_principal) || dirs[0]; // Si no hay principal, agarramos la primera

          setSelectedAlias(principal.id.toString());
          setShippingForm({
            calle: principal.calle,
            altura: principal.altura,
            piso: principal.piso || "",
            depto: principal.depto || "",
            ciudad: principal.ciudad,
            provincia: principal.provincia,
            codigo_postal: principal.codigo_postal
          });
        }
      }
    }
    setLoadingDir(false);
  };

  // Manejador del Selector de Alias
  const handleAliasChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedAlias(val);

    if (val === "nueva") {
      // Limpiamos el formulario para que escriba una nueva
      setShippingForm({ calle: "", altura: "", piso: "", depto: "", ciudad: "", provincia: "", codigo_postal: "" });
    } else {
      // Autocompletamos con la elegida
      const elegida = direcciones.find(d => d.id.toString() === val);
      if (elegida) {
        setShippingForm({
          calle: elegida.calle,
          altura: elegida.altura,
          piso: elegida.piso || "",
          depto: elegida.depto || "",
          ciudad: elegida.ciudad,
          provincia: elegida.provincia,
          codigo_postal: elegida.codigo_postal
        });
      }
    }
  };

  // Manejador general para inputs del formulario
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingForm({ ...shippingForm, [e.target.name]: e.target.value });
  };


  // --- FUNCIÓN FINAL: CONFIRMAR COMPRA ---
  const handleConfirmOrder = async () => {
    setLoading(true);
    try {
      // 1. Armamos el objeto con la dirección exacta como la espera el backend
      const direccionPayload = {
        calle: selectedAddress.calle,
        altura: selectedAddress.altura,
        piso: selectedAddress.piso || "",
        depto: selectedAddress.depto || "",
        codigo_postal: selectedAddress.codigo_postal,
        ciudad: selectedAddress.ciudad,
        provincia: selectedAddress.provincia,
      };

      // 2. Armamos el Payload completo para el Server Action
      const payload = {
        items: cart,
        total: totalPrice,
        direccion: direccionPayload,
        guardarDireccion: selectedAlias === "nueva", // Si era nueva, le decimos al server que la guarde
        proveedor_pago: paymentMethod as string
      };

      // 3. Llamamos al Server Action
      const response = await createOrderAction(payload);

      if (!response.success) {
        throw new Error(response.message || "Error al procesar el pedido");
      }

      // 4. Éxito
      clearCart();
      alert("¡Pedido generado con éxito! ID: #" + response.pedidoId);
      router.push("/dashboard");

    } catch (error: any) {
      alert("Error: " + (error.message || "Desconocido"));
    } finally {
      setLoading(false);
    }
  };

  // --- CONTROLADOR DEL BOTÓN DEL RESUMEN ---
  const handleNextStep = () => {
    if (step === 1) setStep(2);
    else if (step === 2) {
      if (!shippingForm.calle || !shippingForm.altura || !shippingForm.ciudad || !shippingForm.provincia || !shippingForm.codigo_postal) {
        return alert("Por favor, completa todos los campos obligatorios del domicilio.");
      }
      setSelectedAddress(shippingForm);
      setStep(3);
    }
    else if (step === 3) {
      // VALIDACIÓN: Obligar a elegir un método de pago
      if (!paymentMethod) {
        return alert("Por favor, selecciona un método de pago para continuar.");
      }
      setStep(4);
    }
    else if (step === 4) handleConfirmOrder();
  };

  // --- PANTALLA CARRITO VACÍO ---
  if (cart.length === 0 && step === 1) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-manto-teal/5 p-8 rounded-full mb-6">
          <ShoppingBag size={64} className="text-manto-teal/40" />
        </div>
        <h1 className="text-3xl font-bold text-manto-teal mb-2">Tu carrito está vacío</h1>
        <p className="text-gray-500 mb-8 max-w-md">¡Nuestros mates te están esperando!</p>
        <Link href="/" className="bg-manto-teal text-white px-8 py-3 rounded-xl font-bold hover:bg-manto-teal/90 transition-all flex items-center gap-2">
          <ArrowLeft size={20} /> Ir a la Tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pt-24 px-4 sm:px-6 lg:px-8 py-12">

      {/* INDICADOR DE PASOS (WIZARD) */}
      <div className="flex items-center justify-center mb-12 max-w-2xl mx-auto">
        {[
          { num: 1, name: "Carrito", icon: ShoppingBag },
          { num: 2, name: "Envío", icon: MapPin },
          { num: 3, name: "Pago", icon: CreditCard },
          { num: 4, name: "Revisión", icon: ClipboardList }
        ].map((s, idx) => (
          <div key={s.num} className="flex items-center">
            <div className={`flex flex-col items-center gap-2 ${step >= s.num ? 'text-manto-teal' : 'text-gray-300'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-bold transition-colors ${step >= s.num ? 'bg-manto-teal text-white border-manto-teal' : 'bg-white border-gray-200'}`}>
                <s.icon size={18} />
              </div>
              <span className="text-xs font-bold hidden sm:block">{s.name}</span>
            </div>
            {idx < 3 && (
              <div className={`w-12 sm:w-24 h-1 mx-2 rounded transition-colors ${step > s.num ? 'bg-manto-teal' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-12">

        {/* LADO IZQUIERDO: CONTENIDO DINÁMICO SEGÚN EL PASO */}
        <div className="flex-1 space-y-6">

          {/* PASO 1: CARRITO */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
              <h2 className="text-2xl font-bold text-manto-teal mb-4">Revisa tus productos</h2>
              {cart.map((item) => (
                <div key={item.id} className="group bg-white rounded-2xl p-4 border border-manto-teal/10 shadow-sm flex items-center gap-6">
                  <div className="w-24 h-24 bg-gray-50 rounded-xl overflow-hidden relative flex-shrink-0">
                    {item.imagen_url ? <Image src={item.imagen_url} alt={item.nombre} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">🧉</div>}
                  </div>
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-manto-teal text-lg">{item.nombre}</h3>
                      <p className="text-sm text-gray-500">{formatCurrency(item.precio)} c/u</p>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} className="w-8 h-8 flex items-center justify-center bg-white rounded-md text-manto-teal hover:text-manto-orange disabled:opacity-50"><Minus size={14} /></button>
                      <span className="font-bold w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-md text-manto-teal hover:text-manto-orange"><Plus size={14} /></button>
                    </div>
                    <div className="flex items-center gap-6 sm:justify-end min-w-[120px]">
                      <p className="font-bold text-lg text-manto-teal">{formatCurrency(item.precio * item.quantity)}</p>
                      <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full"><Trash2 size={20} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PASO 2: ENVÍO */}
          {step === 2 && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-manto-teal flex items-center gap-2">
                  <MapPin className="text-manto-orange" /> Datos de Envío
                </h2>
                {loadingDir && <Loader2 className="animate-spin text-manto-teal" size={20} />}
              </div>

              {/* SELECTOR DE DIRECCIONES GUARDADAS (ALIAS) */}
              <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-2">Mis direcciones guardadas</label>
                <select
                  value={selectedAlias}
                  onChange={handleAliasChange}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-manto-teal/30 focus:border-manto-teal outline-none transition-all"
                >
                  <option value="nueva">+ Ingresar una nueva dirección</option>
                  {direcciones.map(dir => (
                    <option key={dir.id} value={dir.id}>
                      {dir.alias ? `${dir.alias} (${dir.calle} ${dir.altura})` : `${dir.calle} ${dir.altura}`}
                      {dir.es_principal ? " ⭐ Principal" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* FORMULARIO DE DIRECCIÓN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Calle *</label>
                  <input type="text" name="calle" value={shippingForm.calle} onChange={handleFormChange} placeholder="Ej. Av. San Martín" className="w-full p-3 rounded-lg border border-gray-200 focus:border-manto-teal outline-none" required />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Altura *</label>
                  <input type="text" name="altura" value={shippingForm.altura} onChange={handleFormChange} placeholder="Ej. 1234" className="w-full p-3 rounded-lg border border-gray-200 focus:border-manto-teal outline-none" required />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Piso</label>
                    <input type="text" name="piso" value={shippingForm.piso} onChange={handleFormChange} placeholder="Ej. 3" className="w-full p-3 rounded-lg border border-gray-200 focus:border-manto-teal outline-none" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Depto</label>
                    <input type="text" name="depto" value={shippingForm.depto} onChange={handleFormChange} placeholder="Ej. B" className="w-full p-3 rounded-lg border border-gray-200 focus:border-manto-teal outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Provincia *</label>
                  <input type="text" name="provincia" value={shippingForm.provincia} onChange={handleFormChange} placeholder="Ej. Buenos Aires" className="w-full p-3 rounded-lg border border-gray-200 focus:border-manto-teal outline-none" required />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Ciudad *</label>
                  <input type="text" name="ciudad" value={shippingForm.ciudad} onChange={handleFormChange} placeholder="Ej. La Plata" className="w-full p-3 rounded-lg border border-gray-200 focus:border-manto-teal outline-none" required />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Código Postal *</label>
                  <input type="text" name="codigo_postal" value={shippingForm.codigo_postal} onChange={handleFormChange} placeholder="Ej. 1900" className="w-full p-3 rounded-lg border border-gray-200 focus:border-manto-teal outline-none max-w-[200px]" required />
                </div>
              </div>

              <button onClick={() => setStep(1)} className="mt-8 text-manto-teal text-sm font-bold flex items-center gap-2 hover:underline">
                <ArrowLeft size={16} /> Volver al carrito
              </button>
            </div>
          )}

          {/* PASO 3: PAGO */}
          {step === 3 && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard className="text-manto-orange" size={24} />
                <h2 className="text-2xl font-bold text-manto-teal">Método de Pago</h2>
              </div>

              <p className="text-gray-500 mb-6">Seleccioná cómo preferís abonar tu compra.</p>

              <div className="space-y-4">
                {/* OPCIÓN 1: MERCADO PAGO */}
                <label className={`block border-2 rounded-xl p-4 transition-all ${paymentMethod === 'MERCADO_PAGO' ? 'border-manto-teal bg-manto-teal/5' : 'border-gray-200 hover:border-manto-teal/30 cursor-pointer'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <input
                        type="radio"
                        name="payment_method"
                        value="MERCADO_PAGO"
                        checked={paymentMethod === 'MERCADO_PAGO'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5 text-manto-teal focus:ring-manto-teal cursor-pointer"
                      />
                      <div>
                        <p className="font-bold text-gray-800">Mercado Pago</p>
                        <p className="text-sm text-gray-500">Tarjetas de crédito, débito o dinero en cuenta.</p>
                      </div>
                    </div>
                    <span className="text-3xl grayscale opacity-70">💳</span>
                  </div>
                </label>

                {/* OPCIÓN 2: EFECTIVO AL REPARTIDOR (Con lógica de provincia) */}
                {(() => {
                  // Normalizamos el texto para evitar problemas con mayúsculas/minúsculas
                  const esMendoza = shippingForm.provincia.toLowerCase().includes('mendoza');

                  return (
                    <label className={`block border-2 rounded-xl p-4 transition-all ${!esMendoza ? 'opacity-60 bg-gray-50 border-gray-200 cursor-not-allowed' : paymentMethod === 'EFECTIVO_REPARTIDOR' ? 'border-manto-teal bg-manto-teal/5' : 'border-gray-200 hover:border-manto-teal/30 cursor-pointer'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <input
                            type="radio"
                            name="payment_method"
                            value="EFECTIVO_REPARTIDOR"
                            checked={paymentMethod === 'EFECTIVO_REPARTIDOR'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            disabled={!esMendoza}
                            className="w-5 h-5 text-manto-teal focus:ring-manto-teal disabled:cursor-not-allowed cursor-pointer"
                          />
                          <div>
                            <p className={`font-bold ${!esMendoza ? 'text-gray-500' : 'text-gray-800'}`}>Efectivo al Repartidor</p>
                            <p className="text-sm text-gray-500">Pagás en puerta cuando recibís el paquete.</p>
                            {!esMendoza && (
                              <p className="text-xs text-manto-orange mt-1 font-semibold">
                                Solo disponible para envíos dentro de Mendoza.
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="text-3xl grayscale opacity-70">💵</span>
                      </div>
                    </label>
                  );
                })()}
              </div>

              <button onClick={() => setStep(2)} className="mt-8 text-manto-teal text-sm font-bold flex items-center gap-2 hover:underline">
                <ArrowLeft size={16} /> Volver a envíos
              </button>
            </div>
          )}

          {/* PASO 4: REVISIÓN */}
          {step === 4 && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-2 mb-6">
                <ClipboardList className="text-manto-orange" size={24} />
                <h2 className="text-2xl font-bold text-manto-teal">Revisión Final</h2>
              </div>

              <p className="text-gray-500 mb-6">Por favor, verificá que todos los datos estén correctos antes de confirmar tu compra.</p>

              <div className="space-y-6">
                {/* Caja de resumen: Envío */}
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin size={18} className="text-manto-teal" />
                      <h3 className="font-bold text-gray-800">Dirección de Envío</h3>
                    </div>
                    <button onClick={() => setStep(2)} className="text-xs font-bold text-manto-orange hover:underline">Editar</button>
                  </div>
                  <div className="text-sm text-gray-600 pl-6">
                    <p className="font-medium text-gray-800">
                      {shippingForm.calle} {shippingForm.altura}
                      {shippingForm.piso && `, Piso ${shippingForm.piso}`}
                      {shippingForm.depto && ` Dpto ${shippingForm.depto}`}
                    </p>
                    <p>{shippingForm.ciudad}, {shippingForm.provincia}</p>
                    <p>CP: {shippingForm.codigo_postal}</p>
                  </div>
                </div>

                {/* Caja de resumen: Pago */}
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CreditCard size={18} className="text-manto-teal" />
                      <h3 className="font-bold text-gray-800">Método de Pago</h3>
                    </div>
                    <button onClick={() => setStep(3)} className="text-xs font-bold text-manto-orange hover:underline">Editar</button>
                  </div>
                  <div className="text-sm text-gray-600 pl-6 flex items-center gap-2">
                    <span className="text-xl">{paymentMethod === 'MERCADO_PAGO' ? '💳' : '💵'}</span>
                    <p className="font-medium text-gray-800">
                      {paymentMethod === 'MERCADO_PAGO'
                        ? 'Mercado Pago (Tarjetas o saldo en cuenta)'
                        : 'Efectivo (Al recibir el pedido)'}
                    </p>
                  </div>
                </div>
              </div>

              <button onClick={() => setStep(3)} className="mt-8 text-manto-teal text-sm font-bold flex items-center gap-2 hover:underline">
                <ArrowLeft size={16} /> Volver a método de pago
              </button>
            </div>
          )}
        </div>

        {/* LADO DERECHO: RESUMEN (SIEMPRE FIJO) */}
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

            {/* BOTÓN DINÁMICO */}
            <button
              onClick={handleNextStep}
              disabled={loading}
              className="w-full bg-manto-teal text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 className="animate-spin" /> Procesando...</>
              ) : (
                <>
                  {step === 1 && "Continuar a Envío"}
                  {step === 2 && "Continuar a Pago"}
                  {step === 3 && "Revisar Pedido"}
                  {step === 4 && "Confirmar Compra"}
                  {step !== 4 && <ArrowLeft size={20} className="rotate-180" />}
                  {step === 4 && <CheckCircle size={20} />}
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