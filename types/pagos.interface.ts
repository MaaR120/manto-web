export interface ResultadoPago {
    estado_pago_id: number;
    proveedor_pago: string;
    url_pago_checkout?: string | null;
    pago_referencia_id?: string | null;
  }
  
  export interface EstrategiaPago {
    procesar(pedidoId: number, montoTotal: number, provinciaEnvio: string): Promise<ResultadoPago>;
  }