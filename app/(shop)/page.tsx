// app/page.tsx
import HeroBackground from "@/components/HeroBackground"; // <--- Importamos tu carrusel
import { ArrowRight, Mail, MapPin, Instagram, Send } from "lucide-react";
import { itemService } from "@/services/itemService";
import ProductCard from "@/components/ProductCard"; // Importamos el componente
import ProductList from "@/components/ProductList";

export default async function Home() {
  const productos = await itemService.obtenerTodos();
  return (
    <main className="min-h-screen bg-manto-bg">

      {/* Hero Section: Carrusel + Texto */}
      {/* Usamos h-screen para que la imagen ocupe toda la altura de la pantalla */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        
        {/* 1. Aquí insertamos tu Carrusel de Fondo */}
        <HeroBackground />

        {/* 2. Contenido (Texto y Botones) */}
        {/* Agregamos z-10 para que flote ENCIMA del carrusel */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-0 pt-20">
          
          {/* Título Principal */}
          {/* CAMBIO: Texto blanco con sombra para leerse sobre la foto */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
            Mate de origen <br />
            <span className="text-manto-orange relative inline-block">
              MANSO
              {/* Estrella amarilla brillante */}
            </span>.
          </h1>
          
          {/* Descripción */}
          {/* CAMBIO: Texto blanco/90 para contraste */}
          <p className="mt-8 text-xl md:text-2xl text-white/90 max-w-2xl mx-auto mb-12 font-medium drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] leading-relaxed">
            Yerba mate de origen cuidado y envasado limpio. <br/>
            Para acompañar juntadas largas, charlas sinceras y decisiones importantes.
          </p>
          
          {/* Botones */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 items-center">
            
            {/* Botón Primario: El Naranja destaca perfecto sobre fondo oscuro */}
            <button className="bg-manto-orange hover:bg-white hover:text-manto-orange text-white px-8 py-4 rounded-full font-bold transition-all flex items-center gap-2 shadow-lg hover:shadow-2xl hover:-translate-y-1 border-2 border-transparent">
              Ver Variedades <ArrowRight size={20} />
            </button>
            
            {/* Botón Secundario: Estilo "Glass" (Vidrio) con borde blanco */}
            <button className="bg-white/10 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-manto-teal px-8 py-4 rounded-full font-bold transition-all shadow-md">
              Conocer la Historia
            </button>
          </div>

        </div>
      </section>

      {/* Sección Productos (Esta queda igual, con fondo claro) */}
      {/* Sección Productos Dinámica */}
      <ProductList productos={productos} />

      <section id="contacto" className="bg-manto-teal text-manto-bg py-24 relative overflow-hidden">
        
        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-manto-orange/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-manto-yellow/5 rounded-full blur-3xl -ml-20 -mb-20"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Columna Izquierda: Información */}
            <div>
              <h2 className="text-4xl font-bold mb-6">¿Tomamos unos mates?</h2>
              <p className="text-xl text-manto-bg/80 mb-10 leading-relaxed">
                Si tienes un negocio, una oficina que necesita energía, o simplemente quieres charlar sobre nuestra yerba, escribinos.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-manto-orange transition-colors">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-xs uppercase opacity-60 font-bold tracking-wider">Email</p>
                    <p className="text-lg font-medium">hola@manto.com.ar</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-manto-orange transition-colors">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-xs uppercase opacity-60 font-bold tracking-wider">Base</p>
                    <p className="text-lg font-medium">Mendoza, Argentina</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-manto-orange transition-colors">
                    <Instagram size={20} />
                  </div>
                  <div>
                    <p className="text-xs uppercase opacity-60 font-bold tracking-wider">Social</p>
                    <p className="text-lg font-medium">@manto.yerba</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Formulario */}
            <div className="bg-white/5 backdrop-blur-lg p-8 rounded-3xl border border-white/10 shadow-2xl">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase opacity-70">Tu Nombre</label>
                    <input type="text" className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:bg-white/20 focus:border-manto-orange transition-all placeholder:text-white/30" placeholder="Ejemplo" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase opacity-70">Tu Email</label>
                    <input type="email" className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:bg-white/20 focus:border-manto-orange transition-all placeholder:text-white/30" placeholder="hola@ejemplo.com" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase opacity-70">Mensaje</label>
                  <textarea rows={4} className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:bg-white/20 focus:border-manto-orange transition-all placeholder:text-white/30" placeholder="Quiero saber más sobre la suscripción..."></textarea>
                </div>

                <button type="button" className="w-full bg-manto-orange hover:bg-white hover:text-manto-orange text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-1">
                  Enviar Mensaje <Send size={18} />
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}