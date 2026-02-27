"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { LogOut, Loader2 } from "lucide-react";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);

    try {
      await Promise.race([
        supabase.auth.signOut(),
        new Promise<void>((resolve) => setTimeout(resolve, 3000)),
      ]);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
    window.location.href = "/login";
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