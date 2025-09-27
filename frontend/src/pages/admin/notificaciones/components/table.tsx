import React from "react";
import {
  Edit,
  Trash2,
  Send,
  X,
  Eye,
  Clock,
  Users,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import type { Notificacion } from "@/types";
import { notificacionesService } from "@/services";

interface NotificacionesTableProps {
  notificaciones: Notificacion[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onEdit: (notificacion: Notificacion) => void;
  onDelete: (notificacion: Notificacion) => void;
  onEnviar: (notificacion: Notificacion) => void;
  onCancelar: (notificacion: Notificacion) => void;
}

export function NotificacionesTable({
  notificaciones,
  loading,
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
  onEdit,
  onDelete,
  onEnviar,
  onCancelar,
}: NotificacionesTableProps) {
  const getEstadoBadge = (notificacion: Notificacion) => {
    const color = notificacion.estado_display.color;
    const variant =
      color === "green"
        ? "default"
        : color === "blue"
        ? "secondary"
        : color === "red"
        ? "destructive"
        : "outline";

    return (
      <Badge variant={variant} className="gap-1">
        {notificacion.estado === "programada" && <Clock className="h-3 w-3" />}
        {notificacion.estado === "enviada" && <Send className="h-3 w-3" />}
        {notificacion.estado === "cancelada" && <X className="h-3 w-3" />}
        {notificacion.estado_display.estado}
      </Badge>
    );
  };

  const getPrioridadBadge = (notificacion: Notificacion) => {
    const color = notificacionesService.getPrioridadColor(
      notificacion.prioridad
    );
    const variant =
      color === "red"
        ? "destructive"
        : color === "orange"
        ? "secondary"
        : color === "green"
        ? "default"
        : "outline";

    return (
      <Badge variant={variant} className="gap-1">
        {notificacion.prioridad === "urgente" && (
          <AlertTriangle className="h-3 w-3" />
        )}
        {notificacion.prioridad_display}
      </Badge>
    );
  };

  const canEnviar = (notificacion: Notificacion) => {
    return notificacion.estado === "programada";
  };

  const canCancelar = (notificacion: Notificacion) => {
    return notificacion.estado !== "enviada";
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (notificaciones.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Send className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No hay notificaciones</h3>
          <p className="text-muted-foreground mb-4">
            No se encontraron notificaciones que coincidan con los filtros
            aplicados.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Notificación</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Destinatarios</TableHead>
                <TableHead>Programada</TableHead>
                <TableHead>Creada por</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notificaciones.map((notificacion) => (
                <TableRow key={notificacion.id}>
                  {/* Nombre y descripción */}
                  <TableCell className="max-w-xs">
                    <div>
                      <div className="font-medium truncate">
                        {notificacion.nombre}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {notificacion.descripcion}
                      </div>
                    </div>
                  </TableCell>

                  {/* Tipo */}
                  <TableCell>
                    <Badge variant="outline">{notificacion.tipo_display}</Badge>
                  </TableCell>

                  {/* Estado */}
                  <TableCell>{getEstadoBadge(notificacion)}</TableCell>

                  {/* Prioridad */}
                  <TableCell>{getPrioridadBadge(notificacion)}</TableCell>

                  {/* Destinatarios */}
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {notificacion.total_destinatarios}
                      </span>
                      {notificacion.es_individual && (
                        <Badge variant="secondary" className="ml-1">
                          Individual
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  {/* Fecha programada */}
                  <TableCell>
                    <div className="text-sm">
                      {notificacionesService.formatFecha(
                        notificacion.fecha_programada
                      )}
                    </div>
                  </TableCell>

                  {/* Creado por */}
                  <TableCell>
                    <div className="text-sm">
                      {notificacion.creado_por_info?.nombre_completo ||
                        notificacion.creado_por_info?.username ||
                        "No disponible"}
                    </div>
                  </TableCell>

                  {/* Acciones */}
                  <TableCell className="text-right">
                    <TooltipProvider>
                      <div className="flex justify-end gap-1">
                        {/* Enviar */}
                        {canEnviar(notificacion) && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEnviar(notificacion)}
                                className="h-8 w-8 p-0"
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Enviar notificación</TooltipContent>
                          </Tooltip>
                        )}

                        {/* Cancelar */}
                        {canCancelar(notificacion) &&
                          notificacion.estado !== "cancelada" && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onCancelar(notificacion)}
                                  className="h-8 w-8 p-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                Cancelar notificación
                              </TooltipContent>
                            </Tooltip>
                          )}

                        {/* Editar */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(notificacion)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Editar notificación</TooltipContent>
                        </Tooltip>

                        {/* Eliminar */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDelete(notificacion)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Eliminar notificación</TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Mostrando {(currentPage - 1) * 10 + 1} a{" "}
              {Math.min(currentPage * 10, totalCount)} de {totalCount}{" "}
              notificaciones
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPageChange(page)}
                      className="w-8"
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="gap-1"
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
