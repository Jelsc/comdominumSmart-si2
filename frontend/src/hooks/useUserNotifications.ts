import { useState, useCallback, useEffect } from 'react';
import { notificacionesService } from '@/services';
import { notificacionesService as userNotificationsService } from '@/services/userNotificationsService';
import type { Notificacion } from '@/types';

interface UserNotificationsState {
  notifications: Notificacion[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  selectedNotification: Notificacion | null;
}

export function useUserNotifications() {
  const [state, setState] = useState<UserNotificationsState>({
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
    selectedNotification: null
  });
  const [isOpen, setIsOpen] = useState(false);

  const fetchUserNotifications = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      // Obtenemos las notificaciones del usuario actual con un filtro para mostrar solo las no leídas
      const response = await userNotificationsService.getUserNotifications({
        page: 1,
        page_size: 10,
        no_leidas: 'true' // Indicador para excluir notificaciones leídas
      });
      
      setState(prev => ({
        ...prev,
        notifications: response.results || [],
        unreadCount: response.count || 0,
        loading: false
      }));
    } catch (error: any) {
      console.error('Error al cargar las notificaciones:', error);
      // Si hay un error, establecemos una lista vacía para evitar errores en la UI
      setState(prev => ({
        ...prev,
        notifications: [],
        unreadCount: 0,
        loading: false,
        error: error?.message || 'Error al cargar las notificaciones'
      }));
    }
  }, []);

  // Función para seleccionar una notificación para mostrar detalles y marcarla como leída
  const selectNotification = useCallback(async (notification: Notificacion) => {
    setState(prev => ({
      ...prev,
      selectedNotification: notification
    }));
    
    try {
      // También marcamos la notificación como leída cuando la seleccionamos
      await userNotificationsService.markAsRead(notification.id);
      
      // Actualizamos el contador de no leídas y eliminamos la notificación de la lista
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.filter(n => n.id !== notification.id),
        unreadCount: Math.max(0, prev.unreadCount - 1)
      }));
      
      // Cerramos el menú de notificaciones para que se note el cambio
      setIsOpen(false);
      
      // Actualizamos la lista de notificaciones después de unos segundos
      setTimeout(() => {
        fetchUserNotifications();
      }, 2000);
    } catch (error) {
      console.error('Error al marcar notificación como leída al seleccionarla:', error);
    }
  }, [fetchUserNotifications]);

  // Función para cerrar los detalles de la notificación
  const closeNotificationDetails = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedNotification: null
    }));
  }, []);
  
  // Función para marcar una notificación como leída
  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      // Actualizar la notificación a estado "LEIDA"
      await userNotificationsService.markAsRead(notificationId);
      
      // Actualizar el estado local
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.filter(n => n.id !== notificationId),
        unreadCount: Math.max(0, prev.unreadCount - 1)
      }));
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
    }
  }, []);

  // Cargar notificaciones al montar el componente
  useEffect(() => {
    fetchUserNotifications();
    
    // Configurar un intervalo para actualizar las notificaciones periódicamente
    const intervalId = setInterval(() => {
      fetchUserNotifications();
    }, 60000); // Actualizar cada minuto
    
    return () => clearInterval(intervalId);
  }, [fetchUserNotifications]);

  const toggleNotificationsMenu = () => {
    setIsOpen(prev => !prev);
    if (!isOpen) {
      fetchUserNotifications(); // Actualizamos al abrir
    }
  };

  return {
    ...state,
    isOpen,
    toggleNotificationsMenu,
    markAsRead,
    selectNotification,
    closeNotificationDetails,
    refreshNotifications: fetchUserNotifications
  };
}