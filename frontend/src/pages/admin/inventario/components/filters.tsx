import React, { useEffect, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  estadoInventarioLabels, 
  categoriaInventarioLabels 
} from "@/types/inventario";
import type { 
  EstadoInventario, 
  CategoriaInventario 
} from "@/types/inventario";
import type { AreaComun } from "@/types";

interface InventarioFiltersProps {
  estado: EstadoInventario | "all";
  onEstadoChange: (estado: EstadoInventario | "all") => void;
  categoria: CategoriaInventario | "all";
  onCategoriaChange: (categoria: CategoriaInventario | "all") => void;
  areaComun: number | "all";
  onAreaComunChange: (areaComun: number | "all") => void;
  search: string;
  onSearchChange: (value: string) => void;
  areasComunes: AreaComun[];
  loading?: boolean;
  onResetFilters?: () => void;
}

function InventarioFilters({
  estado,
  onEstadoChange,
  categoria,
  onCategoriaChange,
  areaComun,
  onAreaComunChange,
  search,
  onSearchChange,
  areasComunes,
  loading = false,
  onResetFilters
}: InventarioFiltersProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid gap-4 md:grid-cols-4">
          {/* Filtro de búsqueda por nombre */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1" htmlFor="search-item">
              <Search className="h-4 w-4" />
              Buscar
            </Label>
            <div className="relative">
              <Input
                id="search-item"
                placeholder="Buscar por nombre, ubicación, área común..."
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                disabled={loading}
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
            <Label>Estado</Label>
            <Select
              value={estado}
              onValueChange={(value) => onEstadoChange(value as EstadoInventario | "all")}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona estado" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(estadoInventarioLabels) as Array<EstadoInventario | "all">).map((key) => (
                  <SelectItem key={key} value={key}>
                    {estadoInventarioLabels[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por categoría */}
          <div className="space-y-2">
            <Label>Categoría</Label>
            <Select
              value={categoria}
              onValueChange={(value) => onCategoriaChange(value as CategoriaInventario | "all")}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona categoría" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(categoriaInventarioLabels) as Array<CategoriaInventario | "all">).map((key) => (
                  <SelectItem key={key} value={key}>
                    {categoriaInventarioLabels[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por área común */}
          <div className="space-y-2">
            <Label>Área Común</Label>
            <Select
              value={areaComun.toString()}
              onValueChange={(value) => onAreaComunChange(value === "all" ? "all" : parseInt(value))}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona área" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las áreas</SelectItem>
                {areasComunes.map((area) => (
                  <SelectItem key={area.id} value={area.id.toString()}>
                    {area.nombre}
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

export default InventarioFilters;