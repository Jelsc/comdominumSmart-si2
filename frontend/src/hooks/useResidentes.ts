import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { residentesApi } from '@/services/residentesService';
import type { 
  Residente, 
  ResidenteFormData, 
  ResidenteFilters, 
  PaginatedResponse,
  ResidenteOption 
} from '@/types';

interface UseResidentesState {
  data: PaginatedResponse<Residente> | null;
  loading: boolean;
  error: string | null;
  selectedItem: Residente | null;
  isStoreModalOpen: boolean;
  isDeleteModalOpen: boolean;
  filters: ResidenteFilters;
  availableResidentes: ResidenteOption[];
  residentesActivos: number;
  residentesInactivos: number;
}

interface UseResidentesActions {
  // Data operations
  loadData: (filters?: ResidenteFilters) => Promise<void>;
  loadItem: (id: number) => Promise<void>;
  createItem: (data: ResidenteFormData) => Promise<boolean>;
  updateItem: (id: number, data: ResidenteFormData) => Promise<boolean>;
  deleteItem: (id: number) => Promise<boolean>;
  
  // UI state management
  openStoreModal: (item?: Residente) => void;
  closeStoreModal: () => void;
  openDeleteModal: (item: Residente) => void;
  closeDeleteModal: () => void;
  setFilters: (filters: ResidenteFilters) => void;
  clearError: () => void;
  
  // Utility functions
  loadAvailableResidentes: () => Promise<void>;
}

export function useResidentes(): UseResidentesState & UseResidentesActions {
  const [state, setState] = useState<UseResidentesState>({
    data: null,
    loading: false,
    error: null,
    selectedItem: null,
    isStoreModalOpen: false,
    isDeleteModalOpen: false,
    filters: {},
    availableResidentes: [],
    residentesActivos: 0,
    residentesInactivos: 0,
  });

  const loadData = useCallback(async (filters?: ResidenteFilters) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await residentesApi.list(filters);
      
      if (response.success && response.data) {
        const residentesActivos = response.data.results?.filter(r => r.estado === 'activo').length || 0;
        const residentesInactivos = (response.data.results?.length || 0) - residentesActivos;
        
        setState(prev => ({ 
          ...prev, 
          data: response.data!, 
          loading: false,
          filters: filters || prev.filters,
          residentesActivos,
          residentesInactivos,
        }));
      } else {
        throw new Error(response.error || 'Error al cargar los residentes');
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
      const response = await residentesApi.get(id);
      
      if (response.success && response.data) {
        setState(prev => ({ 
          ...prev, 
          selectedItem: response.data!, 
          loading: false 
        }));
      } else {
        throw new Error(response.error || 'Error al cargar el residente');
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

  const createItem = useCallback(async (data: ResidenteFormData): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await residentesApi.create(data);
      
      if (response.success) {
        setState(prev => ({ 
          ...prev, 
          loading: false,
          isStoreModalOpen: false,
          selectedItem: null 
        }));
        toast.success('Residente creado exitosamente');
        await loadData(state.filters); // Recargar datos
        return true;
      } else {
        throw new Error(response.error || 'Error al crear el residente');
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
  }, [loadData, state.filters]);

  const updateItem = useCallback(async (id: number, data: ResidenteFormData): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await residentesApi.update(id, data);
      
      if (response.success) {
        setState(prev => ({ 
          ...prev, 
          loading: false,
          isStoreModalOpen: false,
          selectedItem: null 
        }));
        toast.success('Residente actualizado exitosamente');
        await loadData(state.filters); // Recargar datos
        return true;
      } else {
        throw new Error(response.error || 'Error al actualizar el residente');
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
  }, [loadData, state.filters]);

  const deleteItem = useCallback(async (id: number): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await residentesApi.remove(id);
      
      if (response.success) {
        setState(prev => ({ 
          ...prev, 
          loading: false,
          isDeleteModalOpen: false,
          selectedItem: null 
        }));
        toast.success('Residente eliminado exitosamente');
        await loadData(state.filters); // Recargar datos
        return true;
      } else {
        throw new Error(response.error || 'Error al eliminar el residente');
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
  }, [loadData, state.filters]);

  const openStoreModal = useCallback((item?: Residente) => {
    setState(prev => ({ 
      ...prev, 
      isStoreModalOpen: true, 
      selectedItem: item || null 
    }));
  }, []);

  const closeStoreModal = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      isStoreModalOpen: false, 
      selectedItem: null 
    }));
  }, []);

  const openDeleteModal = useCallback((item: Residente) => {
    setState(prev => ({ 
      ...prev, 
      isDeleteModalOpen: true, 
      selectedItem: item 
    }));
  }, []);

  const closeDeleteModal = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      isDeleteModalOpen: false, 
      selectedItem: null 
    }));
  }, []);

  const setFilters = useCallback((filters: ResidenteFilters) => {
    setState(prev => ({ ...prev, filters }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const loadAvailableResidentes = useCallback(async () => {
    try {
      const response = await residentesApi.getAvailable();
      
      if (response.success && response.data) {
        setState(prev => ({ 
          ...prev, 
          availableResidentes: response.data! 
        }));
      }
    } catch (error) {
      console.error('Error al cargar residentes disponibles:', error);
    }
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
    loadAvailableResidentes,
  };
}
