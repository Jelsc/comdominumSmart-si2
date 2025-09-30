import { useCallback } from 'react';
import { api } from '@/lib/api';
import type { Notificacion, NotificacionFormData, PaginatedResponse } from '@/types';

// Adaptamos los métodos para usar las rutas existentes en el backend
export const notificacionesService = {
  /**
   * Obtiene las notificaciones dirigidas al usuario actual (adaptado a rutas existentes)
   * Usa el endpoint normal de notificaciones con un filtro especial para el usuario
   */
  async getUserNotifications(params: { page?: number; page_size?: number; estado?: string; no_leidas?: string } = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params.estado) queryParams.append('estado', params.estado);
    if (params.no_leidas) queryParams.append('no_leidas', params.no_leidas);
    
    // Añadimos el filtro para mostrar solo las notificaciones del usuario actual
    queryParams.append('usuario_actual', 'true');
    
    try {
      const response = await api.get<PaginatedResponse<Notificacion>>(`/api/notificaciones/?${queryParams}`);
      return response.data;
    } catch (error: any) {
      console.error('Error en getUserNotifications:', error.response?.data || error.message);
      // Devolver una respuesta vacía en caso de error para evitar que falle la UI
      return { count: 0, next: null, previous: null, results: [] };
    }
  },
  
  /**
   * Marca una notificación como leída (adaptado a rutas existentes)
   * Usa el endpoint específico para marcar como leída
   */
  async markAsRead(notificationId: number) {
    try {
      // Usamos el endpoint específico para marcar como leída en lugar del PATCH genérico
      const response = await api.post(`/api/notificaciones/${notificationId}/marcar_como_leida/`);
      return response.data;
    } catch (error: any) {
      console.error('Error al marcar notificación como leída:', error);
      
      // Si el endpoint específico falla, intentamos con el método anterior como fallback
      try {
        // Primero obtenemos la notificación actual para mantener sus datos
        const getResponse = await api.get(`/api/notificaciones/${notificationId}/`);
        const notificacion = getResponse.data;
        
        // Actualizamos solo el estado a "leida" (en minúsculas según el backend)
        const updateData = {
          ...notificacion,
          estado: 'leida'
        };
        
        const patchResponse = await api.patch(`/api/notificaciones/${notificationId}/`, updateData);
        return patchResponse.data;
      } catch (fallbackError) {
        console.error('Error en método fallback:', fallbackError);
        throw error; // Re-lanzamos el error original
      }
    }
  }
};