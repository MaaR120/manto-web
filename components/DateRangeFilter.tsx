"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { CalendarDays, X } from "lucide-react";

export default function DateRangeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Inicializamos con los valores de la URL si existen
  const [desde, setDesde] = useState(searchParams.get("fechaDesde") || "");
  const [hasta, setHasta] = useState(searchParams.get("fechaHasta") || "");

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (desde) params.set("fechaDesde", desde);
    else params.delete("fechaDesde");

    if (hasta) params.set("fechaHasta", hasta);
    else params.delete("fechaHasta");

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClear = () => {
    setDesde("");
    setHasta("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("fechaDesde");
    params.delete("fechaHasta");
    router.push(`${pathname}?${params.toString()}`);
  };

  // Si hay alguna fecha seleccionada, mostramos el botón de limpiar
  const hasFilter = desde !== "" || hasta !== "";

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus-within:border-manto-teal transition-colors">
        <CalendarDays size={16} className="text-gray-400" />
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="bg-transparent text-gray-600 outline-none text-xs w-[110px]"
            title="Fecha Desde"
          />
          <span className="text-gray-300">-</span>
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="bg-transparent text-gray-600 outline-none text-xs w-[110px]"
            title="Fecha Hasta"
          />
        </div>
      </div>

      <button
        onClick={handleApply}
        className="bg-manto-teal/10 text-manto-teal hover:bg-manto-teal hover:text-white px-3 py-1.5 rounded-lg font-bold transition-colors text-xs"
      >
        Filtrar
      </button>

      {hasFilter && (
        <button
          onClick={handleClear}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Limpiar fechas"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}