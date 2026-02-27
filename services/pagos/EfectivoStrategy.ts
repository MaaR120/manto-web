import { EstrategiaPago, ResultadoPago } from '@/types/pagos.interface';

export class EfectivoStrategy implements EstrategiaPago {
  async procesar(pedidoId: number, montoTotal: number, provinciaEnvio: string): Promise<ResultadoPago> {
    if (provinciaEnvio.toLowerCase() !== 'mendoza') {
      throw new Error("El pago en efectivo solo es válido en Mendoza.");
    }
    return {
      estado_pago_id: 1, // Pendiente
      proveedor_pago: 'EFECTIVO_REPARTIDOR',
      url_pago_checkout: null,
    };
  }
}