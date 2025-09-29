import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { notificacionesService } from '@/services';
import type { 
  Notificacion, 
  NotificacionFormData, 
  NotificacionFilters, 
  PaginatedResponse,
  NotificacionEstadisticas
} from '@/types';

interface UseNotificacionesState {
  data: PaginatedResponse<Notificacion> | null;
  loading: boolean;
  error: string | null;
  selectedItem: Notificacion | null;
  isStoreModalOpen: boolean;
  isDeleteModalOpen: boolean;
  filters: NotificacionFilters;
  estadisticas: NotificacionEstadisticas | null;
  showStats: boolean;
}

interface UseNotificacionesActions {
  // Data operations
  loadData: (filters?: NotificacionFilters) => Promise<void>;
  loadItem: (id: number) => Promise<void>;
  createItem: (data: NotificacionFormData) => Promise<boolean>;
  updateItem: (id: number, data: NotificacionFormData) => Promise<boolean>;
  deleteItem: (id: number) => Promise<boolean>;
  
  // UI state management
  openStoreModal: (item?: Notificacion) => void;
  closeStoreModal: () => void;
  openDeleteModal: (item: Notificacion) => void;
  closeDeleteModal: () => void;
  setFilters: (filters: NotificacionFilters) => void;
  clearError: () => void;
  
  // Estadísticas
  loadEstadisticas: () => Promise<void>;
  toggleStats: () => void;
}

export function useNotificaciones(): UseNotificacionesState & UseNotificacionesActions {
  const [state, setState] = useState<UseNotificacionesState>({
    data: null,
    loading: false,
    error: null,
    selectedItem: null,
    isStoreModalOpen: false,
    isDeleteModalOpen: false,
    filters: {},
    estadisticas: null,
    showStats: false
  });

  const loadData = useCallback(async (filters?: NotificacionFilters) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const currentFilters = filters || state.filters;
      const response = await notificacionesService.getNotificaciones(currentFilters);
      
      setState(prev => ({ 
        ...prev, 
        data: response, 
        loading: false,
        filters: currentFilters
      }));
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Error al cargar notificaciones' 
      }));
      toast.error('Error al cargar notificaciones');
    }
  }, [state.filters]);

  const loadItem = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const notificacion = await notificacionesService.getNotificacion(id);
      setState(prev => ({ 
        ...prev, 
        selectedItem: notificacion, 
        loading: false 
      }));
    } catch (error) {
      console.error('Error al cargar la notificación:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Error al cargar la notificación'
      }));
      toast.error('Error al cargar la notificación');
    }
  }, []);

  const createItem = useCallback(async (data: NotificacionFormData): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await notificacionesService.createNotificacion(data);
      await loadData();
      toast.success('Notificación creada con éxito');
      return true;
    } catch (error: any) {
      console.error('Error al crear la notificación:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error?.message || 'Error al crear la notificación' 
      }));
      toast.error(error?.message || 'Error al crear la notificación');
      return false;
    }
  }, [loadData]);

  const updateItem = useCallback(async (id: number, data: NotificacionFormData): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await notificacionesService.updateNotificacion(id, data);
      await loadData();
      toast.success('Notificación actualizada con éxito');
      return true;
    } catch (error: any) {
      console.error('Error al actualizar la notificación:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error?.message || 'Error al actualizar la notificación' 
      }));
      toast.error(error?.message || 'Error al actualizar la notificación');
      return false;
    }
  }, [loadData]);

  const deleteItem = useCallback(async (id: number): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await notificacionesService.deleteNotificacion(id);
      await loadData();
      toast.success('Notificación eliminada con éxito');
      return true;
    } catch (error: any) {
      console.error('Error al eliminar la notificación:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error?.message || 'Error al eliminar la notificación'
      }));
      toast.error(error?.message || 'Error al eliminar la notificación');
      return false;
    }
  }, [loadData]);

  const openStoreModal = useCallback((item?: Notificacion) => {
    setState(prev => ({ 
      ...prev, 
      selectedItem: item || null, 
      isStoreModalOpen: true 
    }));
  }, []);

  const closeStoreModal = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      selectedItem: null, 
      isStoreModalOpen: false 
    }));
  }, []);

  const openDeleteModal = useCallback((item: Notificacion) => {
    setState(prev => ({ 
      ...prev, 
      selectedItem: item, 
      isDeleteModalOpen: true 
    }));
  }, []);

  const closeDeleteModal = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      isDeleteModalOpen: false 
    }));
  }, []);

  const setFilters = useCallback((filters: NotificacionFilters) => {
    setState(prev => ({ ...prev, filters }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const loadEstadisticas = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const stats = await notificacionesService.getEstadisticas();
      setState(prev => ({ 
        ...prev, 
        estadisticas: stats, 
        loading: false 
      }));
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      toast.error('Error al cargar estadísticas');
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const toggleStats = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      showStats: !prev.showStats 
    }));
    
    if (!state.showStats && !state.estadisticas) {
      loadEstadisticas();
    }
  }, [state.showStats, state.estadisticas, loadEstadisticas]);

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
    loadEstadisticas,
    toggleStats
  };
}