"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function SearchOrders() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [term, setTerm] = useState(searchParams.get("q") || "");

  useEffect(() => {
    // 1. LA CLAVE PARA ROMPER EL BUCLE:
    // Comparamos el texto del input con lo que realmente hay en la URL hoy.
    const currentQ = searchParams.get("q") || "";
    
    // Si son iguales, significa que ya filtramos esto. ¡No hagas nada!
    if (term === currentQ) return; 

    // 2. Si son diferentes, ejecutamos el temporizador
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (term) {
        params.set("q", term);
      } else {
        params.delete("q");
      }

      router.replace(`${pathname}?${params.toString()}`);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [term, pathname, router, searchParams]);

  return (
    <div className="relative max-w-sm w-full">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search size={18} className="text-gray-400" />
      </div>
      <input
        type="text"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Buscar por nombre, email, teléfono, instagram..."
        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-manto-teal/30 focus:border-manto-teal transition-all text-sm"
      />
    </div>
  );
}