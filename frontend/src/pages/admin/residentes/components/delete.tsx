import React from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, Home, User } from 'lucide-react';
import type { Residente } from '@/types';

interface ResidenteDeleteProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<boolean>;
  residente: Residente | null;
  loading?: boolean;
}

export function ResidenteDelete({ 
  isOpen, 
  onClose, 
  onConfirm, 
  residente, 
  loading = false 
}: ResidenteDeleteProps) {
  if (!residente) return null;

  const handleConfirm = async () => {
    const success = await onConfirm();
    if (success) {
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusBadge = (estado: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'activo': 'default',
      'inactivo': 'secondary',
      'suspendido': 'destructive',
      'en_proceso': 'outline',
    };

    const labels: Record<string, string> = {
      'activo': 'Activo',
      'inactivo': 'Inactivo',
      'suspendido': 'Suspendido',
      'en_proceso': 'En Proceso',
    };

    return (
      <Badge variant={variants[estado] || 'outline'}>
        {labels[estado] || estado}
      </Badge>
    );
  };

  const getTipoBadge = (tipo: string) => {
    const variants: Record<string, "default" | "secondary"> = {
      'propietario': 'default',
      'inquilino': 'secondary',
    };

    const labels: Record<string, string> = {
      'propietario': 'Propietario',
      'inquilino': 'Inquilino',
    };

    return (
      <Badge variant={variants[tipo] || 'outline'}>
        {labels[tipo] || tipo}
      </Badge>
    );
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Confirmar Eliminación de Residente
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                ¿Estás seguro de que deseas eliminar este residente? 
                Esta acción no se puede deshacer y afectará todas las operaciones asociadas.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="font-medium text-gray-900 flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Información del Residente:
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium">Nombre:</span>
                    <div>{residente.nombre} {residente.apellido}</div>
                  </div>
                  <div>
                    <span className="font-medium">Email:</span>
                    <div>{residente.email}</div>
                  </div>
                  <div>
                    <span className="font-medium">Teléfono:</span>
                    <div>{residente.telefono}</div>
                  </div>
                  <div>
                    <span className="font-medium">CI:</span>
                    <div className="font-mono">{residente.ci}</div>
                  </div>
                  <div>
                    <span className="font-medium">Unidad Habitacional:</span>
                    <div className="font-mono">{residente.unidad_habitacional}</div>
                  </div>
                  <div>
                    <span className="font-medium">Tipo:</span>
                    <div>{getTipoBadge(residente.tipo)}</div>
                  </div>
                  <div>
                    <span className="font-medium">Fecha de Ingreso:</span>
                    <div>{formatDate(residente.fecha_ingreso)}</div>
                  </div>
                  <div>
                    <span className="font-medium">Estado:</span>
                    <div>{getStatusBadge(residente.estado)}</div>
                  </div>
                  <div>
                    <span className="font-medium">Usuario:</span>
                    <div>
                      {residente.usuario && residente.username ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <User className="h-3 w-3 mr-1" />
                          {residente.username}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">
                          Sin usuario
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                <div className="text-red-800 text-sm">
                  <strong>Advertencia:</strong> Al eliminar este residente, se perderá 
                  toda la información asociada incluyendo historial de acceso, 
                  permisos y no podrá ser recuperada.
                </div>
              </div>

              {residente.estado === 'activo' && (
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                  <div className="text-yellow-800 text-sm">
                    <strong>Nota:</strong> Este residente está actualmente activo. 
                    Asegúrate de que no tenga accesos pendientes antes de eliminarlo.
                  </div>
                </div>
              )}

              {residente.usuario && (
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                  <div className="text-blue-800 text-sm">
                    <strong>Importante:</strong> Este residente tiene un usuario asociado. 
                    La eliminación del residente no afectará la cuenta de usuario.
                  </div>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Eliminar Residente
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
