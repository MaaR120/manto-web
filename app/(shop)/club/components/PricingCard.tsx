import { CheckCircle } from "lucide-react";
import Link from "next/link";

export const PricingCard = () => {
  return (
    // ELIMINAMOS EL DIV WRAPPER (max-w-md...)
    // El componente root es directamente la tarjeta con el fondo teal.
    // Le agregamos 'h-full' para que si una tarjeta tiene más texto, todas tengan la misma altura.
    <div className="bg-manto-teal text-white rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden text-center h-full flex flex-col">
        
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        
        <h3 className="text-2xl font-bold mb-2">Caja Mensual Manto</h3>
        <div className="flex justify-center items-baseline gap-1 mb-6">
            <span className="text-5xl font-black">$ 15.000</span>
            <span className="text-white/70">/ mes</span>
        </div>

        {/* 'flex-1' empuja el botón hacia abajo para que queden alineados si hay distinta cantidad de items */}
        <ul className="text-left space-y-4 mb-8 text-white/90 flex-1">
            <li className="flex items-center gap-3">
                <CheckCircle className="text-manto-orange flex-shrink-0" size={20} /> 
                <span>2kg de Yerba Premium a elección</span>
            </li>
            <li className="flex items-center gap-3">
                <CheckCircle className="text-manto-orange flex-shrink-0" size={20} /> 
                <span>Envío a todo el país incluido</span>
            </li>
            <li className="flex items-center gap-3">
                <CheckCircle className="text-manto-orange flex-shrink-0" size={20} /> 
                <span>Cancela cuando quieras</span>
            </li>
        </ul>
        <Link href="/club/checkout">
            <button className="w-full bg-white text-manto-teal py-4 rounded-xl font-bold text-lg hover:text-manto-orange hover:shadow-lg transition-all relative z-10">
                Quiero suscribirme 
            </button>
        </Link>
        <p className="text-xs text-white/50 mt-4">Renovación automática. Sin plazos forzosos.</p>
    </div>
  );
};