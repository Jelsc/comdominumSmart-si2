import { useCallback, useState } from "react";
import type { PaginatedResponse } from "@/types";
import type { AreaComun, AreaComunForm } from "@/types/areas-comunes";
import {
  areasComunesApi,
  type AreasComunesApiResponse,
  type ListAreasComunesParams,
} from "@/services/areas-comunes.api";

interface AreasComunesState {
  data: PaginatedResponse<AreaComun> | null;
  loading: boolean;
  error: string | null;
  selectedItem: AreaComun | null;
  isStoreModalOpen: boolean;
  isDeleteModalOpen: boolean;
  filters: ListAreasComunesParams;
}

interface AreasComunesActions {
  loadData: (filters?: ListAreasComunesParams) => Promise<void>;
  createItem: (
    payload: AreaComunForm
  ) => Promise<AreasComunesApiResponse<AreaComun>>;
  updateItem: (
    id: number,
    payload: AreaComunForm
  ) => Promise<AreasComunesApiResponse<AreaComun>>;
  deleteItem: (id: number) => Promise<AreasComunesApiResponse<null>>;
  openStoreModal: (item?: AreaComun) => void;
  closeStoreModal: () => void;
  openDeleteModal: (item: AreaComun) => void;
  closeDeleteModal: () => void;
  setFilters: (filters: ListAreasComunesParams) => void;
  clearError: () => void;
}

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
  });

  const loadData = useCallback(async (filters?: ListAreasComunesParams) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    const response = await areasComunesApi.list(filters ?? state.filters);

    if (response.success && response.data) {
      setState(prev => ({
        ...prev,
        loading: false,
        data: response.data!,
        error: null,
        filters: filters ?? prev.filters,
      }));
    } else {
      setState(prev => ({
        ...prev,
        loading: false,
        error: response.error ?? "No se pudo cargar la información",
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

  const setFilters = useCallback((filters: ListAreasComunesParams) => {
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
