import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { estadoLabels } from "@/types/areas-comunes";
import type { EstadoArea } from "@/types/areas-comunes";

interface FiltersProps {
  estado: EstadoArea | "all";
  onEstadoChange: (estado: EstadoArea | "all") => void;
  search: string;
  onSearchChange: (value: string) => void;
  loading?: boolean;
  onResetFilters?: () => void;
}

function AreasComunesFilters({
  estado,
  onEstadoChange,
  search,
  onSearchChange,
  loading = false,
  onResetFilters
}: FiltersProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros de búsqueda
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Filtro de búsqueda por nombre */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1" htmlFor="search-area">
              <Search className="h-4 w-4" />
              Buscar por nombre
            </Label>
            <div className="relative">
              <Input
                id="search-area"
                placeholder="Ej. Piscina, Salón de eventos"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                disabled={loading === true}
                className="pl-8"
              />
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              {search && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => onSearchChange("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Filtro por estado */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <Settings className="h-4 w-4" />
              Estado
            </Label>
            <Select
              value={estado}
              onValueChange={(value) => onEstadoChange(value as EstadoArea | "all")}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(estadoLabels) as Array<EstadoArea | "all">).map((key) => (
                  <SelectItem key={key} value={key}>
                    {estadoLabels[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Botón para limpiar filtros - opcional */}
        {onResetFilters && (
          <div className="mt-4 flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              disabled={loading}
            >
              <X className="mr-1 h-4 w-4" /> Limpiar filtros
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AreasComunesFilters;
