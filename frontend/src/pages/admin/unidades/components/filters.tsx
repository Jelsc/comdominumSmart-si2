import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Filter, Search, X } from "lucide-react";
import { ESTADOS_UNIDAD } from "@/types/unidades";

export default function Filters({ 
  search,
  setSearch,
  estadoFilter,
  setEstadoFilter,
  loading = false 
}: {
  search: string;
  setSearch: (value: string) => void;
  estadoFilter: string;
  setEstadoFilter: (value: string) => void;
  loading?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros de Búsqueda
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar por dirección o código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={loading}
              className="pl-10"
            />
          </div>

          <Select value={estadoFilter} onValueChange={setEstadoFilter} disabled={loading}>
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {ESTADOS_UNIDAD.map((estado) => (
                <SelectItem key={estado} value={estado}>
                  {estado === "OCUPADA" 
                    ? "Ocupada" 
                    : estado === "DESOCUPADA" 
                    ? "Desocupada" 
                    : "En Mantenimiento"
                  }
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline"
            onClick={() => {
              setSearch("");
              setEstadoFilter("all");
            }}
            disabled={!search && estadoFilter === "all" || loading}
          >
            <X className="mr-2 h-4 w-4" />
            Limpiar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}