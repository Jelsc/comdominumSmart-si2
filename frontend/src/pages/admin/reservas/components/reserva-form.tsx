import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, Users, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { reservaService } from '@/services/reservaService';
import type { Reserva, ReservaRequest, AreaDisponible, TipoReserva } from '@/types/reserva';
import { TIPOS_RESERVA, formatearCosto } from '@/types/reserva';
import { toast } from 'sonner';

interface ReservaFormProps {
  reserva?: Reserva | null;
  onSave: (reserva: ReservaRequest) => void;
  onClose: () => void;
}

const ReservaForm: React.FC<ReservaFormProps> = ({
  reserva,
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState<ReservaRequest>({
    area_comun: 0,
    fecha_reserva: '',
    hora_inicio: '',
    hora_fin: '',
    tipo_reserva: 'PARTICULAR',
    motivo: '',
    numero_personas: 1
  });

  const [areas, setAreas] = useState<AreaDisponible[]>([]);
  const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [costoCalculado, setCostoCalculado] = useState(0);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | undefined>();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!reserva;

  useEffect(() => {
    if (reserva) {
      setFormData({
        area_comun: reserva.area_comun,
        fecha_reserva: reserva.fecha_reserva,
        hora_inicio: reserva.hora_inicio,
        hora_fin: reserva.hora_fin,
        tipo_reserva: reserva.tipo_reserva,
        motivo: reserva.motivo || '',
        numero_personas: reserva.numero_personas
      });
      setFechaSeleccionada(new Date(reserva.fecha_reserva));
    }
  }, [reserva]);

  useEffect(() => {
    if (formData.fecha_reserva) {
      cargarAreasDisponibles();
    }
  }, [formData.fecha_reserva]);

  useEffect(() => {
    if (formData.area_comun && formData.fecha_reserva) {
      cargarHorariosDisponibles();
    }
  }, [formData.area_comun, formData.fecha_reserva]);

  useEffect(() => {
    if (formData.area_comun && formData.hora_inicio && formData.hora_fin) {
      calcularCosto();
    }
  }, [formData.area_comun, formData.hora_inicio, formData.hora_fin]);

  const cargarAreasDisponibles = async () => {
    try {
      setLoading(true);
      const areasDisponibles = await reservaService.getAreasDisponibles(formData.fecha_reserva);
      setAreas(areasDisponibles);
    } catch (error) {
      toast.error('Error al cargar áreas disponibles');
      console.error('Error cargando áreas:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarHorariosDisponibles = async () => {
    try {
      const horarios = await reservaService.getHorariosDisponibles(
        formData.area_comun,
        formData.fecha_reserva
      );
      setHorariosDisponibles(horarios);
    } catch (error) {
      console.error('Error cargando horarios:', error);
    }
  };

  const calcularCosto = () => {
    const area = areas.find(a => a.id === formData.area_comun);
    if (area) {
      const costo = reservaService.calcularCosto(
        area.monto_hora,
        formData.hora_inicio,
        formData.hora_fin
      );
      setCostoCalculado(costo);
    }
  };

  const handleFechaChange = (fecha: Date | undefined) => {
    setFechaSeleccionada(fecha);
    if (fecha) {
      const fechaStr = format(fecha, 'yyyy-MM-dd');
      setFormData(prev => ({ ...prev, fecha_reserva: fechaStr }));
      setErrors(prev => ({ ...prev, fecha_reserva: '' }));
    }
  };

  const handleAreaChange = (areaId: string) => {
    const areaIdNum = parseInt(areaId);
    setFormData(prev => ({ ...prev, area_comun: areaIdNum }));
    setErrors(prev => ({ ...prev, area_comun: '' }));
  };

  const handleHoraInicioChange = (hora: string) => {
    setFormData(prev => ({ ...prev, hora_inicio: hora }));
    setErrors(prev => ({ ...prev, hora_inicio: '' }));
  };

  const handleHoraFinChange = (hora: string) => {
    setFormData(prev => ({ ...prev, hora_fin: hora }));
    setErrors(prev => ({ ...prev, hora_fin: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fecha_reserva) {
      newErrors.fecha_reserva = 'La fecha es requerida';
    }

    if (!formData.area_comun) {
      newErrors.area_comun = 'El área es requerida';
    }

    if (!formData.hora_inicio) {
      newErrors.hora_inicio = 'La hora de inicio es requerida';
    }

    if (!formData.hora_fin) {
      newErrors.hora_fin = 'La hora de fin es requerida';
    }

    if (formData.hora_inicio && formData.hora_fin && formData.hora_inicio >= formData.hora_fin) {
      newErrors.hora_fin = 'La hora de fin debe ser posterior a la hora de inicio';
    }

    if (formData.numero_personas < 1) {
      newErrors.numero_personas = 'El número de personas debe ser al menos 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Validar disponibilidad
      const disponible = await reservaService.validarDisponibilidad(
        formData.area_comun,
        formData.fecha_reserva,
        formData.hora_inicio,
        formData.hora_fin,
        reserva?.id
      );

      if (!disponible) {
        toast.error('El horario seleccionado no está disponible');
        return;
      }

      onSave(formData);
    } catch (error) {
      toast.error('Error al validar disponibilidad');
      console.error('Error validando disponibilidad:', error);
    }
  };

  const areaSeleccionada = areas.find(a => a.id === formData.area_comun);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Reserva' : 'Nueva Reserva'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Fecha */}
          <div>
            <Label htmlFor="fecha">Fecha de Reserva *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal mt-1",
                    !fechaSeleccionada && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fechaSeleccionada ? format(fechaSeleccionada, "dd/MM/yyyy", { locale: es }) : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fechaSeleccionada}
                  onSelect={handleFechaChange}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.fecha_reserva && (
              <p className="text-sm text-destructive mt-1">{errors.fecha_reserva}</p>
            )}
          </div>

          {/* Área Común */}
          <div>
            <Label htmlFor="area">Área Común *</Label>
            <Select
              value={formData.area_comun.toString()}
              onValueChange={handleAreaChange}
              disabled={loading}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Seleccionar área" />
              </SelectTrigger>
              <SelectContent>
                {areas.map((area) => (
                  <SelectItem key={area.id} value={area.id.toString()}>
                    <div className="flex justify-between items-center w-full">
                      <span>{area.nombre}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {formatearCosto(area.monto_hora)}/hora
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.area_comun && (
              <p className="text-sm text-destructive mt-1">{errors.area_comun}</p>
            )}
          </div>

          {/* Horarios */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hora_inicio">Hora de Inicio *</Label>
              <Select
                value={formData.hora_inicio}
                onValueChange={handleHoraInicioChange}
                disabled={!formData.area_comun || !formData.fecha_reserva}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccionar hora" />
                </SelectTrigger>
                <SelectContent>
                  {horariosDisponibles.map((hora) => (
                    <SelectItem key={hora} value={hora}>
                      {hora}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.hora_inicio && (
                <p className="text-sm text-destructive mt-1">{errors.hora_inicio}</p>
              )}
            </div>

            <div>
              <Label htmlFor="hora_fin">Hora de Fin *</Label>
              <Select
                value={formData.hora_fin}
                onValueChange={handleHoraFinChange}
                disabled={!formData.hora_inicio}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccionar hora" />
                </SelectTrigger>
                <SelectContent>
                  {horariosDisponibles
                    .filter(hora => !formData.hora_inicio || hora > formData.hora_inicio)
                    .map((hora) => (
                      <SelectItem key={hora} value={hora}>
                        {hora}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.hora_fin && (
                <p className="text-sm text-destructive mt-1">{errors.hora_fin}</p>
              )}
            </div>
          </div>

          {/* Tipo de Reserva */}
          <div>
            <Label htmlFor="tipo">Tipo de Reserva</Label>
            <Select
              value={formData.tipo_reserva}
              onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_reserva: value as TipoReserva }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TIPOS_RESERVA).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Número de Personas */}
          <div>
            <Label htmlFor="personas">Número de Personas *</Label>
            <Input
              id="personas"
              type="number"
              min="1"
              value={formData.numero_personas}
              onChange={(e) => setFormData(prev => ({ ...prev, numero_personas: parseInt(e.target.value) || 1 }))}
              className="mt-1"
            />
            {errors.numero_personas && (
              <p className="text-sm text-destructive mt-1">{errors.numero_personas}</p>
            )}
          </div>

          {/* Motivo */}
          <div>
            <Label htmlFor="motivo">Motivo (Opcional)</Label>
            <Textarea
              id="motivo"
              value={formData.motivo}
              onChange={(e) => setFormData(prev => ({ ...prev, motivo: e.target.value }))}
              placeholder="Describe el motivo de la reserva..."
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Costo Calculado */}
          {costoCalculado > 0 && (
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <DollarSign className="h-5 w-5" />
                Costo Total: {formatearCosto(costoCalculado)}
              </div>
              {areaSeleccionada && (
                <p className="text-sm text-muted-foreground mt-1">
                  {formatearCosto(areaSeleccionada.monto_hora)}/hora × {formData.hora_inicio} - {formData.hora_fin}
                </p>
              )}
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {isEditing ? 'Actualizar' : 'Crear'} Reserva
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReservaForm;
