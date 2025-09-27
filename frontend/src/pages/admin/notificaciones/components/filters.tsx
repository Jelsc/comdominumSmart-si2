import React from "react";
import { Search, Filter, X, Calendar, Users, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";

import type { NotificacionFilters, RolOption } from "@/types";

interface NotificacionesFiltersProps {
  filters: NotificacionFilters;
  onFiltersChange: (filters: NotificacionFilters) => void;
  roles: RolOption[];
  onClearFilters: () => void;
}

export function NotificacionesFilters({
  filters,
  onFiltersChange,
  roles,
  onClearFilters,
}: NotificacionesFiltersProps) {
  const updateFilter = (key: keyof NotificacionFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const removeFilter = (key: keyof NotificacionFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const getActiveFiltersCount = () => {
    return Object.keys(filters).filter(
      (key) =>
        filters[key as keyof NotificacionFilters] !== undefined &&
        filters[key as keyof NotificacionFilters] !== "" &&
        key !== "search"
    ).length;
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Barra de búsqueda */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar notificaciones por nombre o descripción..."
                value={filters.search || ""}
                onChange={(e) => updateFilter("search", e.target.value)}
                className="pl-10"
              />
            </div>

            {getActiveFiltersCount() > 0 && (
              <Button
                variant="outline"
                onClick={onClearFilters}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Limpiar filtros
                <Badge variant="secondary" className="ml-1">
                  {getActiveFiltersCount()}
                </Badge>
              </Button>
            )}
          </div>

          {/* Filtros principales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Estado */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Estado
              </label>
              <Select
                value={filters.estado || ""}
                onValueChange={(value) =>
                  updateFilter("estado", value || undefined)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los estados</SelectItem>
                  <SelectItem value="programada">Programada</SelectItem>
                  <SelectItem value="enviada">Enviada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tipo */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Tipo
              </label>
              <Select
                value={filters.tipo || ""}
                onValueChange={(value) =>
                  updateFilter("tipo", value || undefined)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los tipos</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                  <SelectItem value="reunion">Reunión</SelectItem>
                  <SelectItem value="emergencia">Emergencia</SelectItem>
                  <SelectItem value="evento">Evento</SelectItem>
                  <SelectItem value="cobranza">Cobranza</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Prioridad */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Prioridad</label>
              <Select
                value={filters.prioridad || ""}
                onValueChange={(value) =>
                  updateFilter("prioridad", value || undefined)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas las prioridades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas las prioridades</SelectItem>
                  <SelectItem value="baja">Baja</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rol destinatario */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Rol destinatario
              </label>
              <Select
                value={filters.rol_destinatario?.toString() || ""}
                onValueChange={(value) =>
                  updateFilter(
                    "rol_destinatario",
                    value ? parseInt(value) : undefined
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los roles</SelectItem>
                  {roles.map((rol) => (
                    <SelectItem key={rol.id} value={rol.id.toString()}>
                      {rol.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filtros de fecha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fecha desde */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Desde
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`justify-start text-left font-normal ${
                      !filters.fecha_desde && "text-muted-foreground"
                    }`}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {filters.fecha_desde
                      ? formatFecha(filters.fecha_desde)
                      : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={
                      filters.fecha_desde
                        ? new Date(filters.fecha_desde)
                        : undefined
                    }
                    onSelect={(date) =>
                      updateFilter(
                        "fecha_desde",
                        date?.toISOString().split("T")[0]
                      )
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Fecha hasta */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Hasta</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`justify-start text-left font-normal ${
                      !filters.fecha_hasta && "text-muted-foreground"
                    }`}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {filters.fecha_hasta
                      ? formatFecha(filters.fecha_hasta)
                      : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={
                      filters.fecha_hasta
                        ? new Date(filters.fecha_hasta)
                        : undefined
                    }
                    onSelect={(date) =>
                      updateFilter(
                        "fecha_hasta",
                        date?.toISOString().split("T")[0]
                      )
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Filtros activos */}
          {getActiveFiltersCount() > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Filtros aplicados:</h4>
              <div className="flex flex-wrap gap-2">
                {filters.estado && (
                  <Badge variant="secondary" className="gap-1">
                    Estado: {filters.estado}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => removeFilter("estado")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}

                {filters.tipo && (
                  <Badge variant="secondary" className="gap-1">
                    Tipo: {filters.tipo}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => removeFilter("tipo")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}

                {filters.prioridad && (
                  <Badge variant="secondary" className="gap-1">
                    Prioridad: {filters.prioridad}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => removeFilter("prioridad")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}

                {filters.rol_destinatario && (
                  <Badge variant="secondary" className="gap-1">
                    Rol:{" "}
                    {roles.find((r) => r.id === filters.rol_destinatario)?.name}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => removeFilter("rol_destinatario")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}

                {filters.fecha_desde && (
                  <Badge variant="secondary" className="gap-1">
                    Desde: {formatFecha(filters.fecha_desde)}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => removeFilter("fecha_desde")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}

                {filters.fecha_hasta && (
                  <Badge variant="secondary" className="gap-1">
                    Hasta: {formatFecha(filters.fecha_hasta)}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => removeFilter("fecha_hasta")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
