import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
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
import type { Unidad } from "@/types";

interface DeleteProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => Promise<void>;
  unidad: Unidad | null;
}

export default function Delete({ open, onClose, onDelete, unidad }: DeleteProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!unidad) return;
    
    setLoading(true);
    try {
      await onDelete();
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Está seguro de eliminar esta unidad habitacional?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {unidad ? (
              <>
                Esta acción no se puede deshacer. Se eliminará permanentemente 
                la unidad <strong>{unidad.codigo}</strong> ubicada en{" "}
                <strong>{unidad.direccion}</strong>.
                {unidad.estado === "OCUPADA" && (
                  <div className="mt-2 text-destructive">
                    ⚠️ Esta unidad está actualmente ocupada. Eliminarla podría causar inconsistencias
                    en los datos relacionados.
                  </div>
                )}
              </>
            ) : (
              "Esta acción no se puede deshacer. Se eliminará permanentemente la unidad seleccionada."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Eliminando..." : "Eliminar"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}