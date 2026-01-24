"use client";

import { useState, useEffect } from "react";
import ProductCard from "./ProductCard"; 
import { Item } from "@/types";
import { catalogService } from "@/services/catalogService"; 
import { 
  LayoutGrid, Coffee, Leaf, Pipette, Briefcase, 
  ChevronLeft, ChevronRight, Loader2 
} from "lucide-react";

const CATEGORIAS = [
  { id: 0, icon: LayoutGrid, label: "Todos" },
  { id: 1, icon: Coffee, label: "Mates" },
  { id: 2, icon: Leaf, label: "Yerbas" },
  { id: 3, icon: Pipette, label: "Bombillas" },
  { id: 4, icon: Briefcase, label: "Accesorios" },
];

export default function ProductSection() {
  const [productos, setProductos] = useState<Item[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(0); 
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalProductos, setTotalProductos] = useState(0);
  const [loading, setLoading] = useState(true);

  // --- NUEVO: Estado para el límite dinámico ---
  // Empezamos con 4 (móvil) por defecto para priorizar carga rápida en cels
  const [itemsPorPagina, setItemsPorPagina] = useState(4); 

  // 1. DETECTOR DE PANTALLA
  useEffect(() => {
    const handleResize = () => {
      // Si es tablet o PC (md: 768px), mostramos 8. Si es móvil, 4.
      const nuevoLimite = window.innerWidth >= 768 ? 8 : 4;
      setItemsPorPagina(nuevoLimite);
    };

    // Ejecutar al inicio
    handleResize();

    // Escuchar cambios de tamaño (por si giran el celular o achican ventana)
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 2. CARGA DE DATOS (Ahora depende también de itemsPorPagina)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { productos, total } = await catalogService.obtenerProductosPaginados(
        paginaActual, 
        categoriaSeleccionada,
        itemsPorPagina // <--- Le pasamos el límite dinámico
      );
      setProductos(productos);
      setTotalProductos(total);
      setLoading(false);
    };

    fetchData();
  }, [paginaActual, categoriaSeleccionada, itemsPorPagina]); // <--- Agregamos itemsPorPagina a dependencias

  const cambiarCategoria = (id: number) => {
    if (id === categoriaSeleccionada) return; 
    setCategoriaSeleccionada(id);
    setPaginaActual(1); 
  };

  const cambiarPagina = (direccion: 'prev' | 'next') => {
    if (direccion === 'prev' && paginaActual > 1) setPaginaActual(p => p - 1);
    if (direccion === 'next' && paginaActual < totalPaginas) setPaginaActual(p => p + 1);
  };

  // Cálculo dinámico de páginas totales
  const totalPaginas = Math.ceil(totalProductos / itemsPorPagina);

  // Cálculo de fantasmas usando la variable dinámica
  const espaciosVacios = loading ? 0 : itemsPorPagina - productos.length;
  const arrayRelleno = Array(Math.max(0, espaciosVacios)).fill(null);

  return (
    <section id="productos" className="py-16 bg-manto-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <h2 className="text-3xl font-bold text-manto-teal mb-8">Nuestros Productos</h2>

        {/* FILTROS */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          {CATEGORIAS.map((cat) => {
            const Icono = cat.icon;
            const activo = categoriaSeleccionada === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => cambiarCategoria(cat.id)}
                className={`
                  p-4 rounded-full border-2 transition-all duration-300 shadow-sm
                  ${activo 
                    ? 'bg-manto-orange border-manto-orange text-white shadow-md scale-110' 
                    : 'bg-white border-manto-orange/30 text-manto-orange hover:border-manto-orange hover:bg-manto-orange/10'
                  }
                `}
              >
                <Icono size={24} strokeWidth={activo ? 2.5 : 2} />
              </button>
            );
          })}
        </div>

        {/* CONTENEDOR DE PRODUCTOS */}
        <div className="min-h-[800px]"> 
          {loading ? (
             <div className="flex flex-col items-center justify-center h-[800px]">
               <Loader2 size={48} className="text-manto-orange animate-spin mb-4" />
               <p className="text-manto-teal/50 font-medium">Cargando catálogo...</p>
             </div>
          ) : (
            // GRILLA RESPONSIVE (1 -> 2 -> 3 -> 4)
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8 justify-items-center animate-in fade-in duration-500 max-w-sm md:max-w-none mx-auto">
              
              {productos.map((producto) => (
                <div key={producto.id} className="w-full max-w-[400px] flex justify-center">
                    <ProductCard producto={producto} />
                </div>
              ))}

              {/* GHOSTS */}
              {arrayRelleno.map((_, index) => (
                <div 
                  key={`empty-${index}`} 
                  className="w-full max-w-[400px] h-[400px] invisible" 
                  aria-hidden="true" 
                />
              ))}
              
            </div>
          )}
        </div>

        {/* MENSAJE VACÍO */}
        {!loading && totalProductos === 0 && (
            <div className="text-center -mt-[600px]">
                 <p className="text-xl opacity-50">No se encontraron productos en esta categoría.</p>
            </div>
        )}

        {/* PAGINACIÓN */}
        {!loading && totalPaginas > 1 && (
          <div className="flex justify-center items-center gap-6 mt-8">
            <button
              onClick={() => cambiarPagina('prev')}
              disabled={paginaActual === 1}
              className="p-3 rounded-full border border-manto-teal/20 text-manto-teal hover:bg-manto-teal hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-manto-teal transition-all"
            >
              <ChevronLeft size={24} />
            </button>

            <span className="text-manto-teal font-bold tracking-widest text-sm">
              PÁGINA {paginaActual} / {totalPaginas}
            </span>

            <button
              onClick={() => cambiarPagina('next')}
              disabled={paginaActual === totalPaginas}
              className="p-3 rounded-full border border-manto-teal/20 text-manto-teal hover:bg-manto-teal hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-manto-teal transition-all"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}

      </div>
    </section>
  );
}