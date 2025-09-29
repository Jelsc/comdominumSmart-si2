import { apiRequest, ApiError, type ApiResponse } from "./api";
import type { PaginatedResponse } from "@/types";
import { toast } from "sonner";
import type {
  AreaComun,
  AreaComunForm,
  EstadoArea,
} from "@/types/areas-comunes";

export type ListAreasComunesParams = {
  estado?: EstadoArea;
  search?: string;
  page?: number;
  page_size?: number;
};

type ApiErrors = Record<string, string[] | string> | string | null | undefined;

export interface AreasComunesApiResponse<T>
  extends ApiResponse<T> {
  errors?: ApiErrors;
  status?: number;
}

const formatPayload = (payload: AreaComunForm) => ({
  nombre: payload.nombre.trim(),
  monto_hora: payload.monto_hora.toFixed(2),
  estado: payload.estado,
});

const buildQueryString = (params?: ListAreasComunesParams) => {
  if (!params) return "";
  const query = new URLSearchParams();
  if (params.estado) query.append("estado", params.estado);
  if (params.search) query.append("search", params.search);
  if (params.page) query.append("page", params.page.toString());
  if (params.page_size) query.append("page_size", params.page_size.toString());
  const qs = query.toString();
  return qs ? `?${qs}` : "";
};

const handleError = <T>(error: unknown): AreasComunesApiResponse<T> => {
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

export const areasComunesApi = {
  async list(
    params?: ListAreasComunesParams
  ): Promise<AreasComunesApiResponse<PaginatedResponse<AreaComun>>> {
    try {
      return await apiRequest<PaginatedResponse<AreaComun>>(
        `/api/areas-comunes/${buildQueryString(params)}`
      );
    } catch (error) {
      return handleError<PaginatedResponse<AreaComun>>(error);
    }
  },

  async get(id: number): Promise<AreasComunesApiResponse<AreaComun>> {
    try {
      return await apiRequest<AreaComun>(`/api/areas-comunes/${id}/`);
    } catch (error) {
      return handleError<AreaComun>(error);
    }
  },

  async create(
    payload: AreaComunForm
  ): Promise<AreasComunesApiResponse<AreaComun>> {
    try {
      const response = await apiRequest<AreaComun>("/api/areas-comunes/", {
        method: "POST",
        body: JSON.stringify(formatPayload(payload)),
      });
      toast.success("Área común creada correctamente");
      return response;
    } catch (error) {
      return handleError<AreaComun>(error);
    }
  },

  async update(
    id: number,
    payload: AreaComunForm
  ): Promise<AreasComunesApiResponse<AreaComun>> {
    try {
      const response = await apiRequest<AreaComun>(
        `/api/areas-comunes/${id}/`,
        {
          method: "PUT",
          body: JSON.stringify(formatPayload(payload)),
        }
      );
      toast.success("Área común actualizada correctamente");
      return response;
    } catch (error) {
      return handleError<AreaComun>(error);
    }
  },

  async remove(id: number): Promise<AreasComunesApiResponse<null>> {
    try {
      const response = await apiRequest<null>(`/api/areas-comunes/${id}/`, {
        method: "DELETE",
      });
      toast.success("Área común eliminada correctamente");
      return response;
    } catch (error) {
      return handleError<null>(error);
    }
  },
};
