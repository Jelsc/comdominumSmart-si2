// Tipos de estados para áreas comunes
export type EstadoArea = "ACTIVO" | "INACTIVO" | "MANTENIMIENTO";

// Mapeo para mostrar etiquetas legibles de los estados
export const estadoLabels: Record<EstadoArea | "all", string> = {
  all: "Todos",
  ACTIVO: "Activo",
  INACTIVO: "Inactivo",
  MANTENIMIENTO: "En Mantenimiento",
};

// Mapeo para estilos de cada estado
export const estadoStyles: Record<string, string> = {
  ACTIVO: "bg-emerald-100 text-emerald-700 border-emerald-200",
  INACTIVO: "bg-gray-100 text-gray-600 border-gray-200",
  MANTENIMIENTO: "bg-amber-100 text-amber-700 border-amber-200",
};

// Modelo de área común que viene del backend
export type AreaComun = {
  id: number;
  nombre: string;
  monto_hora: string | number; // Permitir ambos tipos para facilitar la conversión
  estado: EstadoArea;
  created_at?: string;
  updated_at?: string;
};

// Parámetros para filtrar áreas comunes en listados
export type AreaComunFilter = {
  estado?: EstadoArea;
  search?: string;
  page?: number;
  page_size?: number;
  useAlternativeEndpoint?: boolean; // Para casos especiales de endpoint alternativo
};

// Datos del formulario para crear/editar un área común
export type AreaComunForm = {
  nombre: string;
  monto_hora: number;
  estado: EstadoArea;
};

// Valores para inicializar un formulario de área común
export const emptyAreaComunForm: AreaComunForm = {
  nombre: "",
  monto_hora: 0,
  estado: "ACTIVO"
};
