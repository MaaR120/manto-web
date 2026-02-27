import { EstrategiaPago } from '@/types/pagos.interface';
import { MercadoPagoStrategy } from './MercadoPagoStrategy';
import { EfectivoStrategy } from './EfectivoStrategy';

export class PagoFactory {
  static obtenerEstrategia(proveedor: string): EstrategiaPago {
    switch (proveedor) {
      case 'MERCADO_PAGO':
        return new MercadoPagoStrategy();
      case 'EFECTIVO_REPARTIDOR':
        return new EfectivoStrategy();
      default:
        throw new Error(`Proveedor de pago ${proveedor} no soportado.`);
    }
  }
}