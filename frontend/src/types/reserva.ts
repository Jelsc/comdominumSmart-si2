// Tipos para el módulo de reservas

export interface Reserva {
  id: number;
  area_comun: number;
  area_comun_info?: AreaComunInfo;
  residente: number;
  residente_info?: ResidenteInfo;
  fecha_reserva: string;
  hora_inicio: string;
  hora_fin: string;
  tipo_reserva: TipoReserva;
  motivo?: string;
  numero_personas: number;
  estado: EstadoReserva;
  costo_total: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
  observaciones_admin?: string;
  administrador_aprobacion?: number;
  administrador_nombre?: string;
  fecha_aprobacion?: string;
  duracion_horas: number;
  puede_cancelar: boolean;
  puede_modificar: boolean;
  esta_activa: boolean;
}

export interface AreaComunInfo {
  id: number;
  nombre: string;
  monto_hora: number;
  estado: string;
  created_at: string;
  updated_at: string;
}

export interface ResidenteInfo {
  id: number;
  usuario?: number;
  username?: string;
  nombre: string;
  apellido: string;
  ci?: string;
  email?: string;
  telefono?: string;
  unidad_habitacional?: string;
  tipo: string;
  fecha_ingreso: string;
  estado: string;
  nombre_completo: string;
  puede_acceder: boolean;
  estado_usuario: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface AreaDisponible {
  id: number;
  nombre: string;
  monto_hora: number;
  horarios_ocupados: string[];
  disponible: boolean;
}

export interface ReservaRequest {
  area_comun: number;
  fecha_reserva: string;
  hora_inicio: string;
  hora_fin: string;
  tipo_reserva: TipoReserva;
  motivo?: string;
  numero_personas: number;
}

export interface ReservaAprobacionRequest {
  accion: 'aprobar' | 'rechazar';
  observaciones?: string;
}

export interface ReservaEstadisticas {
  total_reservas: number;
  reservas_pendientes: number;
  reservas_confirmadas: number;
  reservas_canceladas: number;
  reservas_completadas: number;
  reservas_rechazadas: number;
  ingresos_totales: number;
  reservas_por_mes: Array<{
    mes: string;
    count: number;
  }>;
  areas_mas_populares: Array<{
    area_comun__nombre: string;
    count: number;
  }>;
}

export type EstadoReserva = 
  | 'PENDIENTE' 
  | 'CONFIRMADA' 
  | 'CANCELADA' 
  | 'COMPLETADA' 
  | 'RECHAZADA';

export type TipoReserva = 
  | 'PARTICULAR' 
  | 'EVENTO' 
  | 'REUNION' 
  | 'DEPORTE' 
  | 'OTRO';

// Constantes para los tipos
export const ESTADOS_RESERVA: Record<EstadoReserva, string> = {
  PENDIENTE: 'Pendiente',
  CONFIRMADA: 'Confirmada',
  CANCELADA: 'Cancelada',
  COMPLETADA: 'Completada',
  RECHAZADA: 'Rechazada',
};

export const TIPOS_RESERVA: Record<TipoReserva, string> = {
  PARTICULAR: 'Uso Particular',
  EVENTO: 'Evento',
  REUNION: 'Reunión',
  DEPORTE: 'Deporte',
  OTRO: 'Otro',
};

// Colores para los estados
export const COLORES_ESTADO: Record<EstadoReserva, string> = {
  PENDIENTE: 'orange',
  CONFIRMADA: 'green',
  CANCELADA: 'red',
  COMPLETADA: 'blue',
  RECHAZADA: 'red',
};

// Filtros para la búsqueda
export interface FiltrosReserva {
  estado?: EstadoReserva;
  tipo_reserva?: TipoReserva;
  fecha_reserva?: string;
  fecha_reserva_desde?: string;
  fecha_reserva_hasta?: string;
  area_comun?: number;
  residente?: number;
  search?: string;
}

// Paginación
export interface PaginacionReserva {
  count: number;
  next: string | null;
  previous: string | null;
  results: Reserva[];
}

// Utilidades
export const formatearFecha = (fecha: string): string => {
  const date = new Date(fecha);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const formatearHora = (hora: string): string => {
  return hora.substring(0, 5); // Remover segundos
};

export const formatearCosto = (costo: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD'
  }).format(costo);
};

export const formatearDuracion = (horas: number): string => {
  if (horas < 1) {
    const minutos = Math.round(horas * 60);
    return `${minutos} min`;
  }
  return `${horas.toFixed(1)} h`;
};

export const obtenerColorEstado = (estado: EstadoReserva): string => {
  return COLORES_ESTADO[estado] || 'gray';
};

export const obtenerTextoEstado = (estado: EstadoReserva): string => {
  return ESTADOS_RESERVA[estado] || estado;
};

export const obtenerTextoTipo = (tipo: TipoReserva): string => {
  return TIPOS_RESERVA[tipo] || tipo;
};
