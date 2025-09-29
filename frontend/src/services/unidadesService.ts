import { apiRequest } from './api';
import type { ApiResponse } from './api';
import type { 
  Unidad, 
  UnidadForm, 
  UnidadFilterParams,
  PaginatedResponse
} from '@/types';

/**
 * Convertidor de datos del formulario al formato DTO esperado por la API
 */
const toDTO = (data: UnidadForm): Record<string, any> => {
  const dto: Record<string, any> = {
    codigo: data.codigo, // Añadimos el código que faltaba
    estado: data.estado,
    direccion: data.direccion,
    cantidad_vehiculos: data.cantidad_vehiculos,
  };
  
  // Solo incluir residente_ids si está definido (incluso si es vacío)
  // Esto respeta la lógica del backend donde null/undefined significa "no tocar los residentes"
  if (data.residente_ids !== undefined) {
    dto.residente_ids = data.residente_ids || [];
  }
  
  return dto;
};

/**
 * Obtener listado paginado de unidades habitacionales con filtros opcionales
 */
export const getUnidades = async (
  params: UnidadFilterParams = {}
): Promise<ApiResponse<PaginatedResponse<Unidad>>> => {
  // Construir query string de forma manual
  const query = new URLSearchParams();
  if (params.estado) query.append('estado', params.estado);
  if (params.search) query.append('search', params.search);
  if (params.page) query.append('page', params.page.toString());
  if (params.page_size) query.append('page_size', params.page_size.toString());
  
  const queryString = query.toString();
  const url = `/api/unidades/${queryString ? `?${queryString}` : ''}`;
  
  return apiRequest<PaginatedResponse<Unidad>>(url);
};

/**
 * Obtener detalle de una unidad habitacional por ID
 */
export const getUnidad = async (id: number): Promise<ApiResponse<Unidad>> => {
  return apiRequest<Unidad>(`/api/unidades/${id}/`);
};

/**
 * Crear una nueva unidad habitacional
 */
export const createUnidad = async (data: UnidadForm): Promise<ApiResponse<Unidad>> => {
  console.log('Enviando datos para crear unidad:', toDTO(data)); // Agregar log para depuración
  return apiRequest<Unidad>('/api/unidades/', {
    method: 'POST',
    body: JSON.stringify(toDTO(data))
  });
};

/**
 * Actualizar una unidad habitacional existente
 */
export const updateUnidad = async (id: number, data: UnidadForm): Promise<ApiResponse<Unidad>> => {
  return apiRequest<Unidad>(`/api/unidades/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(toDTO(data))
  });
};

/**
 * Eliminar una unidad habitacional
 */
export const deleteUnidad = async (id: number): Promise<ApiResponse<null>> => {
  return apiRequest<null>(`/api/unidades/${id}/`, {
    method: 'DELETE'
  });
};

/**
 * Obtener residentes disponibles para asignar a unidades
 */
export const getResidentesDisponibles = async (): Promise<ApiResponse<Array<{id: number, nombre: string, apellido: string}>>> => {
  // Construimos la URL con el parámetro como query string
  const url = '/api/residentes/?disponibles=true';
  return apiRequest<Array<{id: number, nombre: string, apellido: string}>>(url);
};