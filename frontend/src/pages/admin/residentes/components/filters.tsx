import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, X, User } from 'lucide-react';

interface ResidenteFiltersProps {
  search: string;
  estadoFilter: string;
  tipoFilter: string;
  unidadFilter: string;
  onSearchChange: (value: string) => void;
  onEstadoFilterChange: (value: string) => void;
  onTipoFilterChange: (value: string) => void;
  onUnidadFilterChange: (value: string) => void;
  unidades: { id: number; codigo: string; direccion: string; }[];
  loading?: boolean;
}

export function ResidenteFiltersComponent({ 
  search,
  estadoFilter,
  tipoFilter,
  unidadFilter,
  onSearchChange,
  onEstadoFilterChange,
  onTipoFilterChange,
  onUnidadFilterChange,
  unidades = [],
  loading = false 
}: ResidenteFiltersProps) {

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros de Búsqueda
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar por nombre, email, CI..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              disabled={loading}
              className="pl-10"
            />
          </div>

          <Select value={estadoFilter} onValueChange={onEstadoFilterChange} disabled={loading}>
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="activo">Activo</SelectItem>
              <SelectItem value="inactivo">Inactivo</SelectItem>
              <SelectItem value="suspendido">Suspendido</SelectItem>
              <SelectItem value="en_proceso">En Proceso</SelectItem>
            </SelectContent>
          </Select>

          <Select value={tipoFilter} onValueChange={onTipoFilterChange} disabled={loading}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo de residente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="propietario">Propietario</SelectItem>
              <SelectItem value="inquilino">Inquilino</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={unidadFilter} onValueChange={onUnidadFilterChange} disabled={loading}>
            <SelectTrigger>
              <SelectValue placeholder="Unidad Habitacional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las unidades</SelectItem>
              {unidades.map((unidad) => (
                <SelectItem key={unidad.id} value={unidad.codigo}>
                  {unidad.codigo} - {unidad.direccion}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
