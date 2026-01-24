"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { LogOut, Loader2 } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    
    // 1. Cerramos sesión en Supabase (esto borra la cookie)
    await supabase.auth.signOut();
    
    // 2. Refrescamos para limpiar caché y redirigimos al login
    router.refresh();
    router.push("/login");
  };

  return (
    <button 
      onClick={handleLogout} 
      disabled={loading}
      className="flex items-center gap-2 text-red-500 hover:text-red-600 font-bold text-sm px-4 py-2 hover:bg-red-50 rounded-xl transition-all"
    >
      {loading ? <Loader2 className="animate-spin" size={18} /> : <LogOut size={18} />}
      Cerrar Sesión
    </button>
  );
}