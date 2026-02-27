// app/(admin)/layout.tsx
import AdminNavbar from "@/components/AdminNavbar";
import { createClient } from "@/lib/supabaseServer";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.log("❌ No hay usuario logueado");
    redirect("/login");
  }

  // Debug: Ver quién es el usuario
  console.log("🔍 Usuario Auth ID:", user.id);

  const { data: usuarioDb, error } = await supabase
    .from("cliente") // Ojo: Asegúrate que sea 'cliente' o 'usuarios' según decidiste
    .select("rol")
    .eq("id_auth", user.id)
    .single();

  // Debug: Ver qué devolvió la base de datos
  console.log("🔍 Respuesta DB:", usuarioDb);
  console.log("🔍 Error DB:", error);

  if (!usuarioDb || usuarioDb.rol !== "admin") {
    console.log("⛔ Acceso DENEGADO. Redirigiendo a home...");
    redirect("/");
  }

  // 4. Si pasa todas las pruebas, mostramos el panel
  return (
    // Agregamos 'flex' para que los hijos se pongan lado a lado
    // Agregamos 'pt-20' (padding top) para que no quede escondido detrás del Navbar principal que es 'fixed'
    <div className="flex min-h-screen bg-gray-50 pt-20">
      
      {/* Columna Izquierda: Tu Sidebar */}
      <AdminNavbar />
      
      {/* Columna Derecha: El contenido cambiante */}
      {/* 'flex-1' significa: "Toma todo el ancho que sobre" */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
}