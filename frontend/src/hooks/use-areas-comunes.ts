import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { PaginatedResponse } from "@/types";
import type { 
  AreaComun, 
  AreaComunForm,
  AreaComunFilter, 
  EstadoArea 
} from "@/types/areas-comunes";
import {
  areasComunesApi,
  type AreasComunesApiResponse
} from "@/services/areas-comunes.api";

// Estado del hook
interface AreasComunesState {
  // Datos y estado de carga
  data: PaginatedResponse<AreaComun> | null;
  loading: boolean;
  error: string | null;
  
  // Estado de modales y selección
  selectedItem: AreaComun | null;
  isStoreModalOpen: boolean;
  isDeleteModalOpen: boolean;
  
  // Filtros aplicados
  filters: AreaComunFilter;
  
  // Estadísticas
  areasActivas: number;
  areasInactivas: number;
  areasEnMantenimiento: number;
}

// Acciones del hook
interface AreasComunesActions {
  // Operaciones CRUD
  loadData: (filters?: AreaComunFilter) => Promise<void>;
  createItem: (payload: AreaComunForm) => Promise<AreasComunesApiResponse<AreaComun>>;
  updateItem: (id: number, payload: AreaComunForm) => Promise<AreasComunesApiResponse<AreaComun>>;
  deleteItem: (id: number) => Promise<AreasComunesApiResponse<null>>;
  
  // Gestión de UI
  openStoreModal: (item?: AreaComun) => void;
  closeStoreModal: () => void;
  openDeleteModal: (item: AreaComun) => void;
  closeDeleteModal: () => void;
  setFilters: (filters: AreaComunFilter) => void;
  clearError: () => void;
}

// Tipo combinado para el hook
export type UseAreasComunes = AreasComunesState & AreasComunesActions;

export const useAreasComunes = (): UseAreasComunes => {
  const [state, setState] = useState<AreasComunesState>({
    data: null,
    loading: false,
    error: null,
    selectedItem: null,
    isStoreModalOpen: false,
    isDeleteModalOpen: false,
    filters: {},
    areasActivas: 0,
    areasInactivas: 0,
    areasEnMantenimiento: 0
  });

  const loadData = useCallback(async (filters?: AreaComunFilter) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Verificar que el token de acceso existe antes de hacer la solicitud
      const token = localStorage.getItem("access_token");
      if (!token) {
        console.error("Token de acceso no encontrado");
        setState(prev => ({
          ...prev,
          loading: false,
          error: "Sesión no válida. Por favor, inicie sesión nuevamente.",
          data: null,
        }));
        return;
      }

      // Hacer la solicitud a la API
      const response = await areasComunesApi.list(filters ?? state.filters);
      
      // Verificar si la respuesta es válida y contiene los datos esperados
      if (response.success && response.data) {
        // Verificar si results existe y es un array
        if (!response.data.results || !Array.isArray(response.data.results)) {
          console.error("La respuesta no contiene un array de resultados:", response.data);
          
          // Intentar directamente con una segunda solicitud al endpoint específico
          try {
            const alternativeResponse = await areasComunesApi.list({
              ...filters ?? state.filters,
              useAlternativeEndpoint: true
            });
            
            if (alternativeResponse.success && 
                alternativeResponse.data && 
                Array.isArray(alternativeResponse.data.results)) {
              // Continuar con el procesamiento normal pero con la respuesta alternativa
              const normalizedResults = alternativeResponse.data.results.map(item => ({
                ...item,
                monto_hora: Number(item.monto_hora),
              }));
              
              const paginatedData: PaginatedResponse<AreaComun> = {
                count: alternativeResponse.data.count ?? 0,
                next: alternativeResponse.data.next ?? null,
                previous: alternativeResponse.data.previous ?? null,
                results: normalizedResults,
              };
              
              if (alternativeResponse.data.total_pages !== undefined) {
                paginatedData.total_pages = alternativeResponse.data.total_pages;
              }
              
              setState(prev => ({
                ...prev,
                loading: false,
                data: paginatedData,
                error: null,
                filters: filters ?? prev.filters,
              }));
              return;
            }
          } catch (error) {
            console.error("Error con el endpoint alternativo:", error);
          }
          
          setState(prev => ({
            ...prev,
            loading: false,
            error: "La respuesta del servidor no tiene el formato esperado",
            data: null,
          }));
          return;
        }
        
        // Normalizar el monto_hora a número en cada área común
        const normalizedResults = response.data.results.map(item => ({
          ...item,
          monto_hora: Number(item.monto_hora),
        }));
        
        // Construir un objeto PaginatedResponse válido con valores por defecto seguros
        const paginatedData: PaginatedResponse<AreaComun> = {
          count: response.data.count ?? 0,
          next: response.data.next ?? null,
          previous: response.data.previous ?? null,
          results: normalizedResults,
        };
        
        // Agregar total_pages solo si está presente
        if (response.data.total_pages !== undefined) {
          paginatedData.total_pages = response.data.total_pages;
        }
        
        
        // Calcular estadísticas de áreas comunes por estado
        const areas = normalizedResults || [];
        const areasActivas = areas.filter(a => a.estado === "ACTIVO").length;
        const areasInactivas = areas.filter(a => a.estado === "INACTIVO").length;
        const areasEnMantenimiento = areas.filter(a => a.estado === "MANTENIMIENTO").length;
        
        setState(prev => ({
          ...prev,
          loading: false,
          data: paginatedData,
          error: null,
          filters: filters ?? prev.filters,
          areasActivas,
          areasInactivas,
          areasEnMantenimiento
        }));
      } else {
        console.error("Respuesta inválida de la API:", response);
        setState(prev => ({
          ...prev,
          loading: false,
          error: response.error ?? "No se pudo cargar la información: datos inválidos",
          data: null,
        }));
      }
    } catch (error) {
      console.error("Error al cargar áreas comunes:", error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: "Error al procesar la respuesta de la API",
        data: null,
      }));
    }
  }, [state.filters]);

  const createItem = useCallback(async (
    payload: AreaComunForm
  ): Promise<AreasComunesApiResponse<AreaComun>> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    const response = await areasComunesApi.create(payload);
    if (response.success) {
      await loadData(state.filters);
      setState(prev => ({ ...prev, loading: false, error: null }));
      return response;
    }
    setState(prev => ({
      ...prev,
      loading: false,
      error: response.error ?? "No se pudo crear el registro",
    }));
    return response;
  }, [loadData, state.filters]);

  const updateItem = useCallback(
    async (
      id: number,
      payload: AreaComunForm
    ): Promise<AreasComunesApiResponse<AreaComun>> => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await areasComunesApi.update(id, payload);
      if (response.success) {
        await loadData(state.filters);
        setState(prev => ({ ...prev, loading: false, error: null }));
        return response;
      }
      setState(prev => ({
        ...prev,
        loading: false,
        error: response.error ?? "No se pudo actualizar el registro",
      }));
      return response;
    },
    [loadData, state.filters]
  );

  const deleteItem = useCallback(
    async (id: number): Promise<AreasComunesApiResponse<null>> => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await areasComunesApi.remove(id);
      if (response.success) {
        await loadData(state.filters);
        setState(prev => ({ ...prev, loading: false, error: null }));
        return response;
      }
      setState(prev => ({
        ...prev,
        loading: false,
        error: response.error ?? "No se pudo eliminar el registro",
      }));
      return response;
    },
    [loadData, state.filters]
  );

  const openStoreModal = useCallback((item?: AreaComun) => {
    setState(prev => ({
      ...prev,
      selectedItem: item ?? null,
      isStoreModalOpen: true,
    }));
  }, []);

  const closeStoreModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      isStoreModalOpen: false,
      selectedItem: null,
    }));
  }, []);

  const openDeleteModal = useCallback((item: AreaComun) => {
    setState(prev => ({
      ...prev,
      selectedItem: item,
      isDeleteModalOpen: true,
    }));
  }, []);

  const closeDeleteModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      isDeleteModalOpen: false,
      selectedItem: null,
    }));
  }, []);

  const setFilters = useCallback((filters: AreaComunFilter) => {
    setState(prev => ({ ...prev, filters }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    loadData,
    createItem,
    updateItem,
    deleteItem,
    openStoreModal,
    closeStoreModal,
    openDeleteModal,
    closeDeleteModal,
    setFilters,
    clearError,
  };
};
