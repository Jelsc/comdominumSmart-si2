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
import type { AreaComun } from "@/types/areas-comunes";
import type { AreasComunesApiResponse } from "@/services/areas-comunes.api";

interface AreaComunDeleteProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<AreasComunesApiResponse<null>>;
  area?: AreaComun | null;
  loading?: boolean;
}

const estadoBadgeClasses: Record<string, string> = {
  ACTIVO: "bg-emerald-100 text-emerald-700 border-emerald-200",
  INACTIVO: "bg-gray-100 text-gray-600 border-gray-200",
  MANTENIMIENTO: "bg-amber-100 text-amber-700 border-amber-200",
};

export function AreaComunDelete({
  open,
  onClose,
  onConfirm,
  area,
  loading = false,
}: AreaComunDeleteProps) {
  const [error, setError] = useState<string | null>(null);

  if (!area) {
    return null;
  }

  const handleConfirm = async () => {
    setError(null);
    const response = await onConfirm();
    if (response.success) {
      onClose();
      return;
    }

    if (typeof response.errors === "string") {
      setError(response.errors);
    } else if (response.error) {
      setError(response.error);
    } else if (response.errors && typeof response.errors === "object") {
      const messages = Object.values(response.errors)
        .flat()
        .map((value) => (Array.isArray(value) ? value.join(" ") : String(value)));
      setError(messages.join(" ") || "No se pudo eliminar el registro.");
    } else {
      setError("No se pudo eliminar el registro.");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(value) => !value && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <TriangleAlert className="h-5 w-5 text-destructive" />
            Eliminar área común
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente el
            área común <strong>{area.nombre}</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-md border bg-muted/40 p-4 text-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">{area.nombre}</p>
              <p className="text-muted-foreground">
                Monto por hora: <span className="font-semibold">{area.monto_hora}</span>
              </p>
            </div>
            <Badge className={estadoBadgeClasses[area.estado] ?? ""} variant="outline">
              {area.estado}
            </Badge>
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" disabled={loading}>
              Cancelar
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={handleConfirm} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default AreaComunDelete;
