export type EstadoArea = "ACTIVO" | "INACTIVO" | "MANTENIMIENTO";

export type AreaComun = {
  id: number;
  nombre: string;
  monto_hora: string;
  estado: EstadoArea;
  created_at?: string;
  updated_at?: string;
};

export type AreaComunForm = {
  nombre: string;
  monto_hora: number;
  estado: EstadoArea;
};
