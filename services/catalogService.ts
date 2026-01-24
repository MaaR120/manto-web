import { supabase } from "@/lib/supabase";
import { Item } from "@/types";

// Quitamos la constante fija de aquí adentro.
// Ahora recibimos el 'limite' como parámetro.

export const catalogService = {
  // Agregamos 'limite' a los argumentos
  async obtenerProductosPaginados(pagina: number, categoriaId: number, limite: number) {
    
    // Usamos el limite dinámico para calcular el rango
    const from = (pagina - 1) * limite;
    const to = from + limite - 1;

    let query = supabase
      .from('item')
      .select('*', { count: 'exact' });

    if (categoriaId !== 0) {
      query = query.eq('tipo_item_id', categoriaId);
    }

    const { data, count, error } = await query
      .range(from, to)
      .order('id', { ascending: true });

    if (error) {
      console.error("Error fetching productos:", error);
      return { productos: [], total: 0 };
    }

    return { 
      productos: data as Item[], 
      total: count || 0 
    };
  }
};