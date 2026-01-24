import { dashboardService } from "@/services/dashboardService";
import { DashboardHeader } from "./components/DashboardHeader";
import { ProfileCard } from "./components/ProfileCard";
import { SubscriptionCard } from "./components/SubscriptionCard";
import { createClient } from "@/lib/supabaseServer";
import { OrderList } from "./components/OrderList";
import { redirect } from "next/navigation";

// Esto fuerza a Next.js a no guardar caché vieja, para que veas cambios al instante
export const dynamic = 'force-dynamic';



export default async function DashboardPage() {
  
  const supabaseServer = await createClient();

  const data = await dashboardService.obtenerDatosUsuarioLogueado(supabaseServer);

  if (!data) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-manto-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        
        {/* Header */}
        <DashboardHeader 
          nombre={data.usuario.nombre} 
          nivel={data.usuario.nivel} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna Izquierda */}
          <div className="space-y-8 flex flex-col">
            <ProfileCard initialData={data.usuario} />
            <div className="flex-grow">
               <SubscriptionCard data={data.suscripcion} />
            </div>
          </div>

          {/* Columna Derecha (Historial) */}
          <div className="lg:col-span-2">
             <OrderList pedidos={data.pedidos} />
          </div>

        </div>
      </div>
    </main>
  );
}