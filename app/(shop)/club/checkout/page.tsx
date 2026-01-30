"use client";

import { useState } from "react";
import { CheckCircle, CreditCard, Lock, Loader2 } from "lucide-react";
import { createSubscriptionAction } from "@/actions/subscription-actions"; // Importamos la acción

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulamos datos de tarjeta (En la vida real, esto te lo da MercadoPago)
    const fakeCardData = {
      planId: 1, // ID de "Caja Mensual"
      cardToken: "tok_visa_fake_123456",
      cardBrand: "visa",
      cardLast4: "4242"
    };

    // Llamamos a la Server Action
    const res = await createSubscriptionAction(fakeCardData);
    
    // Si la acción hace redirect, este código de abajo no se ejecuta
    if (res?.success === false) {
        alert(res.message);
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-12 px-4">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Lado Izquierdo: Resumen */}
        <div>
           <h1 className="text-2xl font-bold text-manto-teal mb-6">Finalizar Suscripción</h1>
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg mb-2">Caja Mensual Manto</h3>
              <p className="text-3xl font-black text-manto-teal mb-4">$ 15.000 <span className="text-sm font-normal text-gray-400">/ mes</span></p>
              
              <ul className="space-y-3 text-sm text-gray-600 mb-6">
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-manto-orange"/> 2kg Yerba Premium</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-manto-orange"/> Envío Gratis</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-manto-orange"/> Cancela cuando quieras</li>
              </ul>
              
              <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-xs flex gap-2">
                 <Lock size={14} className="flex-shrink-0 mt-0.5"/>
                 Pago seguro encriptado de 256-bits. No guardamos tus datos sensibles.
              </div>
           </div>
        </div>

        {/* Lado Derecho: Formulario de Tarjeta */}
        <div>
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-manto-teal/10">
                <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <CreditCard size={20} className="text-manto-teal"/> Datos del Pago
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Input Falso de Número */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Número de Tarjeta</label>
                        <input type="text" placeholder="0000 0000 0000 0000" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-manto-teal outline-none font-mono" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Vencimiento</label>
                            <input type="text" placeholder="MM/AA" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-manto-teal outline-none font-mono" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CVC</label>
                            <input type="password" placeholder="123" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-manto-teal outline-none font-mono" />
                        </div>
                    </div>
                    
                    <div className="pt-4">
                        <button 
                            disabled={loading}
                            className="w-full bg-manto-teal text-white py-4 rounded-xl font-bold text-lg hover:bg-manto-teal/90 transition-all shadow-lg flex justify-center items-center gap-2"
                        >
                            {loading ? (
                                <><Loader2 className="animate-spin" /> Procesando...</>
                            ) : (
                                "Confirmar Suscripción"
                            )}
                        </button>
                    </div>
                </form>

            </div>
        </div>

      </div>
    </div>
  );
}