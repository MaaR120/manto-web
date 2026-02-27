import { EstrategiaPago, ResultadoPago } from '@/types/pagos.interface';

export class MercadoPagoStrategy implements EstrategiaPago {
  async procesar(pedidoId: number, montoTotal: number): Promise<ResultadoPago> {
    // Acá usás el SDK de Mercado Pago
    return {
      estado_pago_id: 1, // Pendiente
      proveedor_pago: 'MERCADO_PAGO',
      url_pago_checkout: 'https://mp.com/tu-link',
    };
  }
}