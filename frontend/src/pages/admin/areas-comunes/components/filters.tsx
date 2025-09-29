import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EstadoArea } from "@/types/areas-comunes";

interface FiltersProps {
  estado: EstadoArea | "all";
  onEstadoChange: (estado: EstadoArea | "all") => void;
  search: string;
  onSearchChange: (value: string) => void;
  loading?: boolean;
}

const estadoLabels: Record<EstadoArea | "all", string> = {
  all: "Todos",
  ACTIVO: "Activo",
  INACTIVO: "Inactivo",
  MANTENIMIENTO: "Mantenimiento",
};

export function AreasComunesFilters({
  estado,
  onEstadoChange,
  search,
  onSearchChange,
  loading,
}: FiltersProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="search-area">
          Buscar por nombre
        </label>
        <Input
          id="search-area"
          placeholder="Ej. Piscina"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Estado</label>
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
  );
}

export default AreasComunesFilters;
