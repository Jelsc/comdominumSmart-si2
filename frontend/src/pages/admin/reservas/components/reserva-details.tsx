import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Calendar, 
  Clock, 
  Users, 
  DollarSign, 
  MapPin, 
  User, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Reserva } from '@/types/reserva';
import { 
  formatearFecha, 
  formatearHora, 
  formatearCosto, 
  formatearDuracion,
  obtenerColorEstado,
  obtenerTextoEstado,
  obtenerTextoTipo
} from '@/types/reserva';

interface ReservaDetailsProps {
  reserva: Reserva;
  onClose: () => void;
  onAprobar: (id: number) => void;
  onRechazar: (id: number, observaciones?: string) => void;
  onCancelar: (id: number, motivo?: string) => void;
  onCompletar: (id: number) => void;
}

const ReservaDetails: React.FC<ReservaDetailsProps> = ({
  reserva,
  onClose,
  onAprobar,
  onRechazar,
  onCancelar,
  onCompletar
}) => {
  const [observaciones, setObservaciones] = useState('');
  const [motivo, setMotivo] = useState('');
  const [showObservaciones, setShowObservaciones] = useState(false);
  const [showMotivo, setShowMotivo] = useState(false);

  const handleAprobar = () => {
    onAprobar(reserva.id);
    onClose();
  };

  const handleRechazar = () => {
    onRechazar(reserva.id, observaciones);
    setObservaciones('');
    setShowObservaciones(false);
    onClose();
  };

  const handleCancelar = () => {
    onCancelar(reserva.id, motivo);
    setMotivo('');
    setShowMotivo(false);
    onClose();
  };

  const handleCompletar = () => {
    onCompletar(reserva.id);
    onClose();
  };

  const canApprove = reserva.estado === 'PENDIENTE';
  const canReject = reserva.estado === 'PENDIENTE';
  const canCancel = reserva.estado === 'PENDIENTE' || reserva.estado === 'CONFIRMADA';
  const canComplete = reserva.estado === 'CONFIRMADA';

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Detalles de la Reserva #{reserva.id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header con estado */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">
                {reserva.area_comun_info?.nombre || 'Área no disponible'}
              </h2>
              <p className="text-muted-foreground">
                {formatearFecha(reserva.fecha_reserva)} • {formatearHora(reserva.hora_inicio)} - {formatearHora(reserva.hora_fin)}
              </p>
            </div>
            <Badge 
              variant="outline" 
              className={cn(
                "text-sm px-3 py-1",
                obtenerColorEstado(reserva.estado) === 'green' && "bg-green-100 text-green-800 border-green-200",
                obtenerColorEstado(reserva.estado) === 'red' && "bg-red-100 text-red-800 border-red-200",
                obtenerColorEstado(reserva.estado) === 'orange' && "bg-orange-100 text-orange-800 border-orange-200",
                obtenerColorEstado(reserva.estado) === 'blue' && "bg-blue-100 text-blue-800 border-blue-200"
              )}
            >
              {obtenerTextoEstado(reserva.estado)}
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información de la Reserva */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Información de la Reserva
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Fecha</Label>
                    <p className="font-medium">{formatearFecha(reserva.fecha_reserva)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Horario</Label>
                    <p className="font-medium">
                      {formatearHora(reserva.hora_inicio)} - {formatearHora(reserva.hora_fin)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Duración</Label>
                    <p className="font-medium">{formatearDuracion(reserva.duracion_horas)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Tipo</Label>
                    <p className="font-medium">{obtenerTextoTipo(reserva.tipo_reserva)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Personas</Label>
                    <p className="font-medium">{reserva.numero_personas}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Costo</Label>
                    <p className="font-medium text-lg text-green-600">
                      {formatearCosto(reserva.costo_total)}
                    </p>
                  </div>
                </div>

                {reserva.motivo && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Motivo</Label>
                    <p className="mt-1 p-3 bg-muted rounded-md">{reserva.motivo}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Información del Residente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información del Residente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Nombre</Label>
                  <p className="font-medium">{reserva.residente_info?.nombre_completo || 'No disponible'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                    <p className="text-sm">{reserva.residente_info?.email || 'No disponible'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Teléfono</Label>
                    <p className="text-sm">{reserva.residente_info?.telefono || 'No disponible'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Unidad</Label>
                    <p className="text-sm">{reserva.residente_info?.unidad_habitacional || 'No disponible'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Tipo</Label>
                    <p className="text-sm capitalize">{reserva.residente_info?.tipo || 'No disponible'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información del Área */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Información del Área
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Nombre</Label>
                  <p className="font-medium">{reserva.area_comun_info?.nombre || 'No disponible'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Costo por Hora</Label>
                    <p className="font-medium">{formatearCosto(reserva.area_comun_info?.monto_hora || 0)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Estado</Label>
                    <p className="text-sm capitalize">{reserva.area_comun_info?.estado || 'No disponible'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información Administrativa */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Información Administrativa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Creada</Label>
                    <p className="text-sm">{formatearFecha(reserva.fecha_creacion)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Actualizada</Label>
                    <p className="text-sm">{formatearFecha(reserva.fecha_actualizacion)}</p>
                  </div>
                </div>

                {reserva.administrador_nombre && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Administrador</Label>
                    <p className="text-sm">{reserva.administrador_nombre}</p>
                  </div>
                )}

                {reserva.fecha_aprobacion && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Fecha de Aprobación</Label>
                    <p className="text-sm">{formatearFecha(reserva.fecha_aprobacion)}</p>
                  </div>
                )}

                {reserva.observaciones_admin && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Observaciones</Label>
                    <p className="mt-1 p-3 bg-muted rounded-md text-sm">
                      {reserva.observaciones_admin}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Acciones */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {canApprove && (
                  <Button
                    onClick={handleAprobar}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aprobar
                  </Button>
                )}

                {canReject && (
                  <Button
                    variant="destructive"
                    onClick={() => setShowObservaciones(true)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rechazar
                  </Button>
                )}

                {canComplete && (
                  <Button
                    onClick={handleCompletar}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Completar
                  </Button>
                )}

                {canCancel && (
                  <Button
                    variant="destructive"
                    onClick={() => setShowMotivo(true)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                )}

                <Button variant="outline" onClick={onClose}>
                  Cerrar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modal para observaciones de rechazo */}
        {showObservaciones && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Rechazar Reserva</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="observaciones">Observaciones (Opcional)</Label>
                  <Textarea
                    id="observaciones"
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Motivo del rechazo..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowObservaciones(false)}>
                    Cancelar
                  </Button>
                  <Button variant="destructive" onClick={handleRechazar}>
                    Rechazar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modal para motivo de cancelación */}
        {showMotivo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Cancelar Reserva</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="motivo">Motivo de Cancelación (Opcional)</Label>
                  <Textarea
                    id="motivo"
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    placeholder="Motivo de la cancelación..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowMotivo(false)}>
                    Cancelar
                  </Button>
                  <Button variant="destructive" onClick={handleCancelar}>
                    Cancelar Reserva
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReservaDetails;
