import { createClient } from "@/lib/supabaseServer";
import { subscriptionService } from "@/services/subscriptionService";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CreditCard, Calendar, MapPin, PauseCircle, XCircle, AlertTriangle } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function MySubscriptionPage() {
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) redirect("/login");

  // Buscamos la suscripción
  const sub = await subscriptionService.getSubscriptionByEmail(user.email, supabase);

  // Si NO tiene suscripción, lo mandamos a la landing de venta
  if (!sub) {
    redirect("/club");
  }

  // Helper para colores de estado (Server Side Logic)
  const getStatusColor = (est: string) => {
    const e = est.toLowerCase();
    if (e.includes('activa')) return "bg-green-100 text-green-700 border-green-200";
    if (e.includes('pausada')) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-700 border-red-200";
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-manto-teal transition-colors font-medium">
                <ArrowLeft size={20} /> Volver al Dashboard
            </Link>
            <h1 className="text-xl font-bold text-manto-teal">Gestión de Suscripción</h1>
        </div>

        {/* Tarjeta Principal de Estado */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
            <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        {sub.plan}
                    </h2>
                </div>
                <span className={`px-4 py-2 rounded-full font-bold text-sm border flex items-center gap-2 ${getStatusColor(sub.estado)}`}>
                    <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
                    {sub.estado}
                </span>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Fechas */}
                <div className="space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-manto-teal/5 rounded-xl text-manto-teal">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <p className="text-xs uppercase font-bold text-gray-400">Próximo Cobro y Envío</p>
                            <p className="font-bold text-gray-800 text-lg">{sub.proximo_cobro}</p>
                            <p className="text-sm text-gray-500 mt-1">Monto: {sub.monto}</p>
                        </div>
                    </div>
                </div>

                {/* Método de Pago */}
                <div className="space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-manto-teal/5 rounded-xl text-manto-teal">
                            <CreditCard size={24} />
                        </div>
                        <div>
                            <p className="text-xs uppercase font-bold text-gray-400">Método de Pago</p>
                            
                            {sub.metodo_pago ? (
                                <>
                                    <div className="flex items-center gap-2 mt-1">
                                        {/* Aquí podrías poner íconos según la marca (Visa/Master) */}
                                        <span className="font-bold text-gray-800 capitalize text-lg">
                                            {sub.metodo_pago.marca} 
                                        </span>
                                        <span className="text-gray-500 font-mono text-lg">
                                            •••• {sub.metodo_pago.ultimos_4}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400">
                                        Vence: {sub.metodo_pago.expiracion} | {sub.metodo_pago.tipo}
                                    </p>
                                </>
                            ) : (
                                <div className="mt-1">
                                    <p className="text-red-500 font-bold flex items-center gap-1">
                                        <AlertTriangle size={16}/> Sin tarjeta
                                    </p>
                                    <p className="text-xs text-gray-400">Tu suscripción podría pausarse.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Dirección */}
                <div className="md:col-span-2 pt-4 border-t border-gray-50">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-manto-teal/5 rounded-xl text-manto-teal">
                            <MapPin size={24} />
                        </div>
                        <div>
                            <p className="text-xs uppercase font-bold text-gray-400">Dirección de Envío</p>
                            <p className="font-medium text-gray-700 mt-1 text-lg">{sub.direccion_envio}</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        {/* Zona de Peligro / Acciones */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h3 className="font-bold text-gray-800 mb-6">Acciones de Suscripción</h3>
            
            <div className="flex flex-col gap-4">
                <button className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-manto-orange/30 hover:bg-manto-orange/5 transition-all group text-left">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-yellow-100 text-yellow-700 rounded-lg group-hover:bg-yellow-200 transition-colors">
                            <PauseCircle size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-gray-700">Pausar suscripción</p>
                            <p className="text-sm text-gray-500">Salta el próximo mes sin cancelar.</p>
                        </div>
                    </div>
                    <span className="text-gray-400 group-hover:text-manto-orange">Editar</span>
                </button>

                <button className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-red-200 hover:bg-red-50 transition-all group text-left">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-red-100 text-red-700 rounded-lg group-hover:bg-red-200 transition-colors">
                            <XCircle size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-gray-700">Cancelar suscripción</p>
                            <p className="text-sm text-gray-500">Dejarás de recibir beneficios inmediatamente.</p>
                        </div>
                    </div>
                    <span className="text-gray-400 group-hover:text-red-600">Cancelar</span>
                </button>
            </div>
            
            <div className="mt-6 flex items-center gap-2 text-xs text-gray-400 bg-gray-50 p-3 rounded-lg">
                <AlertTriangle size={14} />
                <p>Para cambios de tarjeta o dirección inmediata, contacta a soporte.</p>
            </div>
        </div>

      </div>
    </div>
  );
}