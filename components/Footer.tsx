import Link from "next/link";
import { Leaf, Instagram, Facebook, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-manto-teal text-white border-t border-white/10 text-center md:text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

          {/* 1. Marca y Slogan */}
          <div className="col-span-1 md:col-span-1 flex flex-col items-center md:items-start">
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold tracking-tighter mb-4">
              <Leaf className="text-manto-orange" size={24} />
              <span>MANTO.</span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed">
              Yerba mate de autor. <br />
              Cultivada con respeto, <br />
              cebada con amigos.
            </p>
          </div>

          {/* 2. Enlaces Rápidos */}
          <div>
            <h3 className="font-bold text-manto-orange mb-4 uppercase text-sm tracking-wider">Explorar</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="/#productos" className="hover:text-white transition-colors">Nuestras Yerbas</Link></li>
              <li><Link href="/#historia" className="hover:text-white transition-colors">Origen</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Mi Cuenta</Link></li>
            </ul>
          </div>

          {/* 3. Legales (Placeholder) */}
          <div>
            <h3 className="font-bold text-manto-orange mb-4 uppercase text-sm tracking-wider">Ayuda</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="#" className="hover:text-white transition-colors">Envíos y Devoluciones</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Términos y Condiciones</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Preguntas Frecuentes</Link></li>
            </ul>
          </div>

          {/* 4. Redes Sociales */}
          <div>
            <h3 className="font-bold text-manto-orange mb-4 uppercase text-sm tracking-wider">Síguenos</h3>
            <div className="flex gap-4">
              <a href="#" className="bg-white/10 p-2 rounded-full hover:bg-manto-orange hover:text-white transition-all">
                <Instagram size={20} />
              </a>
              <a href="#" className="bg-white/10 p-2 rounded-full hover:bg-manto-orange hover:text-white transition-all">
                <Facebook size={20} />
              </a>
              <a href="#" className="bg-white/10 p-2 rounded-full hover:bg-manto-orange hover:text-white transition-all">
                <Twitter size={20} />
              </a>
            </div>
          </div>

        </div>

        {/* Línea divisoria y Copyright */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/40">
          <p>© 2026 MANTO Yerba Mate. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <span>Hecho con 🧉 en Mendoza</span>
          </div>
        </div>

      </div>
    </footer>
  );
}