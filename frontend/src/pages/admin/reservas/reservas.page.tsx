import React, { useState, useEffect } from 'react';
import AdminLayout from '@/app/layout/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Search, Filter, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { reservaService } from '@/services/reservaService';
import type { Reserva, FiltrosReserva, EstadoReserva, TipoReserva } from '@/types/reserva';
import { 
  ESTADOS_RESERVA, 
  TIPOS_RESERVA, 
  COLORES_ESTADO,
  formatearFecha, 
  formatearHora, 
  formatearCosto,
  obtenerColorEstado,
  obtenerTextoEstado,
  obtenerTextoTipo
} from '@/types/reserva';
import { toast } from 'sonner';
import { ReservaForm, ReservaDetails, ReservaFilters, ReservaStats } from './components';

const ReservasPage: React.FC = () => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<FiltrosReserva>({});
  const [paginacion, setPaginacion] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const itemsPerPage = 10;

  // Cargar reservas
  const cargarReservas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await reservaService.getReservas({
        ...filtros,
        ...(searchTerm && { search: searchTerm })
      });
      
      setReservas(response.results);
      setPaginacion({
        count: response.count,
        next: response.next,
        previous: response.previous
      });
    } catch (err) {
      setError('Error al cargar las reservas');
      toast.error('Error al cargar las reservas');
      console.error('Error cargando reservas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReservas();
  }, [filtros, searchTerm]);

  // Manejar filtros
  const handleFiltrosChange = (nuevosFiltros: Partial<FiltrosReserva>) => {
    setFiltros(prev => ({ ...prev, ...nuevosFiltros }));
    setCurrentPage(1);
  };

  // Manejar búsqueda
  const handleSearch = (termino: string) => {
    setSearchTerm(termino);
    setCurrentPage(1);
  };

  // Manejar acciones de reserva
  const handleAprobar = async (id: number) => {
    try {
      await reservaService.aprobarReserva(id);
      toast.success('Reserva aprobada');
      cargarReservas();
    } catch (err) {
      toast.error('Error al aprobar la reserva');
      console.error('Error aprobando reserva:', err);
    }
  };

  const handleRechazar = async (id: number, observaciones?: string) => {
    try {
      await reservaService.rechazarReserva(id, observaciones);
      toast.success('Reserva rechazada');
      cargarReservas();
    } catch (err) {
      toast.error('Error al rechazar la reserva');
      console.error('Error rechazando reserva:', err);
    }
  };

  const handleCancelar = async (id: number, motivo?: string) => {
    try {
      await reservaService.cancelarReserva(id, motivo);
      toast.success('Reserva cancelada');
      cargarReservas();
    } catch (err) {
      toast.error('Error al cancelar la reserva');
      console.error('Error cancelando reserva:', err);
    }
  };

  const handleCompletar = async (id: number) => {
    try {
      await reservaService.completarReserva(id);
      toast.success('Reserva completada');
      cargarReservas();
    } catch (err) {
      toast.error('Error al completar la reserva');
      console.error('Error completando reserva:', err);
    }
  };

  // Abrir formulario de nueva reserva
  const handleNuevaReserva = () => {
    setSelectedReserva(null);
    setShowForm(true);
  };

  // Abrir detalles de reserva
  const handleVerDetalles = (reserva: Reserva) => {
    setSelectedReserva(reserva);
    setShowDetails(true);
  };

  // Cerrar modales
  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedReserva(null);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedReserva(null);
  };

  // Guardar reserva
  const handleSaveReserva = async (reservaData: any) => {
    try {
      if (selectedReserva) {
        await reservaService.actualizarReserva(selectedReserva.id, reservaData);
        toast.success('Reserva actualizada');
      } else {
        await reservaService.crearReserva(reservaData);
        toast.success('Reserva creada');
      }
      cargarReservas();
      handleCloseForm();
    } catch (err) {
      toast.error('Error al guardar la reserva');
      console.error('Error guardando reserva:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando reservas...</span>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Reservas</h1>
          <p className="text-muted-foreground">
            Administra las reservas de áreas comunes
          </p>
        </div>
        <Button onClick={handleNuevaReserva} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nueva Reserva
        </Button>
      </div>

      {/* Estadísticas */}
      <ReservaStats />

      {/* Filtros */}
      <ReservaFilters
        filtros={filtros}
        onFiltrosChange={handleFiltrosChange}
        onSearch={handleSearch}
        onRefresh={cargarReservas}
      />

      {/* Lista de reservas */}
      <Card>
        <CardHeader>
          <CardTitle>Reservas ({paginacion.count})</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <p className="text-destructive">{error}</p>
              <Button onClick={cargarReservas} variant="outline" className="mt-4">
                Reintentar
              </Button>
            </div>
          ) : reservas.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay reservas disponibles</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reservas.map((reserva) => (
                <Card key={reserva.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {reserva.area_comun_info?.nombre || 'Área no disponible'}
                        </h3>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            obtenerColorEstado(reserva.estado) === 'green' && "bg-green-100 text-green-800 border-green-200",
                            obtenerColorEstado(reserva.estado) === 'red' && "bg-red-100 text-red-800 border-red-200",
                            obtenerColorEstado(reserva.estado) === 'orange' && "bg-orange-100 text-orange-800 border-orange-200",
                            obtenerColorEstado(reserva.estado) === 'blue' && "bg-blue-100 text-blue-800 border-blue-200"
                          )}
                        >
                          {obtenerTextoEstado(reserva.estado)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Fecha:</span> {formatearFecha(reserva.fecha_reserva)}
                        </div>
                        <div>
                          <span className="font-medium">Horario:</span> {formatearHora(reserva.hora_inicio)} - {formatearHora(reserva.hora_fin)}
                        </div>
                        <div>
                          <span className="font-medium">Tipo:</span> {obtenerTextoTipo(reserva.tipo_reserva)}
                        </div>
                        <div>
                          <span className="font-medium">Costo:</span> {formatearCosto(reserva.costo_total)}
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Residente:</span> {reserva.residente_info?.nombre_completo || 'No disponible'}
                      </div>

                      {reserva.motivo && (
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Motivo:</span> {reserva.motivo}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerDetalles(reserva)}
                      >
                        Ver Detalles
                      </Button>
                      
                      {reserva.estado === 'PENDIENTE' && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleAprobar(reserva.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Aprobar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRechazar(reserva.id)}
                          >
                            Rechazar
                          </Button>
                        </>
                      )}

                      {reserva.estado === 'CONFIRMADA' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCompletar(reserva.id)}
                          className="text-blue-600 border-blue-600 hover:bg-blue-50"
                        >
                          Completar
                        </Button>
                      )}

                      {(reserva.estado === 'PENDIENTE' || reserva.estado === 'CONFIRMADA') && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancelar(reserva.id)}
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modales */}
      {showForm && (
        <ReservaForm
          reserva={selectedReserva}
          onSave={handleSaveReserva}
          onClose={handleCloseForm}
        />
      )}

      {showDetails && selectedReserva && (
        <ReservaDetails
          reserva={selectedReserva}
          onClose={handleCloseDetails}
          onAprobar={handleAprobar}
          onRechazar={handleRechazar}
          onCancelar={handleCancelar}
          onCompletar={handleCompletar}
        />
      )}
      </div>
    </AdminLayout>
  );
};

export default ReservasPage;
