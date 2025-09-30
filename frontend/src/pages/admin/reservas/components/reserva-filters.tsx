import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Search, Filter, RefreshCw, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { FiltrosReserva, EstadoReserva, TipoReserva } from '@/types/reserva';
import { ESTADOS_RESERVA, TIPOS_RESERVA } from '@/types/reserva';

interface ReservaFiltersProps {
  filtros: FiltrosReserva;
  onFiltrosChange: (filtros: Partial<FiltrosReserva>) => void;
  onSearch: (termino: string) => void;
  onRefresh: () => void;
}

const ReservaFilters: React.FC<ReservaFiltersProps> = ({
  filtros,
  onFiltrosChange,
  onSearch,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [fechaDesde, setFechaDesde] = useState<Date | undefined>();
  const [fechaHasta, setFechaHasta] = useState<Date | undefined>();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFechaDesde(undefined);
    setFechaHasta(undefined);
    onFiltrosChange({});
    onSearch('');
  };

  const handleFechaDesdeChange = (fecha: Date | undefined) => {
    setFechaDesde(fecha);
    onFiltrosChange({
      fecha_reserva_desde: fecha ? format(fecha, 'yyyy-MM-dd') : undefined
    });
  };

  const handleFechaHastaChange = (fecha: Date | undefined) => {
    setFechaHasta(fecha);
    onFiltrosChange({
      fecha_reserva_hasta: fecha ? format(fecha, 'yyyy-MM-dd') : undefined
    });
  };

  const hasActiveFilters = Object.keys(filtros).length > 0 || searchTerm;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros y Búsqueda
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Búsqueda */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por residente, área, motivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">Buscar</Button>
        </form>

        {/* Filtros avanzados */}
        {showFilters && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Estado */}
              <div>
                <label className="text-sm font-medium mb-2 block">Estado</label>
                <Select
                  value={filtros.estado || ''}
                  onValueChange={(value) => onFiltrosChange({ 
                    estado: value ? value as EstadoReserva : undefined 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los estados</SelectItem>
                    {Object.entries(ESTADOS_RESERVA).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tipo de Reserva */}
              <div>
                <label className="text-sm font-medium mb-2 block">Tipo</label>
                <Select
                  value={filtros.tipo_reserva || ''}
                  onValueChange={(value) => onFiltrosChange({ 
                    tipo_reserva: value ? value as TipoReserva : undefined 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los tipos</SelectItem>
                    {Object.entries(TIPOS_RESERVA).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Fecha Desde */}
              <div>
                <label className="text-sm font-medium mb-2 block">Fecha Desde</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !fechaDesde && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fechaDesde ? format(fechaDesde, "dd/MM/yyyy", { locale: es }) : "Seleccionar"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={fechaDesde}
                      onSelect={handleFechaDesdeChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Fecha Hasta */}
              <div>
                <label className="text-sm font-medium mb-2 block">Fecha Hasta</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !fechaHasta && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fechaHasta ? format(fechaHasta, "dd/MM/yyyy", { locale: es }) : "Seleccionar"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={fechaHasta}
                      onSelect={handleFechaHastaChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Botón limpiar filtros */}
            {hasActiveFilters && (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Limpiar Filtros
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReservaFilters;
