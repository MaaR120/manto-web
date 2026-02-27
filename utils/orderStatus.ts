// utils/orderStatus.ts

// --- ESTADOS DE LOGÍSTICA (Tabla: estado_pedido) ---
export const LOGISTICS_STATES = {
  RECIBIDO: 1,
  PREPARANDO: 2,
  ENVIADO: 3,
  ENTREGADO: 4,
  CANCELADO: 5,
};

export const LOGISTICS_OPTIONS = [
  { id: "todos", label: "Todas las logísticas" },
  { id: "1", label: "Recibido" },
  { id: "2", label: "Preparando" },
  { id: "3", label: "Enviado" },
  { id: "4", label: "Entregado" },
  { id: "5", label: "Cancelado" },
];

// --- ESTADOS DE PAGO (Tabla: estado_pago) ---
export const PAYMENT_STATES = {
  PENDIENTE: 1,
  APROBADO: 2,
  RECHAZADO: 3,
  REEMBOLSADO: 4,
};

export const PAYMENT_OPTIONS = [
  { id: "todos", label: "Todos los pagos" },
  { id: "1", label: "Pendiente" },
  { id: "2", label: "Aprobado" },
  { id: "3", label: "Rechazado" },
  { id: "4", label: "Reembolsado" },
];

export const PROVIDER_OPTIONS = [
  { id: "todos", label: "Todos los métodos" },
  { id: "MERCADO_PAGO", label: "Mercado Pago" },
  { id: "EFECTIVO_REPARTIDOR", label: "Efectivo" },
];

// Configuración visual para Logística
export const STATUS_CONFIG = {
  [LOGISTICS_STATES.RECIBIDO]:   { label: "Recibido",   color: "bg-gray-100 text-gray-800 border-gray-200" },
  [LOGISTICS_STATES.PREPARANDO]: { label: "Preparando", color: "bg-purple-100 text-purple-800 border-purple-200" },
  [LOGISTICS_STATES.ENVIADO]:    { label: "Enviado",    color: "bg-blue-100 text-blue-800 border-blue-200" },
  [LOGISTICS_STATES.ENTREGADO]:  { label: "Entregado",  color: "bg-teal-100 text-teal-800 border-teal-200" },
  [LOGISTICS_STATES.CANCELADO]:  { label: "Cancelado",  color: "bg-red-100 text-red-800 border-red-200" },
};

// Transformaciones peligrosas (Restauradas con la nueva lógica)
export const isDangerousTransition = (currentId: number, nextId: number) => {
  // 1. Ir hacia atrás es sospechoso (Ej: De Enviado a Recibido)
  if (nextId < currentId && currentId !== LOGISTICS_STATES.CANCELADO) return true;
  
  // 2. Cancelar siempre requiere doble chequeo
  if (nextId === LOGISTICS_STATES.CANCELADO) return true;

  // 3. Saltearse la preparación (Pasar de Recibido a Enviado o Entregado directo)
  if (currentId === LOGISTICS_STATES.RECIBIDO && nextId === LOGISTICS_STATES.ENTREGADO) return true;
  if (currentId === LOGISTICS_STATES.RECIBIDO && nextId === LOGISTICS_STATES.ENVIADO) return true;

  return false;
};