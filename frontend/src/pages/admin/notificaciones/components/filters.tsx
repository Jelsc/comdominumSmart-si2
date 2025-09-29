import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface NotificacionesFiltersProps {
  estadoFilter: string;
  tipoFilter: string;
  onEstadoChange: (value: string) => void;
  onTipoChange: (value: string) => void;
  onClearFilters: () => void;
}

export function NotificacionesFilters({
  estadoFilter,
  tipoFilter,
  onEstadoChange,
  onTipoChange,
  onClearFilters,
}: NotificacionesFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="w-full sm:w-auto flex-1">
        <label className="block text-sm font-medium mb-1">Estado</label>
        <Select value={estadoFilter} onValueChange={onEstadoChange}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="PENDIENTE">Pendiente</SelectItem>
            <SelectItem value="ENVIADA">Enviada</SelectItem>
            <SelectItem value="LEIDA">Leída</SelectItem>
            <SelectItem value="CANCELADA">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="w-full sm:w-auto flex-1">
        <label className="block text-sm font-medium mb-1">Tipo</label>
        <Select value={tipoFilter} onValueChange={onTipoChange}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="INFORMATIVA">Informativa</SelectItem>
            <SelectItem value="URGENTE">Urgente</SelectItem>
            <SelectItem value="RECORDATORIO">Recordatorio</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="w-full sm:w-auto flex items-end">
        <Button variant="outline" onClick={onClearFilters}>
          Limpiar filtros
        </Button>
      </div>
    </div>
  );
}