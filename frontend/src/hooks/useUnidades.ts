import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  getUnidades,
  getUnidad,
  createUnidad,
  updateUnidad,
  deleteUnidad
} from '@/services/unidadesService';
import type { 
  Unidad,
  UnidadForm,
  UnidadFilterParams,
  PaginatedResponse
} from '@/types';

interface UseUnidadesState {
  data: PaginatedResponse<Unidad> | null;
  loading: boolean;
  error: string | null;
  selectedItem: Unidad | null;
  isStoreModalOpen: boolean;
  isDeleteModalOpen: boolean;
  filters: UnidadFilterParams;
}

interface UseUnidadesActions {
  // Data operations
  loadData: (filters?: UnidadFilterParams) => Promise<void>;
  loadItem: (id: number) => Promise<void>;
  createItem: (data: UnidadForm) => Promise<boolean>;
  updateItem: (id: number, data: UnidadForm) => Promise<boolean>;
  deleteItem: (id: number) => Promise<boolean>;
  
  // UI state management
  openStoreModal: (item?: Unidad) => void;
  closeStoreModal: () => void;
  openDeleteModal: (item: Unidad) => void;
  closeDeleteModal: () => void;
  setFilters: (filters: UnidadFilterParams) => void;
  clearError: () => void;
}

export function useUnidades(): UseUnidadesState & UseUnidadesActions {
  const [state, setState] = useState<UseUnidadesState>({
    data: null,
    loading: false,
    error: null,
    selectedItem: null,
    isStoreModalOpen: false,
    isDeleteModalOpen: false,
    filters: {},
  });

  const loadData = useCallback(async (filters?: UnidadFilterParams) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await getUnidades(filters);
      
      if (response.success && response.data) {
        setState(prev => ({ 
          ...prev, 
          data: response.data!, 
          loading: false,
          filters: filters || prev.filters,
        }));
      } else {
        throw new Error(response.error || 'Error al cargar las unidades');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      toast.error(errorMessage);
    }
  }, []);

  const loadItem = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await getUnidad(id);
      
      if (response.success && response.data) {
        setState(prev => ({ 
          ...prev, 
          selectedItem: response.data!, 
          loading: false 
        }));
      } else {
        throw new Error(response.error || 'Error al cargar la unidad');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      toast.error(errorMessage);
    }
  }, []);

  const createItem = useCallback(async (data: UnidadForm): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await createUnidad(data);
      
      if (response.success) {
        toast.success('Unidad creada correctamente');
        setState(prev => ({ ...prev, loading: false }));
        return true;
      } else {
        throw new Error(response.error || 'Error al crear la unidad');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      toast.error(errorMessage);
      return false;
    }
  }, []);

  const updateItem = useCallback(async (id: number, data: UnidadForm): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await updateUnidad(id, data);
      
      if (response.success) {
        toast.success('Unidad actualizada correctamente');
        setState(prev => ({ ...prev, loading: false }));
        return true;
      } else {
        throw new Error(response.error || 'Error al actualizar la unidad');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      toast.error(errorMessage);
      return false;
    }
  }, []);

  const deleteItem = useCallback(async (id: number): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await deleteUnidad(id);
      
      if (response.success) {
        toast.success('Unidad eliminada correctamente');
        setState(prev => ({ ...prev, loading: false }));
        return true;
      } else {
        throw new Error(response.error || 'Error al eliminar la unidad');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      toast.error(errorMessage);
      return false;
    }
  }, []);

  const openStoreModal = useCallback((item?: Unidad) => {
    setState(prev => ({ 
      ...prev, 
      selectedItem: item || null,
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

  const openDeleteModal = useCallback((item: Unidad) => {
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

  const setFilters = useCallback((filters: UnidadFilterParams) => {
    setState(prev => ({ ...prev, filters }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    loadData,
    loadItem,
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
}