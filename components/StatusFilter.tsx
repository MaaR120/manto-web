"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Filter, ChevronDown, Check } from "lucide-react";

interface FilterOption {
  id: string;
  label: string;
}

interface Props {
  paramKey: string; // ej: 'estado_pedido' o 'estado_pago'
  options: FilterOption[];
}

export default function StatusFilter({ paramKey, options }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Leer el estado actual de la URL
  const estadoActual = searchParams.get(paramKey) || "todos";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (id === "todos") {
      params.delete(paramKey);
    } else {
      params.set(paramKey, id);
    }

    router.push(`${pathname}?${params.toString()}`);
    setIsOpen(false);
  };

  const activeLabel = options.find(o => o.id === estadoActual)?.label || "Todos";
  const isActive = estadoActual !== "todos";

  return (
    <div className="relative inline-block text-left ml-2" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs font-bold border ${
          isActive 
            ? "text-manto-teal bg-manto-teal/5 border-manto-teal/20" 
            : "text-gray-400 border-transparent hover:bg-gray-100"
        }`}
        title={`Filtrar por ${paramKey}`}
      >
        <Filter size={12} />
        {isActive && <span>{activeLabel}</span>}
        <ChevronDown size={12} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1">
          <div className="py-1">
            {options.map((filtro) => (
              <button
                key={filtro.id}
                onClick={() => handleSelect(filtro.id)}
                className={`w-full text-left px-4 py-2.5 text-xs hover:bg-gray-50 transition-colors flex items-center justify-between ${
                  estadoActual === filtro.id ? "font-bold text-manto-teal bg-manto-teal/5" : "text-gray-600"
                }`}
              >
                {filtro.label}
                {estadoActual === filtro.id && <Check size={12}/>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}