import { createClient } from "@/lib/supabaseServer"; // <--- Usamos el cliente del servidor
import { orderService } from "@/services/orderService"; 
import { OrderList } from "@/components/OrderList"; // Tu componente visual tonto
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LayoutDashboard } from "lucide-react";
import { dashboardService } from "@/services/dashboardService";

// Esto asegura que la página no se guarde en caché estático y muestre datos frescos
export const dynamic = 'force-dynamic';

export default async function AllOrdersPage() {
  
  // 1. Creamos el cliente del servidor (Igual que en Dashboard)
  const supabase = await createClient();

  // 2. Verificamos usuario
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }
  const userId = await dashboardService.obtenerIdUsuarioLogueado(supabase);
  if (!userId) {
    redirect("/login");
  }
  // 3. Pedimos los datos al servicio, pasándole el cliente del servidor
  const pedidos = await orderService.getOrdersByUser(userId, supabase);

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-manto-teal transition-colors">
            <ArrowLeft size={20} /> Volver al Dashboard
        </Link>

        {/* 4. Renderizamos la lista. 
           OrderList no sabe que esto vino del servidor, solo recibe el array.
           Le decimos showViewAll={false} porque ya estamos viendo todo.
        */}
        <OrderList 
           pedidos={pedidos} 
           title="Historial Completo de Pedidos" 
           showViewAll={false} 
        />

      </div>
    </div>
  );
}