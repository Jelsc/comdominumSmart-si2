import { apiRequest, ApiError, type ApiResponse } from "./api";
import { toast } from "sonner";
import type { PaginatedResponse } from "@/types";
import type {
  Inventario,
  InventarioDetallado,
  InventarioForm,
  InventarioFilter,
  EstadisticasInventario
} from "@/types/inventario";

// Respuesta de la API con manejo de errores específicos para inventario
export interface InventarioApiResponse<T> extends ApiResponse<T> {
  errors?: Record<string, string[] | string> | string | null | undefined;
  status?: number | undefined;
}

const toDTO = (payload: InventarioForm) => ({
  nombre: payload.nombre.trim(),
  categoria: payload.categoria,
  estado: payload.estado,
  area_comun: payload.area_comun,
  valor_estimado: Number(payload.valor_estimado).toFixed(2),
  ubicacion: payload.ubicacion.trim(),
  fecha_adquisicion: payload.fecha_adquisicion,
  descripcion: payload.descripcion ? payload.descripcion.trim() : null,
});

const fromDTO = (data: any): Inventario => ({
  ...data,
  valor_estimado: Number(data.valor_estimado),
});

const buildQueryString = (params?: InventarioFilter) => {
  if (!params) return "";
  const query = new URLSearchParams();
  
  if (params.estado && params.estado !== 'all') 
    query.append("estado", params.estado);
  
  if (params.categoria && params.categoria !== 'all') 
    query.append("categoria", params.categoria);
  
  if (params.area_comun && params.area_comun !== 'all') 
    query.append("area_comun", params.area_comun.toString());
  
  if (params.search) 
    query.append("search", params.search);
  
  if (params.page) 
    query.append("page", params.page.toString());
  
  if (params.page_size) 
    query.append("page_size", params.page_size.toString());
  
  const qs = query.toString();
  return qs ? `?${qs}` : "";
};

const handleError = <T>(error: unknown): InventarioApiResponse<T> => {
  const message =
    error instanceof ApiError
      ? error.message
      : error instanceof Error
        ? error.message
        : "Ocurrió un error inesperado";

  toast.error(message);

  return {
    success: false,
    error: message,
    message,
    data: null,
    errors: error instanceof ApiError ? error.data : null,
    status: error instanceof ApiError ? error.status : undefined,
  };
};

export const inventarioApi = {
  async list(
    params?: InventarioFilter
  ): Promise<InventarioApiResponse<PaginatedResponse<Inventario>>> {
    try {
      const queryString = buildQueryString(params);
      const url = queryString ? `/api/inventario/${queryString}` : "/api/inventario/";
      
      const response = await apiRequest<PaginatedResponse<any>>(url);
      
      if (response.success && response.data?.results) {
        // Normalizar los datos
        const normalizedResults = response.data.results.map(fromDTO);
        
        return {
          ...response,
          data: {
            ...response.data,
            results: normalizedResults
          }
        };
      }
      
      return response as InventarioApiResponse<PaginatedResponse<Inventario>>;
    } catch (error) {
      return handleError<PaginatedResponse<Inventario>>(error);
    }
  },

  async get(id: number): Promise<InventarioApiResponse<InventarioDetallado>> {
    try {
      const response = await apiRequest<any>(`/api/inventario/${id}/`);
      
      if (response.success && response.data) {
        // Normalizar el objeto recibido
        const normalizedData = {
          ...response.data,
          valor_estimado: Number(response.data.valor_estimado)
        };
        
        return {
          ...response,
          data: normalizedData
        };
      }
      
      return response as InventarioApiResponse<InventarioDetallado>;
    } catch (error) {
      return handleError<InventarioDetallado>(error);
    }
  },

  async create(
    payload: InventarioForm
  ): Promise<InventarioApiResponse<Inventario>> {
    try {
      const response = await apiRequest<Inventario>("/api/inventario/", {
        method: "POST",
        body: JSON.stringify(toDTO(payload)),
      });
      
      if (response.success) {
        toast.success("Inventario creado correctamente");
      }
      
      return response;
    } catch (error) {
      return handleError<Inventario>(error);
    }
  },

  async update(
    id: number,
    payload: InventarioForm
  ): Promise<InventarioApiResponse<Inventario>> {
    try {
      const response = await apiRequest<Inventario>(
        `/api/inventario/${id}/`,
        {
          method: "PUT",
          body: JSON.stringify(toDTO(payload)),
        }
      );
      
      if (response.success) {
        toast.success("Inventario actualizado correctamente");
      }
      
      return response;
    } catch (error) {
      return handleError<Inventario>(error);
    }
  },

  async remove(id: number): Promise<InventarioApiResponse<null>> {
    try {
      const response = await apiRequest<null>(`/api/inventario/${id}/`, {
        method: "DELETE",
      });
      
      if (response.success) {
        toast.success("Inventario eliminado correctamente");
      }
      
      return response;
    } catch (error) {
      return handleError<null>(error);
    }
  },
  
  async getEstadisticas(): Promise<InventarioApiResponse<EstadisticasInventario>> {
    try {
      return await apiRequest<EstadisticasInventario>("/api/inventario/estadisticas/");
    } catch (error) {
      return handleError<EstadisticasInventario>(error);
    }
  }
};