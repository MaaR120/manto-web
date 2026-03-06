// app/admin/inventario/page.tsx
import { itemService } from "@/services/itemService";
import InventoryManager from "@/components/InventoryManager";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export default async function InventarioPage() {
  // Traemos todos los productos desde la base de datos usando tu servicio existente
  const productos = await itemService.obtenerTodosAyI();

  const { data: categorias } = await supabase.from('tipo_item').select('*');

  return (
    <div className="space-y-6">
      {/* Header de la página */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Inventario</h1>
          <p className="text-gray-500 mt-1">Gestiona el catálogo, precios y stock de Manto.</p>
        </div>
        <div className="text-sm font-medium bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
          Total en catálogo: {productos.length}
        </div>
      </div>

      {/* Renderizamos el Client Component pasándole los datos iniciales */}
      <InventoryManager
        productosIniciales={productos}
        categorias={categorias || []} />
    </div>
  );
}