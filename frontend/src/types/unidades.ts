/**
 * Tipo para una Unidad Habitacional (respuesta del API)
 */
export type Unidad = {
  id: number;
  codigo: string;
  estado: "OCUPADA" | "DESOCUPADA" | "MANTENIMIENTO";
  direccion: string;
  cantidad_vehiculos: number;
  residentes: { id: number; nombre: string; apellido: string }[];
  fecha_creacion: string;
  fecha_actualizacion: string;
};

/**
 * Tipo para el formulario de Unidad Habitacional (crear/editar)
 */
export type UnidadForm = {
  codigo: string; // Formato: A-101, B-202, etc.
  estado: "OCUPADA" | "DESOCUPADA" | "MANTENIMIENTO";
  direccion: string;
  cantidad_vehiculos: number;
  residente_ids?: number[] | null; // 0..2; null/omitido = []
};

/**
 * Tipo para los estados de unidad
 */
export const ESTADOS_UNIDAD = ["OCUPADA", "DESOCUPADA", "MANTENIMIENTO"] as const;

/**
 * Tipo para los params de filtro de unidades
 */
export type UnidadFilterParams = {
  estado?: "" | "OCUPADA" | "DESOCUPADA" | "MANTENIMIENTO" | undefined;
  search?: string | undefined;
  page?: number;
  page_size?: number;
};