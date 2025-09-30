import type { AreaComun } from "./areas-comunes";

export type EstadoInventario = 'ACTIVO' | 'INACTIVO' | 'EN_REPARACION' | 'DADO_DE_BAJA';
export type CategoriaInventario = 'MOBILIARIO' | 'ELECTRODOMESTICO' | 'EQUIPO_TECNOLOGICO' | 'HERRAMIENTA' | 'DECORACION' | 'OTRO';

export const estadoInventarioLabels: Record<EstadoInventario | 'all', string> = {
  'ACTIVO': 'Activo',
  'INACTIVO': 'Inactivo',
  'EN_REPARACION': 'En Reparación',
  'DADO_DE_BAJA': 'Dado de Baja',
  'all': 'Todos'
};

export const categoriaInventarioLabels: Record<CategoriaInventario | 'all', string> = {
  'MOBILIARIO': 'Mobiliario',
  'ELECTRODOMESTICO': 'Electrodoméstico',
  'EQUIPO_TECNOLOGICO': 'Equipo Tecnológico',
  'HERRAMIENTA': 'Herramienta',
  'DECORACION': 'Decoración',
  'OTRO': 'Otro',
  'all': 'Todas'
};

export interface Inventario {
  id: number;
  nombre: string;
  categoria: CategoriaInventario;
  estado: EstadoInventario;
  area_comun?: number | null;
  area_comun_nombre?: string | null;
  valor_estimado: number | string;
  ubicacion: string;
  fecha_adquisicion: string;
  descripcion?: string | null;
  created_at: string;
  updated_at: string;
}

export interface InventarioDetallado extends Omit<Inventario, 'area_comun'> {
  area_comun?: AreaComun | null;
}

export interface InventarioForm {
  nombre: string;
  categoria: CategoriaInventario;
  estado: EstadoInventario;
  area_comun: number | null;
  valor_estimado: number | string;
  ubicacion: string;
  fecha_adquisicion: string;
  descripcion?: string | null;
}

export interface InventarioFilter {
  search?: string;
  estado?: EstadoInventario | 'all';
  categoria?: CategoriaInventario | 'all';
  area_comun?: number | 'all';
  page?: number;
  page_size?: number;
}

export interface EstadisticasInventario {
  total: number;
  por_estado: {
    activos: number;
    inactivos: number;
    en_reparacion: number;
    dados_de_baja: number;
  };
  por_categoria: {
    [key in CategoriaInventario]: number;
  };
}