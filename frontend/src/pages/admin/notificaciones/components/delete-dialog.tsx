import React from "react";
import { Trash2, AlertTriangle } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

import type { Notificacion } from "@/types";

interface NotificacionDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notificacion: Notificacion | null;
  onConfirm: () => void;
  loading?: boolean;
}

export function NotificacionDeleteDialog({
  open,
  onOpenChange,
  notificacion,
  onConfirm,
  loading = false,
}: NotificacionDeleteDialogProps) {
  if (!notificacion) {
    return null;
  }

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
        {notificacion.estado_display.estado}
      </Badge>
    );
  };

  const canDelete = () => {
    return notificacion.estado !== "enviada";
  };

  const getDeleteMessage = () => {
    if (!canDelete()) {
      return {
        title: "No se puede eliminar esta notificación",
        description:
          "Las notificaciones ya enviadas no pueden ser eliminadas. Solo pueden ser canceladas.",
        showCancel: false,
      };
    }

    return {
      title: "¿Estás seguro de eliminar esta notificación?",
      description:
        "Esta acción no se puede deshacer. La notificación será eliminada permanentemente.",
      showCancel: true,
    };
  };

  const message = getDeleteMessage();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {canDelete() ? (
              <Trash2 className="h-5 w-5 text-destructive" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            )}
            {message.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>{message.description}</p>

            {/* Información de la notificación */}
            <div className="border rounded-lg p-3 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-foreground">
                    {notificacion.nombre}
                  </h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {notificacion.descripcion}
                  </p>
                </div>
                {getEstadoBadge(notificacion)}
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span>
                    <strong>Tipo:</strong> {notificacion.tipo_display}
                  </span>
                  <span>
                    <strong>Prioridad:</strong> {notificacion.prioridad_display}
                  </span>
                </div>
                <span>
                  <strong>Destinatarios:</strong>{" "}
                  {notificacion.total_destinatarios}
                </span>
              </div>
            </div>

            {/* Advertencia adicional para notificaciones programadas */}
            {notificacion.estado === "programada" && canDelete() && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">
                    Notificación programada
                  </p>
                  <p className="text-yellow-700">
                    Esta notificación está programada para enviarse
                    automáticamente. Al eliminarla, no se enviará a los
                    destinatarios.
                  </p>
                </div>
              </div>
            )}

            {/* Información sobre roles destinatarios */}
            {notificacion.roles_destinatarios_info.length > 0 &&
              canDelete() && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    Roles afectados:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {notificacion.roles_destinatarios_info.map((rol) => (
                      <Badge
                        key={rol.id}
                        variant="secondary"
                        className="text-xs"
                      >
                        {rol.nombre} ({rol.total_usuarios} usuarios)
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            {canDelete() ? "Cancelar" : "Entendido"}
          </AlertDialogCancel>

          {message.showCancel && canDelete() && (
            <AlertDialogAction
              onClick={onConfirm}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? "Eliminando..." : "Eliminar notificación"}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
