import { apiRequest } from './api';
import type { 
  Residente, 
  ResidenteFormData, 
  ResidenteFilters, 
  PaginatedResponse, 
  ApiResponse,
  ResidenteOption 
} from '@/types';

// Mappers para convertir entre formatos del frontend y backend
const toDTO = (data: ResidenteFormData) => ({
  nombre: data.nombre,
  apellido: data.apellido,
  ci: data.ci,
  email: data.email,
  telefono: data.telefono,
  unidad_habitacional: data.unidad_habitacional,
  tipo: data.tipo,
  fecha_ingreso: data.fecha_ingreso ? data.fecha_ingreso.toISOString().split('T')[0] : undefined,
  estado: data.estado || 'en_proceso',
});

const fromDTO = (data: any): Residente => ({
  id: data.id,
  nombre: data.nombre,
  apellido: data.apellido,
  ci: data.ci,
  email: data.email,
  telefono: data.telefono,
  // Campos específicos de Residente
  unidad_habitacional: data.unidad_habitacional,
  tipo: data.tipo,
  fecha_ingreso: data.fecha_ingreso,
  estado: data.estado,
  fecha_creacion: data.fecha_creacion,
  fecha_actualizacion: data.fecha_actualizacion,
  usuario: data.usuario,
  // Campos del usuario relacionado
  username: data.username,
  // Campos calculados/derivados
  nombre_completo: data.nombre_completo,
  puede_acceder: data.puede_acceder || false,
  estado_usuario: data.estado_usuario || 'sin_usuario',
});

export const residentesApi = {
  // Listar residentes con filtros y paginación
  async list(filters?: ResidenteFilters): Promise<ApiResponse<PaginatedResponse<Residente>>> {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.estado) params.append('estado', filters.estado);
    if (filters?.tipo) params.append('tipo', filters.tipo);
    
    const query = params.toString();
    const response = await apiRequest(`/api/residentes/${query ? `?${query}` : ''}`);
    
    if (response.success && response.data) {
      const data = response.data as any;
      return {
        success: true,
        data: {
          count: data.count,
          next: data.next,
          previous: data.previous,
          results: data.results.map(fromDTO),
        },
      };
    }
    
    return response as ApiResponse<PaginatedResponse<Residente>>;
  },

  // Obtener residente por ID
  async get(id: number): Promise<ApiResponse<Residente>> {
    const response = await apiRequest(`/api/residentes/${id}/`);
    
    if (response.success && response.data) {
      return {
        success: true,
        data: fromDTO(response.data),
      };
    }
    
    return response as ApiResponse<Residente>;
  },

  // Crear nuevo residente
  async create(data: ResidenteFormData): Promise<ApiResponse<Residente>> {
    const response = await apiRequest('/api/residentes/', {
      method: 'POST',
      body: JSON.stringify(toDTO(data)),
    });
    
    if (response.success && response.data) {
      return {
        success: true,
        data: fromDTO(response.data),
      };
    }
    
    return response as ApiResponse<Residente>;
  },

  // Actualizar residente
  async update(id: number, data: ResidenteFormData): Promise<ApiResponse<Residente>> {
    const response = await apiRequest(`/api/residentes/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(toDTO(data)),
    });
    
    if (response.success && response.data) {
      return {
        success: true,
        data: fromDTO(response.data),
      };
    }
    
    return response as ApiResponse<Residente>;
  },

  // Eliminar residente
  async remove(id: number): Promise<ApiResponse> {
    return apiRequest(`/api/residentes/${id}/`, {
      method: 'DELETE',
    });
  },

  // Obtener residentes disponibles para autocompletado
  async getAvailable(): Promise<ApiResponse<ResidenteOption[]>> {
    const response = await apiRequest('/api/residentes/disponibles_para_usuario/');
    
    if (response.success && response.data) {
      const data = response.data as any;
      return {
        success: true,
        data: data.map((item: any) => ({
          id: item.id,
          nombre: item.nombre,
          apellido: item.apellido,
          email: item.email,
          ci: item.ci,
          telefono: item.telefono,
          unidad_habitacional: item.unidad_habitacional,
        })),
      };
    }
    
    return response as ApiResponse<ResidenteOption[]>;
  },

  // Obtener residentes por unidad habitacional
  async getByUnidad(unidad: string): Promise<ApiResponse<Residente[]>> {
    const response = await apiRequest(`/api/residentes/por_unidad/?unidad=${unidad}`);
    
    if (response.success && response.data) {
      const data = response.data as any;
      return {
        success: true,
        data: data.map(fromDTO),
      };
    }
    
    return response as ApiResponse<Residente[]>;
  },

  // Obtener estadísticas
  async getStatistics(): Promise<ApiResponse<{
    total: number;
    activos: number;
    inactivos: number;
    suspendidos: number;
    en_proceso: number;
    por_tipo: Record<string, number>;
    nuevos_este_mes: number;
  }>> {
    return apiRequest('/api/residentes/estadisticas/');
  },
};
