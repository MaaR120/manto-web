import { dashboardService } from "@/services/dashboardService";
import { DashboardHeader } from "./components/DashboardHeader";
import { ProfileCard } from "./components/ProfileCard";
import { SubscriptionCard } from "./components/SubscriptionCard";
import { createClient } from "@/lib/supabaseServer";
import { OrderList } from "../../../components/OrderList";
import { redirect } from "next/navigation";

// Esto fuerza a Next.js a no guardar caché vieja, para que veas cambios al instante
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabaseServer = await createClient();
  const data = await dashboardService.obtenerDatosDashboard(supabaseServer);

  if (!data) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-manto-bg">
      {/* Ampliamos un poquito el max-width para darle más aire a la pantalla */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">

        {/* Header */}
        <DashboardHeader
          nombre={data.usuario.nombre}
          nivel={data.usuario.nivel}
        />

        {/* Cambiamos a grid-cols-12 para tener control total de las proporciones */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Columna Izquierda: Ocupa 4/12 en laptops y 3/12 en monitores grandes */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-8 flex flex-col">
            <ProfileCard initialData={data.usuario} />
            <div className="flex-grow">
              <SubscriptionCard data={data.suscripcion} />
            </div>
          </div>

          {/* Columna Derecha (Tabla): Ocupa 8/12 en laptops y 9/12 en monitores grandes */}
          <div className="lg:col-span-8 xl:col-span-9">
            <OrderList pedidos={data.pedidos} />
          </div>

        </div>
      </div>
    </main>
  );
}