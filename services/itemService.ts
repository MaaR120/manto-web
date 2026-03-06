import { itemRepo } from '@/repositories/itemRepo';
import { Item } from '@/types';

export const itemService = {
  // Simplemente busca los datos. Si en el futuro quieres filtrar, tocas acá.
  async obtenerTodos(): Promise<Item[]> {
    return await itemRepo.getAll();
  },

  async obtenerTodosAyI(): Promise<Item[]> {
    return await itemRepo.getAllAyI();
  }
};