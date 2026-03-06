// actions/inventory-actions.ts
"use server";

import { createClient } from "@/lib/supabaseServer"; // Ajustá la ruta a tu cliente de Supabase
import { revalidatePath } from "next/cache";

export async function toggleProductActiveAction(id: number, nuevoEstado: boolean) {
  const supabase = await createClient();
  try {
    const { error } = await supabase
      .from('item')
      .update({ activo: nuevoEstado })
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/inventario');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function saveProductAction(formData: any) {
  const supabase = await createClient();
  try {
    const isEditing = !!formData.id;

    // Preparamos el objeto para Supabase
    const payload = {
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      precio: Number(formData.precio),
      precio_puntos: formData.precio_puntos ? Number(formData.precio_puntos) : null,
      stock: Number(formData.stock),
      imagen_url: formData.imagen_url || null,
      tipo_item_id: Number(formData.tipo_item_id) // 1: Mates, 2: Yerbas, 3: Bombillas, 4: Accesorios
    };

    if (isEditing) {
      const { error } = await supabase.from('item').update(payload).eq('id', formData.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('item').insert([payload]);
      if (error) throw error;
    }

    revalidatePath('/admin/inventario');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}