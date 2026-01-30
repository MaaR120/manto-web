import Link from "next/link";
import { Truck, Gift, Zap, ArrowRight } from "lucide-react";
import { PricingCard } from "./components/PricingCard";

export default function ClubLandingPage() {
  return (
    <div className="bg-manto-bg min-h-screen pt-32 pb-20">
      
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20">
        <span className="text-manto-orange font-bold tracking-widest uppercase text-sm mb-4 block">
            Únete a la comunidad
        </span>
        <h1 className="text-5xl md:text-6xl font-black text-manto-teal mb-6">
          Club <span className="text-manto-orange">MANTO</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Olvídate de quedarte sin yerba. Recibe tu selección favorita todos los meses, 
          con envíos gratis y regalos exclusivos.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/club/checkout">
            <button className="bg-manto-orange text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                Suscribirme Ahora <ArrowRight size={20} />
            </button>
            </Link>
            <Link href="/#productos" className="px-8 py-4 rounded-xl font-bold text-manto-teal border-2 border-manto-teal/20 hover:bg-manto-teal/5 transition-all">
                Ver otros productos
            </Link>
        </div>
      </div>

      {/* Grid de Beneficios */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        
        {/* Beneficio 1 */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-manto-teal/5 hover:border-manto-teal/20 transition-all group">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <Truck size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Envío Gratis Siempre</h3>
            <p className="text-gray-500 leading-relaxed">
                No pagues ni un peso extra. Tu caja llega a la puerta de tu casa todos los meses sin cargo de envío.
            </p>
        </div>

        {/* Beneficio 2 */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-manto-teal/5 hover:border-manto-teal/20 transition-all group">
            <div className="w-14 h-14 bg-manto-orange/10 rounded-2xl flex items-center justify-center text-manto-orange mb-6 group-hover:scale-110 transition-transform">
                <Zap size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">15% OFF en la Tienda</h3>
            <p className="text-gray-500 leading-relaxed">
                Por ser socio, tienes descuento automático en todos los mates, bombillas y termos de la tienda.
            </p>
        </div>

        {/* Beneficio 3 */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-manto-teal/5 hover:border-manto-teal/20 transition-all group">
            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
                <Gift size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Muestras de Regalo</h3>
            <p className="text-gray-500 leading-relaxed">
                Descubre nuevos blends y accesorios antes que nadie. Incluimos sorpresas en tu caja mensual.
            </p>
        </div>

      </div>

      {/* Pricing Card */}
      {/* Pricing Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        <PricingCard />
        <PricingCard />
        <PricingCard />
        </div>
|       
    </div>
  );
}