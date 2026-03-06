"use client";

import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { Item } from "@/types";
import { catalogService } from "@/services/catalogService";
import MateIcon from "../public/icons/MateIcon";
import {
  LayoutGrid, Leaf, Briefcase,
  ChevronLeft, ChevronRight, Loader2
} from "lucide-react";
import ProductModal from "@/components/ProductModal";
import BombillaIcon from "@/public/icons/BombillaIcon";

const CATEGORIAS = [
  { id: 0, icon: LayoutGrid, label: "Todos" },
  { id: 1, icon: MateIcon, label: "Mates" },
  { id: 2, icon: Leaf, label: "Yerbas" },
  { id: 3, icon: BombillaIcon, label: "Bombillas" },
  { id: 4, icon: Briefcase, label: "Accesorios" },
];

interface ProductListProps {
  productos: Item[];
}

const ITEMS_POR_PAGINA = 8;

export default function ProductSection({ productos: initialProductos }: ProductListProps) {

  const [productos, setProductos] = useState<Item[]>(initialProductos.slice(0, ITEMS_POR_PAGINA));
  const [totalProductos, setTotalProductos] = useState(initialProductos.length);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(0);
  const [paginaActual, setPaginaActual] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Item | null>(null);
  const [usuarioInteractuo, setUsuarioInteractuo] = useState(false);

  const openModal = (product: Item) => setSelectedProduct(product);
  const closeModal = () => setSelectedProduct(null);

  // CARGA DE DATOS SEGURA
  useEffect(() => {
    if (!usuarioInteractuo) return;

    let isMounted = true; // Salvavidas: Evita que React actualice estados si el componente se desmonta

    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await catalogService.obtenerProductosPaginados(
          paginaActual,
          categoriaSeleccionada,
          ITEMS_POR_PAGINA
        );

        // Verificamos que sigamos en la misma vista y que el resultado exista
        if (isMounted && result) {
          setProductos(result.productos || []);
          setTotalProductos(result.total || 0);
        }
      } catch (error) {
        console.error("🔴 Error al cargar productos:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => { isMounted = false; };
  }, [paginaActual, categoriaSeleccionada, usuarioInteractuo]);

  const cambiarCategoria = (id: number) => {
    if (id === categoriaSeleccionada) return;
    setUsuarioInteractuo(true);
    setCategoriaSeleccionada(id);
    setPaginaActual(1);
  };

  const cambiarPagina = (direccion: 'prev' | 'next') => {
    setUsuarioInteractuo(true);
    if (direccion === 'prev' && paginaActual > 1) setPaginaActual(p => p - 1);
    if (direccion === 'next' && paginaActual < totalPaginas) setPaginaActual(p => p + 1);
  };

  const totalPaginas = Math.ceil(totalProductos / ITEMS_POR_PAGINA);

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
                <Icono className="w-8 h-8" />
              </button>
            );
          })}
        </div>

        {/* CONTENEDOR DE PRODUCTOS (Ahora se adapta a la cantidad de elementos) */}
        <div className="relative min-h-[400px]">

          {/* Overlay de Carga Moderno */}
          {loading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-manto-bg/40 backdrop-blur-[2px] rounded-2xl">
              <Loader2 size={48} className="text-manto-orange animate-spin" />
            </div>
          )}

          {/* GRILLA RESPONSIVE (Sin elementos fantasma) */}
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8 justify-items-center transition-opacity duration-300 ${loading ? 'opacity-40 pointer-events-none' : 'opacity-100'} max-w-sm md:max-w-none mx-auto`}>
            {productos.map((producto) => (
              <div key={producto.id} className="w-full max-w-[400px] flex justify-center">
                <ProductCard
                  producto={producto}
                  onClickDetail={() => openModal(producto)}
                />
              </div>
            ))}
          </div>

        </div>

        {/* MENSAJE VACÍO */}
        {!loading && productos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl opacity-50">No se encontraron productos en esta categoría.</p>
          </div>
        )}

        {/* PAGINACIÓN */}
        {!loading && totalPaginas > 1 && (
          <div className="flex justify-center items-center gap-6 mt-12">
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
      <ProductModal
        producto={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={closeModal}
      />
    </section>
  );
}