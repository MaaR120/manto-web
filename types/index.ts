// types/index.ts

import { Database } from './database.types';

// 1. Exportamos la base completa por si la necesitamos
export type { Database } from './database.types';

// 2. Creamos los ALIAS bonitos (Aquí centralizas todo)
export type Item = Database['public']['Tables']['item']['Row'];
export type Cliente = Database['public']['Tables']['cliente']['Row'];
export type Pedido = Database['public']['Tables']['pedido']['Row'];
export type PedidoItem = Database['public']['Tables']['pedido_item']['Row']; 
export type Suscripcion = Database['public']['Tables']['suscripcion']['Row'];

// Tip para Expertos:
// También puedes exportar los tipos para INSERTAR datos (ignoran el ID que es automático)
export type ItemInsert = Database['public']['Tables']['item']['Insert'];
export type ClienteInsert = Database['public']['Tables']['cliente']['Insert'];