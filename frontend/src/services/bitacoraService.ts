import { api } from "@/lib/api";
import type { BitacoraLog } from "@/types/bitacora";

export interface PaginatedBitacora {
  count: number;
  next: string | null;
  previous: string | null;
  results: BitacoraLog[];
}

// page = número de página, search = texto a buscar
export const getBitacora = async (
  page = 1,
  search = "",
  rol = ""
): Promise<PaginatedBitacora> => {
  const response = await api.get("/api/bitacora/", {
    params: { page, search, rol }, // ahora mandamos rol al backend
  });
  return response.data;
};