import type {
  Notificacion,
  NotificacionFormData,
  NotificacionFilters,
  RolOption,
  NotificacionEstadisticas,
  PaginatedResponse,
  ApiResponse,
} from "@/types";
import { api } from "@/lib/api";

class NotificacionesService {
  private readonly baseUrl = "/api/notificaciones";

  /**
   * Obtiene todas las notificaciones con filtros y paginación
   */
  async getNotificaciones(
    filters?: NotificacionFilters & { page?: number; page_size?: number }
  ) {
    const params = new URLSearchParams();

    if (filters?.search) params.append("search", filters.search);
    if (filters?.tipo) params.append("tipo", filters.tipo);
    if (filters?.estado) params.append("estado", filters.estado);
    if (filters?.prioridad) params.append("prioridad", filters.prioridad);
    if (filters?.es_individual !== undefined)
      params.append("es_individual", filters.es_individual.toString());
    if (filters?.activa !== undefined)
      params.append("activa", filters.activa.toString());
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.page_size)
      params.append("page_size", filters.page_size.toString());

    const response = await api.get<PaginatedResponse<Notificacion>>(
      `${this.baseUrl}/notificaciones/?${params}`
    );
    return response.data;
  }

  /**
   * Obtiene una notificación por ID
   */
  async getNotificacion(id: number): Promise<Notificacion> {
    const response = await api.get<Notificacion>(
      `${this.baseUrl}/notificaciones/${id}/`
    );
    return response.data;
  }

  /**
   * Crea una nueva notificación
   */
  async createNotificacion(
    data: NotificacionFormData
  ): Promise<ApiResponse<Notificacion>> {
    try {
      const payload = {
        ...data,
        fecha_programada: data.fecha_programada
          ? data.fecha_programada.toISOString()
          : null,
        fecha_expiracion: data.fecha_expiracion
          ? data.fecha_expiracion.toISOString()
          : null,
      };

      const response = await api.post<Notificacion>(
        `${this.baseUrl}/notificaciones/`,
        payload
      );
      return {
        success: true,
        data: response.data,
        message: "Notificación creada exitosamente",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || "Error al crear la notificación",
        data: null,
      };
    }
  }

  /**
   * Actualiza una notificación existente
   */
  async updateNotificacion(
    id: number,
    data: Partial<NotificacionFormData>
  ): Promise<ApiResponse<Notificacion>> {
    try {
      const payload = {
        ...data,
        fecha_programada: data.fecha_programada
          ? data.fecha_programada.toISOString()
          : null,
        fecha_expiracion: data.fecha_expiracion
          ? data.fecha_expiracion.toISOString()
          : null,
      };

      const response = await api.patch<Notificacion>(
        `${this.baseUrl}/notificaciones/${id}/`,
        payload
      );
      return {
        success: true,
        data: response.data,
        message: "Notificación actualizada exitosamente",
      };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.detail || "Error al actualizar la notificación",
        data: null,
      };
    }
  }

  /**
   * Elimina una notificación
   */
  async deleteNotificacion(id: number): Promise<ApiResponse> {
    try {
      await api.delete(`${this.baseUrl}/notificaciones/${id}/`);
      return {
        success: true,
        message: "Notificación eliminada exitosamente",
      };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.detail || "Error al eliminar la notificación",
      };
    }
  }

  /**
   * Obtiene estadísticas de las notificaciones
   */
  async getEstadisticas(): Promise<NotificacionEstadisticas> {
    const response = await api.get<NotificacionEstadisticas>(
      `${this.baseUrl}/notificaciones/estadisticas/`
    );
    return response.data;
  }

  /**
   * Obtiene notificaciones programadas para hoy
   */
  async getNotificacionesHoy(): Promise<Notificacion[]> {
    const response = await api.get<Notificacion[]>(
      `${this.baseUrl}/notificaciones/programadas_hoy/`
    );
    return response.data;
  }

  /**
   * Envía una notificación (cambia estado a enviada)
   */
  async enviarNotificacion(id: number): Promise<ApiResponse> {
    try {
      await api.post(`${this.baseUrl}/notificaciones/${id}/enviar/`);
      return {
        success: true,
        message: "Notificación enviada exitosamente",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || "Error al enviar la notificación",
      };
    }
  }

  /**
   * Cancela una notificación
   */
  async cancelarNotificacion(id: number): Promise<ApiResponse> {
    try {
      await api.post(`${this.baseUrl}/notificaciones/${id}/cancelar/`);
      return {
        success: true,
        message: "Notificación cancelada exitosamente",
      };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.error || "Error al cancelar la notificación",
      };
    }
  }

  /**
   * Obtiene los roles disponibles para asignar a notificaciones
   */
  async getRolesDisponibles(): Promise<RolOption[]> {
    const response = await api.get<RolOption[]>(
      `${this.baseUrl}/notificaciones/roles_disponibles/`
    );
    return response.data;
  }

  /**
   * Obtiene los usuarios por rol para notificaciones individuales
   */
  async getUsuariosPorRol(rolesIds: number[]): Promise<
    {
      rol_id: number;
      rol_nombre: string;
      usuarios: Array<{
        id: number;
        first_name: string;
        last_name: string;
        email: string;
        nombre_completo: string;
      }>;
      total_usuarios: number;
    }[]
  > {
    const params = new URLSearchParams();
    rolesIds.forEach((id) => params.append("roles[]", id.toString()));

    const response = await api.get(
      `${this.baseUrl}/notificaciones/usuarios_por_rol/?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Opciones para los selects del frontend
   */
  getTipoOptions() {
    return [
      { value: "general", label: "General" },
      { value: "mantenimiento", label: "Mantenimiento" },
      { value: "reunion", label: "Reunión" },
      { value: "aviso", label: "Aviso" },
      { value: "emergencia", label: "Emergencia" },
      { value: "pagos", label: "Pagos" },
      { value: "evento", label: "Evento" },
    ];
  }

  getEstadoOptions() {
    return [
      { value: "borrador", label: "Borrador", color: "gray" },
      { value: "programada", label: "Programada", color: "blue" },
      { value: "enviada", label: "Enviada", color: "green" },
      { value: "cancelada", label: "Cancelada", color: "red" },
    ];
  }

  getPrioridadOptions() {
    return [
      { value: "baja", label: "Baja", color: "green" },
      { value: "normal", label: "Normal", color: "blue" },
      { value: "alta", label: "Alta", color: "orange" },
      { value: "urgente", label: "Urgente", color: "red" },
    ];
  }

  /**
   * Utilidad para formatear fechas
   */
  formatFecha(fecha: string | null): string {
    if (!fecha) return "No programada";
    return new Date(fecha).toLocaleString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /**
   * Utilidad para obtener el color del estado
   */
  getEstadoColor(estado: string): string {
    const colores = {
      borrador: "gray",
      programada: "blue",
      enviada: "green",
      cancelada: "red",
    };
    return colores[estado as keyof typeof colores] || "gray";
  }

  /**
   * Utilidad para obtener el color de la prioridad
   */
  getPrioridadColor(prioridad: string): string {
    const colores = {
      baja: "green",
      normal: "blue",
      alta: "orange",
      urgente: "red",
    };
    return colores[prioridad as keyof typeof colores] || "blue";
  }
}

export const notificacionesService = new NotificacionesService();
