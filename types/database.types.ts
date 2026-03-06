export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      cliente: {
        Row: {
          created_at: string | null
          dinero_total_gastado: number | null
          email: string
          estado_cliente_id: number | null
          etiqueta: string | null
          id: number
          id_auth: string | null
          instagram: string | null
          nombre: string
          puntos_acumulados: number | null
          rol: string
          telefono: string | null
        }
        Insert: {
          created_at?: string | null
          dinero_total_gastado?: number | null
          email: string
          estado_cliente_id?: number | null
          etiqueta?: string | null
          id?: number
          id_auth?: string | null
          instagram?: string | null
          nombre: string
          puntos_acumulados?: number | null
          rol?: string
          telefono?: string | null
        }
        Update: {
          created_at?: string | null
          dinero_total_gastado?: number | null
          email?: string
          estado_cliente_id?: number | null
          etiqueta?: string | null
          id?: number
          id_auth?: string | null
          instagram?: string | null
          nombre?: string
          puntos_acumulados?: number | null
          rol?: string
          telefono?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_estado_cliente_id_fkey"
            columns: ["estado_cliente_id"]
            isOneToOne: false
            referencedRelation: "estado_cliente"
            referencedColumns: ["id"]
          },
        ]
      }
      direccion_cliente: {
        Row: {
          alias: string | null
          altura: string
          calle: string
          ciudad: string
          cliente_id: number
          codigo_postal: string
          created_at: string | null
          depto: string | null
          es_principal: boolean | null
          id: number
          piso: string | null
          provincia: string
        }
        Insert: {
          alias?: string | null
          altura: string
          calle: string
          ciudad: string
          cliente_id: number
          codigo_postal: string
          created_at?: string | null
          depto?: string | null
          es_principal?: boolean | null
          id?: number
          piso?: string | null
          provincia: string
        }
        Update: {
          alias?: string | null
          altura?: string
          calle?: string
          ciudad?: string
          cliente_id?: number
          codigo_postal?: string
          created_at?: string | null
          depto?: string | null
          es_principal?: boolean | null
          id?: number
          piso?: string | null
          provincia?: string
        }
        Relationships: [
          {
            foreignKeyName: "direccion_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "cliente"
            referencedColumns: ["id"]
          },
        ]
      }
      estado_cliente: {
        Row: {
          id: number
          nombre: string
        }
        Insert: {
          id?: number
          nombre: string
        }
        Update: {
          id?: number
          nombre?: string
        }
        Relationships: []
      }
      estado_pago: {
        Row: {
          id: number
          nombre: string
        }
        Insert: {
          id?: number
          nombre: string
        }
        Update: {
          id?: number
          nombre?: string
        }
        Relationships: []
      }
      estado_pedido: {
        Row: {
          id: number
          nombre: string
        }
        Insert: {
          id?: number
          nombre: string
        }
        Update: {
          id?: number
          nombre?: string
        }
        Relationships: []
      }
      estado_suscripcion: {
        Row: {
          id: number
          nombre: string
        }
        Insert: {
          id?: number
          nombre: string
        }
        Update: {
          id?: number
          nombre?: string
        }
        Relationships: []
      }
      item: {
        Row: {
          activo: boolean | null
          descripcion: string | null
          id: number
          imagen_url: string | null
          nombre: string
          precio: number
          precio_puntos: number | null
          stock: number
          tipo_item_id: number | null
        }
        Insert: {
          activo?: boolean | null
          descripcion?: string | null
          id?: number
          imagen_url?: string | null
          nombre: string
          precio: number
          precio_puntos?: number | null
          stock?: number
          tipo_item_id?: number | null
        }
        Update: {
          activo?: boolean | null
          descripcion?: string | null
          id?: number
          imagen_url?: string | null
          nombre?: string
          precio?: number
          precio_puntos?: number | null
          stock?: number
          tipo_item_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "items_tipo_item_id_fkey"
            columns: ["tipo_item_id"]
            isOneToOne: false
            referencedRelation: "tipo_item"
            referencedColumns: ["id"]
          },
        ]
      }
      metodo_pago: {
        Row: {
          cliente_id: number
          created_at: string | null
          es_default: boolean | null
          exp_anio: number
          exp_mes: number
          id: number
          marca: string
          procesador_card_id: string
          procesador_customer_id: string | null
          proveedor: string
          tipo: string | null
          ultimos_4: string
        }
        Insert: {
          cliente_id: number
          created_at?: string | null
          es_default?: boolean | null
          exp_anio: number
          exp_mes: number
          id?: number
          marca: string
          procesador_card_id: string
          procesador_customer_id?: string | null
          proveedor: string
          tipo?: string | null
          ultimos_4: string
        }
        Update: {
          cliente_id?: number
          created_at?: string | null
          es_default?: boolean | null
          exp_anio?: number
          exp_mes?: number
          id?: number
          marca?: string
          procesador_card_id?: string
          procesador_customer_id?: string | null
          proveedor?: string
          tipo?: string | null
          ultimos_4?: string
        }
        Relationships: [
          {
            foreignKeyName: "metodo_pago_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "cliente"
            referencedColumns: ["id"]
          },
        ]
      }
      pedido: {
        Row: {
          cliente_id: number
          cod_seguimiento: string | null
          direccion_envio: string
          envio_altura: string | null
          envio_calle: string | null
          envio_ciudad: string | null
          envio_cp: string | null
          envio_piso: string | null
          envio_provincia: string | null
          estado_pago_id: number | null
          estado_pedido_id: number
          fecha_despacho: string | null
          fecha_entrega: string | null
          fecha_pedido: string | null
          id: number
          pago_referencia_id: string | null
          proveedor_pago: string | null
          suscripcion_id: number | null
          total: number
          url_pago_checkout: string | null
        }
        Insert: {
          cliente_id: number
          cod_seguimiento?: string | null
          direccion_envio: string
          envio_altura?: string | null
          envio_calle?: string | null
          envio_ciudad?: string | null
          envio_cp?: string | null
          envio_piso?: string | null
          envio_provincia?: string | null
          estado_pago_id?: number | null
          estado_pedido_id: number
          fecha_despacho?: string | null
          fecha_entrega?: string | null
          fecha_pedido?: string | null
          id?: number
          pago_referencia_id?: string | null
          proveedor_pago?: string | null
          suscripcion_id?: number | null
          total: number
          url_pago_checkout?: string | null
        }
        Update: {
          cliente_id?: number
          cod_seguimiento?: string | null
          direccion_envio?: string
          envio_altura?: string | null
          envio_calle?: string | null
          envio_ciudad?: string | null
          envio_cp?: string | null
          envio_piso?: string | null
          envio_provincia?: string | null
          estado_pago_id?: number | null
          estado_pedido_id?: number
          fecha_despacho?: string | null
          fecha_entrega?: string | null
          fecha_pedido?: string | null
          id?: number
          pago_referencia_id?: string | null
          proveedor_pago?: string | null
          suscripcion_id?: number | null
          total?: number
          url_pago_checkout?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_estado_pago"
            columns: ["estado_pago_id"]
            isOneToOne: false
            referencedRelation: "estado_pago"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "cliente"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_estado_pedido_id_fkey"
            columns: ["estado_pedido_id"]
            isOneToOne: false
            referencedRelation: "estado_pedido"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_suscripcion_id_fkey"
            columns: ["suscripcion_id"]
            isOneToOne: false
            referencedRelation: "suscripcion"
            referencedColumns: ["id"]
          },
        ]
      }
      pedido_item: {
        Row: {
          cantidad: number
          id: number
          item_id: number | null
          pedido_id: number | null
          precio_unitario: number
        }
        Insert: {
          cantidad: number
          id?: number
          item_id?: number | null
          pedido_id?: number | null
          precio_unitario: number
        }
        Update: {
          cantidad?: number
          id?: number
          item_id?: number | null
          pedido_id?: number | null
          precio_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "pedido_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "item"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_items_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedido"
            referencedColumns: ["id"]
          },
        ]
      }
      suscripcion: {
        Row: {
          cliente_id: number
          direccion_envio: string
          estado_suscripcion_id: number
          fecha_cobro: string
          fecha_inicio: string | null
          id: number
          metodo_pago_id: number | null
          nombre: string | null
          tipo_suscripcion_id: number
        }
        Insert: {
          cliente_id: number
          direccion_envio: string
          estado_suscripcion_id: number
          fecha_cobro: string
          fecha_inicio?: string | null
          id?: number
          metodo_pago_id?: number | null
          nombre?: string | null
          tipo_suscripcion_id: number
        }
        Update: {
          cliente_id?: number
          direccion_envio?: string
          estado_suscripcion_id?: number
          fecha_cobro?: string
          fecha_inicio?: string | null
          id?: number
          metodo_pago_id?: number | null
          nombre?: string | null
          tipo_suscripcion_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "suscripcion_metodo_pago_id_fkey"
            columns: ["metodo_pago_id"]
            isOneToOne: false
            referencedRelation: "metodo_pago"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suscripciones_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "cliente"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suscripciones_estado_suscripcion_id_fkey"
            columns: ["estado_suscripcion_id"]
            isOneToOne: false
            referencedRelation: "estado_suscripcion"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suscripciones_tipo_suscripcion_id_fkey"
            columns: ["tipo_suscripcion_id"]
            isOneToOne: false
            referencedRelation: "tipo_suscripcion"
            referencedColumns: ["id"]
          },
        ]
      }
      tipo_item: {
        Row: {
          id: number
          nombre: string
        }
        Insert: {
          id?: number
          nombre: string
        }
        Update: {
          id?: number
          nombre?: string
        }
        Relationships: []
      }
      tipo_suscripcion: {
        Row: {
          id: number
          intervalo_cobro: number
          nombre: string
          precio_primer_mes: number
          precio_recurrente: number
        }
        Insert: {
          id?: number
          intervalo_cobro?: number
          nombre: string
          precio_primer_mes: number
          precio_recurrente: number
        }
        Update: {
          id?: number
          intervalo_cobro?: number
          nombre?: string
          precio_primer_mes?: number
          precio_recurrente?: number
        }
        Relationships: []
      }
      tipo_suscripcion_item: {
        Row: {
          cantidad: number
          id: number
          item_id: number | null
          primer_mes: boolean | null
          tipo_suscripcion_id: number | null
        }
        Insert: {
          cantidad?: number
          id?: number
          item_id?: number | null
          primer_mes?: boolean | null
          tipo_suscripcion_id?: number | null
        }
        Update: {
          cantidad?: number
          id?: number
          item_id?: number | null
          primer_mes?: boolean | null
          tipo_suscripcion_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tipos_suscripcion_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "item"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tipos_suscripcion_items_tipo_suscripcion_id_fkey"
            columns: ["tipo_suscripcion_id"]
            isOneToOne: false
            referencedRelation: "tipo_suscripcion"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
