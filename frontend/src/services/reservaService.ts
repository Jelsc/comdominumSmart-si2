import { api } from '@/lib/api';
import type {
  Reserva,
  AreaDisponible,
  ReservaRequest,
  ReservaAprobacionRequest,
  ReservaEstadisticas,
  FiltrosReserva,
  PaginacionReserva
} from '../types/reserva';

export class ReservaService {
  private baseUrl = '/api/reservas';

  // Obtener todas las reservas con filtros y paginación
  async getReservas(filtros?: FiltrosReserva): Promise<PaginacionReserva> {
    const params = new URLSearchParams();
    
    if (filtros?.estado) params.append('estado', filtros.estado);
    if (filtros?.tipo_reserva) params.append('tipo_reserva', filtros.tipo_reserva);
    if (filtros?.fecha_reserva) params.append('fecha_reserva', filtros.fecha_reserva);
    if (filtros?.fecha_reserva_desde) params.append('fecha_reserva__gte', filtros.fecha_reserva_desde);
    if (filtros?.fecha_reserva_hasta) params.append('fecha_reserva__lte', filtros.fecha_reserva_hasta);
    if (filtros?.area_comun) params.append('area_comun', filtros.area_comun.toString());
    if (filtros?.residente) params.append('residente', filtros.residente.toString());
    if (filtros?.search) params.append('search', filtros.search);

    const response = await api.get(`${this.baseUrl}/?${params.toString()}`);
    return response.data;
  }

  // Obtener una reserva específica
  async getReserva(id: number): Promise<Reserva> {
    const response = await api.get(`${this.baseUrl}/${id}/`);
    return response.data;
  }

  // Crear una nueva reserva
  async crearReserva(reserva: ReservaRequest): Promise<Reserva> {
    const response = await api.post(`${this.baseUrl}/`, reserva);
    return response.data;
  }

  // Actualizar una reserva
  async actualizarReserva(id: number, reserva: Partial<ReservaRequest>): Promise<Reserva> {
    const response = await api.put(`${this.baseUrl}/${id}/`, reserva);
    return response.data;
  }

  // Eliminar una reserva
  async eliminarReserva(id: number): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}/`);
  }

  // Obtener áreas disponibles para una fecha
  async getAreasDisponibles(fecha: string): Promise<AreaDisponible[]> {
    const response = await api.get(`${this.baseUrl}/disponibles/?fecha=${fecha}`);
    return response.data;
  }

  // Aprobar una reserva
  async aprobarReserva(id: number): Promise<Reserva> {
    const response = await api.post(`${this.baseUrl}/${id}/aprobar/`);
    return response.data;
  }

  // Rechazar una reserva
  async rechazarReserva(id: number, observaciones?: string): Promise<Reserva> {
    const data: ReservaAprobacionRequest = {
      accion: 'rechazar',
      ...(observaciones && { observaciones })
    };
    const response = await api.post(`${this.baseUrl}/${id}/rechazar/`, data);
    return response.data;
  }

  // Cancelar una reserva
  async cancelarReserva(id: number, motivo?: string): Promise<Reserva> {
    const response = await api.post(`${this.baseUrl}/${id}/cancelar/`, { motivo });
    return response.data;
  }

  // Completar una reserva
  async completarReserva(id: number): Promise<Reserva> {
    const response = await api.post(`${this.baseUrl}/${id}/completar/`);
    return response.data;
  }

  // Obtener próximas reservas
  async getProximasReservas(): Promise<Reserva[]> {
    const response = await api.get(`${this.baseUrl}/proximas/`);
    return response.data;
  }

  // Obtener estadísticas de reservas
  async getEstadisticas(): Promise<ReservaEstadisticas> {
    const response = await api.get(`${this.baseUrl}/estadisticas/`);
    return response.data;
  }

  // Obtener mis reservas (para residentes)
  async getMisReservas(): Promise<PaginacionReserva> {
    const response = await api.get(`${this.baseUrl}/mis_reservas/`);
    return response.data;
  }

  // Validar disponibilidad de horario
  async validarDisponibilidad(
    areaComunId: number,
    fecha: string,
    horaInicio: string,
    horaFin: string,
    reservaId?: number
  ): Promise<boolean> {
    try {
      const areas = await this.getAreasDisponibles(fecha);
      const area = areas.find(a => a.id === areaComunId);
      
      if (!area) return false;
      
      // Verificar si hay conflictos de horario
      const horarioInicio = horaInicio;
      const horarioFin = horaFin;
      
      for (const horarioOcupado of area.horarios_ocupados) {
        const [inicioOcupado, finOcupado] = horarioOcupado.split(' - ');
        
        // Verificar que ambos valores existen
        if (!inicioOcupado || !finOcupado) continue;
        
        // Verificar solapamiento
        if (horarioInicio < finOcupado && horarioFin > inicioOcupado) {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error validando disponibilidad:', error);
      return false;
    }
  }

  // Calcular costo de reserva
  calcularCosto(montoHora: number, horaInicio: string, horaFin: string): number {
    const inicio = new Date(`2000-01-01T${horaInicio}`);
    const fin = new Date(`2000-01-01T${horaFin}`);
    const duracionHoras = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
    return montoHora * duracionHoras;
  }

  // Obtener horarios disponibles para un área en una fecha
  async getHorariosDisponibles(areaComunId: number, fecha: string): Promise<string[]> {
    const areas = await this.getAreasDisponibles(fecha);
    const area = areas.find(a => a.id === areaComunId);
    
    if (!area) return [];
    
    // Generar horarios de 6:00 a 23:00 cada hora
    const horarios: string[] = [];
    for (let hora = 6; hora <= 23; hora++) {
      const horario = `${hora.toString().padStart(2, '0')}:00`;
      horarios.push(horario);
    }
    
    // Filtrar horarios ocupados
    const horariosDisponibles = horarios.filter(horario => {
      const hora = horario.split(':')[0];
      if (!hora) return false;
      
      const horarioFin = `${(parseInt(hora) + 1).toString().padStart(2, '0')}:00`;
      
      return !area.horarios_ocupados.some(ocupado => {
        const [inicioOcupado, finOcupado] = ocupado.split(' - ');
        
        // Verificar que ambos valores existen
        if (!inicioOcupado || !finOcupado) return false;
        
        return horario < finOcupado && horarioFin > inicioOcupado;
      });
    });
    
    return horariosDisponibles;
  }
}

// Instancia singleton del servicio
export const reservaService = new ReservaService();
