import { supabase } from '@/lib/supabase';
// Importas 'Item' directo desde la carpeta types (gracias al index.ts)
import { Item } from '@/types'; 

export const itemRepo = {
  async getAll(): Promise<Item[]> { 
    const { data, error } = await supabase.from('item').select('*');
    if (error) throw error;
    return data || [];
  }
};