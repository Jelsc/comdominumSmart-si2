import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Pencil, Trash2 } from "lucide-react";
import type { AreaComun } from "@/types/areas-comunes";

interface AreasComunesTableProps {
  data: AreaComun[];
  loading: boolean;
  onEdit: (area: AreaComun) => void;
  onDelete: (area: AreaComun) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const currencyFormatter = new Intl.NumberFormat("es-BO", {
  style: "currency",
  currency: "BOB",
  minimumFractionDigits: 2,
});

const estadoStyles: Record<string, string> = {
  ACTIVO: "bg-emerald-100 text-emerald-700 border-emerald-200",
  INACTIVO: "bg-gray-100 text-gray-600 border-gray-200",
  MANTENIMIENTO: "bg-amber-100 text-amber-700 border-amber-200",
};

const estadoLabels: Record<string, string> = {
  ACTIVO: "Activo",
  INACTIVO: "Inactivo",
  MANTENIMIENTO: "Mantenimiento",
};

const buildPaginationItems = (
  page: number,
  totalPages: number,
  onPageChange: (page: number) => void
) => {
  const items: JSX.Element[] = [];

  for (let current = 1; current <= totalPages; current += 1) {
    if (current === 1 || current === totalPages || Math.abs(current - page) <= 1) {
      items.push(
        <PaginationItem key={current}>
          <PaginationLink
            isActive={current === page}
            onClick={() => onPageChange(current)}
          >
            {current}
          </PaginationLink>
        </PaginationItem>
      );
    } else if (
      items[items.length - 1]?.key !== `ellipsis-${current}` &&
      (current === page - 2 || current === page + 2)
    ) {
      items.push(
        <PaginationItem key={`ellipsis-${current}`}>
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
  }

  return items;
};

const formatCurrency = (value: string) => {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return value;
  }
  return currencyFormatter.format(numeric);
};

const AreasComunesTable = ({
  data,
  loading,
  onEdit,
  onDelete,
  page,
  totalPages,
  onPageChange,
}: AreasComunesTableProps) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-12 w-full animate-pulse rounded bg-muted" />
        ))}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        No se encontraron áreas comunes registradas.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ScrollArea className="max-h-[480px]">
        <div className="min-w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Monto por hora</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[120px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((area) => (
                <TableRow key={area.id}>
                  <TableCell className="font-medium">{area.nombre}</TableCell>
                  <TableCell>{formatCurrency(area.monto_hora)}</TableCell>
                  <TableCell>
                    <Badge className={estadoStyles[area.estado] ?? ""} variant="outline">
                      {estadoLabels[area.estado] ?? area.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(area)}
                        aria-label={`Editar ${area.nombre}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => onDelete(area)}
                        aria-label={`Eliminar ${area.nombre}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => onPageChange(Math.max(1, page - 1))}
                aria-disabled={page === 1}
                className={page === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {buildPaginationItems(page, totalPages, onPageChange)}
            <PaginationItem>
              <PaginationNext
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                aria-disabled={page === totalPages}
                className={page === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default AreasComunesTable;
