import { Clock, CreditCard, MapPin, ChevronRight, Package } from "lucide-react";
import Link from "next/link";

interface Props {
  data: {
    estado: string;
    proximoCobro: string;
    direccion?: string; // Agregamos la dirección (opcional por si falla)
  } | null;
}

export function SubscriptionCard({ data }: Props) {
  
  // 1. Estado "No Suscrito"
  if (!data) {
    return (
        <div className="bg-white/50 backdrop-blur-md p-8 rounded-3xl border border-manto-teal/10 text-center flex flex-col items-center justify-center h-full min-h-[250px] shadow-sm">
            <div className="bg-manto-orange/10 p-4 rounded-full mb-4">
                <Package size={32} className="text-manto-orange" />
            </div>
            <h3 className="text-xl font-bold text-manto-teal mb-2">Club Manto</h3>
            <p className="text-gray-500 mb-6 font-medium text-sm px-4">
                Recibe yerba premium y sorpresas todos los meses en tu puerta.
            </p>
            <Link 
                href="/club" 
                className="bg-manto-orange text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all w-full md:w-auto"
            >
                Unirme al Club
            </Link>
        </div>
    )
  }

  // Helper para colores según estado
  const getStatusStyle = (estado: string) => {
      const e = estado.toLowerCase();
      if (e.includes('activ') || e === 'ok') return "bg-green-500 text-white";
      if (e.includes('paus') || e.includes('pend')) return "bg-yellow-400 text-yellow-900";
      if (e.includes('cancel') || e.includes('error')) return "bg-red-500 text-white";
      return "bg-manto-orange text-white"; // Default
  };

  // 2. Estado "Suscrito"
  return (
    <div className="bg-manto-teal text-white p-8 rounded-3xl shadow-lg relative overflow-hidden group h-full flex flex-col min-h-[250px]">
      
      {/* Decoración de fondo */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
      
      {/* Header */}
      <div className="flex justify-between items-start mb-6 relative z-10">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
                <Clock size={24} className="text-manto-orange" /> Club MANTO
            </h2>
            <p className="text-white/70 text-sm mt-1">Suscripción Mensual</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${getStatusStyle(data.estado)}`}>
            {data.estado}
          </span>
      </div>
      
      {/* Cuerpo de info */}
      <div className="space-y-4 flex-1 relative z-10">
        
        {/* Próximo Envío */}
        <div className="bg-white/10 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
            <p className="text-white/60 text-xs uppercase font-bold mb-1">Próximo Cobro/Envío</p>
            <p className="font-medium text-lg">{data.proximoCobro}</p>
        </div>

        {/* Dirección de Envío */}
        {data.direccion && (
            <div className="flex items-start gap-3 px-1">
                <MapPin size={18} className="text-manto-orange mt-0.5 flex-shrink-0" />
                <div>
                    <p className="text-white/60 text-xs uppercase font-bold">Se envía a:</p>
                    <p className="text-sm font-medium leading-tight text-white/90 line-clamp-2">
                        {data.direccion}
                    </p>
                </div>
            </div>
        )}
      </div>
      
      {/* Footer: Método de Pago (Estático por seguridad si no tenemos los datos) */}
      <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2 text-white/80">
           <CreditCard size={16} />
           <span className="text-xs font-medium">Débito Automático</span>
        </div>
        
        <Link href="/club/mi-suscripcion" className="text-xs text-manto-orange font-bold hover:text-white transition-colors flex items-center gap-1">
            Gestionar <ChevronRight size={14}/>
        </Link>
      </div>
    </div>
  );
}