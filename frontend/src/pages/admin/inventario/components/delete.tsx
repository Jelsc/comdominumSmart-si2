import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Loader2, TriangleAlert } from "lucide-react";
import type { Inventario } from "@/types/inventario";
import type { InventarioApiResponse } from "@/services/inventario.api";

interface InventarioDeleteProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<InventarioApiResponse<null>>;
  item?: Inventario | null;
  loading?: boolean;
}

// Mapeo de estados a clases CSS para los badges
const estadoBadgeClasses: Record<string, string> = {
  ACTIVO: "bg-emerald-100 text-emerald-700 border-emerald-200",
  INACTIVO: "bg-gray-100 text-gray-600 border-gray-200",
  EN_REPARACION: "bg-amber-100 text-amber-700 border-amber-200",
  DADO_DE_BAJA: "bg-red-100 text-red-700 border-red-200",
};

export function InventarioDelete({
  open,
  onClose,
  onConfirm,
  item,
  loading = false,
}: InventarioDeleteProps) {
  const [error, setError] = useState<string | null>(null);

  if (!item) {
    return null;
  }

  const handleConfirm = async () => {
    setError(null);
    const response = await onConfirm();
    if (response.success) {
      onClose();
      return;
    }

    setError(response.error || "Error al eliminar el elemento");
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Eliminar elemento del inventario?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción eliminará permanentemente el elemento{" "}
            <span className="font-semibold text-foreground">{item.nombre}</span>{" "}
            del inventario.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">
          <div className="rounded-lg border p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Nombre:</span>
                <span className="font-medium">{item.nombre}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Categoría:</span>
                <span className="font-medium">{item.categoria}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estado:</span>
                <Badge
                  variant="outline"
                  className={estadoBadgeClasses[item.estado] || ""}
                >
                  {item.estado}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Valor estimado:
                </span>
                <span className="font-medium">
                  {typeof item.valor_estimado === 'number' 
                    ? new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(item.valor_estimado)
                    : new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(Number(item.valor_estimado) || 0)
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-600">
            <TriangleAlert className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" disabled={loading}>
              Cancelar
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              onClick={(e) => {
                e.preventDefault();
                handleConfirm();
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}