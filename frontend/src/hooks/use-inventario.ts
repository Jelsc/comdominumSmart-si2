import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { PaginatedResponse } from "@/types";
import type { 
  Inventario,
  InventarioForm,
  InventarioFilter,
  EstadoInventario,
  CategoriaInventario
} from "@/types/inventario";
import {
  inventarioApi,
  type InventarioApiResponse
} from "@/services/inventario.api";

// Estado del hook
interface InventarioState {
  // Datos y estado de carga
  data: PaginatedResponse<Inventario> | null;
  loading: boolean;
  error: string | null;
  
  // Estado de modales y selección
  selectedItem: Inventario | null;
  isStoreModalOpen: boolean;
  isDeleteModalOpen: boolean;
  
  // Filtros aplicados
  filters: InventarioFilter;
  
  // Estadísticas
  itemsActivos: number;
  itemsInactivos: number;
  itemsEnReparacion: number;
  itemsDadosDeBaja: number;
}

// Acciones del hook
interface InventarioActions {
  // Operaciones CRUD
  loadData: (filters?: InventarioFilter) => Promise<void>;
  createItem: (payload: InventarioForm) => Promise<InventarioApiResponse<Inventario>>;
  updateItem: (id: number, payload: InventarioForm) => Promise<InventarioApiResponse<Inventario>>;
  deleteItem: (id: number) => Promise<InventarioApiResponse<null>>;
  
  // Gestión de UI
  openStoreModal: (item?: Inventario) => void;
  closeStoreModal: () => void;
  openDeleteModal: (item: Inventario) => void;
  closeDeleteModal: () => void;
  setFilters: (filters: InventarioFilter) => void;
  clearError: () => void;
}

// Interfaz para métodos auxiliares adicionales
interface InventarioHelpers {
  // Propiedades adicionales para la página
  inventario: Inventario[];
  inventarioDetallado: Inventario[];
  inventarioSeleccionado: Inventario | null;
  estadisticas: {
    total: number;
    por_estado: {
      activos: number;
      inactivos: number;
      en_reparacion: number;
      dados_de_baja: number;
    };
    por_categoria: Record<CategoriaInventario, number>;
  } | null;
  modal: {
    open: boolean;
    isEdit: boolean;
  };
  confirmacion: {
    open: boolean;
  };
  filtros: InventarioFilter;
  cargando: boolean;

  // Métodos adicionales
  loadInventario: (filters?: InventarioFilter) => Promise<void>;
  createInventario: (payload: InventarioForm) => Promise<InventarioApiResponse<Inventario>>;
  updateInventario: (id: number, payload: InventarioForm) => Promise<InventarioApiResponse<Inventario>>;
  deleteInventario: (id: number) => Promise<InventarioApiResponse<null>>;
  setInventarioSeleccionado: (item: Inventario | null) => void;
  openCreateModal: () => void;
  openEditModal: (id: number) => void;
  closeModal: () => void;
  cancelDelete: () => void;
  confirmDelete: () => void;
}

// Tipo combinado para el hook
export type UseInventario = InventarioState & InventarioActions & InventarioHelpers;

export const useInventario = (): UseInventario => {
  const [state, setState] = useState<InventarioState>({
    data: null,
    loading: false,
    error: null,
    selectedItem: null,
    isStoreModalOpen: false,
    isDeleteModalOpen: false,
    filters: {},
    itemsActivos: 0,
    itemsInactivos: 0,
    itemsEnReparacion: 0,
    itemsDadosDeBaja: 0
  });

  const loadData = useCallback(async (filters?: InventarioFilter) => {
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
      const response = await inventarioApi.list(filters ?? state.filters);
      
      if (response.success && response.data) {
        const items = response.data.results || [];
        
        // Calcular estadísticas
        const itemsActivos = items.filter(item => item.estado === "ACTIVO").length;
        const itemsInactivos = items.filter(item => item.estado === "INACTIVO").length;
        const itemsEnReparacion = items.filter(item => item.estado === "EN_REPARACION").length;
        const itemsDadosDeBaja = items.filter(item => item.estado === "DADO_DE_BAJA").length;
        
        setState(prev => ({
          ...prev,
          loading: false,
          data: response.data ?? null,
          error: null,
          filters: filters ?? prev.filters,
          itemsActivos,
          itemsInactivos,
          itemsEnReparacion,
          itemsDadosDeBaja
        }));
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: response.error ?? "No se pudo cargar la información",
          data: null,
        }));
      }
    } catch (error) {
      console.error("Error al cargar inventario:", error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: "Error al procesar la respuesta de la API",
        data: null,
      }));
    }
  }, [state.filters]);

  const createItem = useCallback(async (payload: InventarioForm): Promise<InventarioApiResponse<Inventario>> => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const response = await inventarioApi.create(payload);
      
      if (response.success) {
        // Volver a cargar los datos para reflejar el nuevo item
        await loadData();
      }
      
      setState(prev => ({ ...prev, loading: false }));
      return response;
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error al crear el elemento",
        data: null
      };
    }
  }, [loadData]);

  const updateItem = useCallback(async (id: number, payload: InventarioForm): Promise<InventarioApiResponse<Inventario>> => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const response = await inventarioApi.update(id, payload);
      
      if (response.success) {
        // Volver a cargar los datos para reflejar los cambios
        await loadData();
      }
      
      setState(prev => ({ ...prev, loading: false }));
      return response;
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error al actualizar el elemento",
        data: null
      };
    }
  }, [loadData]);

  const deleteItem = useCallback(async (id: number): Promise<InventarioApiResponse<null>> => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const response = await inventarioApi.remove(id);
      
      if (response.success) {
        // Volver a cargar los datos para reflejar los cambios
        await loadData();
      }
      
      setState(prev => ({ ...prev, loading: false }));
      return response;
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error al eliminar el elemento",
        data: null
      };
    }
  }, [loadData]);

  const openStoreModal = useCallback((item?: Inventario) => {
    setState(prev => ({
      ...prev,
      selectedItem: item || null,
      isStoreModalOpen: true,
    }));
  }, []);

  const closeStoreModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedItem: null,
      isStoreModalOpen: false,
    }));
  }, []);

  const openDeleteConfirmation = useCallback((item: Inventario) => {
    setState(prev => ({
      ...prev,
      selectedItem: item,
      isDeleteModalOpen: true,
    }));
  }, []);

  const closeDeleteModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedItem: null,
      isDeleteModalOpen: false,
    }));
  }, []);

  const setFilters = useCallback((filters: InventarioFilter) => {
    setState(prev => ({
      ...prev,
      filters,
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  // Estadísticas del inventario en el formato esperado por el componente
  const estadisticas = state.data ? {
    total: state.data.count || 0,
    por_estado: {
      activos: state.itemsActivos,
      inactivos: state.itemsInactivos,
      en_reparacion: state.itemsEnReparacion,
      dados_de_baja: state.itemsDadosDeBaja
    },
    por_categoria: {} as Record<CategoriaInventario, number>
  } : null;

  // Inventario detallado para la tabla, incluyendo áreas comunes completas
  const inventarioDetallado = state.data ? state.data.results || [] : [];

  // Estructura del modal más legible para la página
  const modal = {
    open: state.isStoreModalOpen,
    isEdit: !!state.selectedItem,
  };

  // Estructura de confirmación más legible para la página
  const confirmacion = {
    open: state.isDeleteModalOpen,
  };

  return {
    // Estado original
    data: state.data,
    loading: state.loading,
    error: state.error,
    selectedItem: state.selectedItem,
    isStoreModalOpen: state.isStoreModalOpen,
    isDeleteModalOpen: state.isDeleteModalOpen,
    filters: state.filters,
    itemsActivos: state.itemsActivos,
    itemsInactivos: state.itemsInactivos,
    itemsEnReparacion: state.itemsEnReparacion,
    itemsDadosDeBaja: state.itemsDadosDeBaja,

    // Funciones originales
    loadData,
    createItem,
    updateItem,
    deleteItem,
    openStoreModal,
    closeStoreModal,
    openDeleteModal: openDeleteConfirmation,
    closeDeleteModal,
    setFilters,
    clearError,

    // Nuevos nombres para la página de inventario
    inventario: state.data?.results || [],
    inventarioDetallado,
    inventarioSeleccionado: state.selectedItem,
    estadisticas,
    modal,
    confirmacion,
    filtros: state.filters,
    cargando: state.loading,
    loadInventario: loadData,
    createInventario: createItem,
    updateInventario: updateItem,
    deleteInventario: deleteItem,
    setInventarioSeleccionado: (item: Inventario | null) => setState(prev => ({ ...prev, selectedItem: item })),
    openCreateModal: () => openStoreModal(),
    openEditModal: (id: number) => {
      const item = state.data?.results?.find(i => i.id === id);
      if (item) openStoreModal(item);
    },
    closeModal: closeStoreModal,
    cancelDelete: closeDeleteModal,
    confirmDelete: () => {
      if (state.selectedItem) {
        deleteItem(state.selectedItem.id);
        closeDeleteModal();
      }
    },
  };
};