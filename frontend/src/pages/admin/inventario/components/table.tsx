import React from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { 
  type InventarioDetallado,
  estadoInventarioLabels,
  categoriaInventarioLabels,
  type EstadoInventario
} from "@/types/inventario";

interface InventarioTableProps {
  data: InventarioDetallado[];
  loading: boolean;
  onEdit: (item: InventarioDetallado) => void;
  onDelete: (item: InventarioDetallado) => void;
  onView?: (item: InventarioDetallado) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const currencyFormatter = new Intl.NumberFormat("es-VE", {
  style: "currency",
  currency: "VES",
  minimumFractionDigits: 2,
});

export function InventarioTable({
  data,
  loading,
  onEdit,
  onDelete,
  onView,
  page,
  totalPages,
  onPageChange,
}: InventarioTableProps) {
  const formatCurrency = (value: string | number) => {
    const numeric = typeof value === 'string' ? Number(value) : value;
    if (Number.isNaN(numeric)) {
      return String(value);
    }
    return currencyFormatter.format(numeric);
  };
  
  const getEstadoBadge = (estado: EstadoInventario) => {
    const variants: Record<EstadoInventario, "default" | "secondary" | "destructive" | "outline"> = {
      'ACTIVO': 'default',
      'INACTIVO': 'secondary',
      'EN_REPARACION': 'outline',
      'DADO_DE_BAJA': 'destructive',
    };

    return (
      <Badge variant={variants[estado] || 'outline'}>
        {estadoInventarioLabels[estado] || estado}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No se encontraron elementos en el inventario
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Área Común</TableHead>
              <TableHead>Valor Estimado</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Fecha Adquisición</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.nombre}</TableCell>
                <TableCell>
                  {categoriaInventarioLabels[item.categoria]}
                </TableCell>
                <TableCell>{getEstadoBadge(item.estado)}</TableCell>
                <TableCell>
                  {item.area_comun ? item.area_comun.nombre : "—"}
                </TableCell>
                <TableCell>{formatCurrency(item.valor_estimado)}</TableCell>
                <TableCell>{item.ubicacion}</TableCell>
                <TableCell>
                  {new Date(item.fecha_adquisicion).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onView && (
                        <DropdownMenuItem onClick={() => onView(item)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalles
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => onEdit(item)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete(item)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => page > 1 && onPageChange(page - 1)}
                  size="default"
                  className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNumber = i + 1;
                const isActive = pageNumber === page;
                
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      onClick={() => onPageChange(pageNumber)}
                      isActive={isActive}
                      size="icon"
                      className="cursor-pointer"
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              {totalPages > 5 && (
                <>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => onPageChange(totalPages)}
                      isActive={page === totalPages}
                      size="icon"
                      className="cursor-pointer"
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => page < totalPages && onPageChange(page + 1)}
                  size="default"
                  className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </>
  );
}

export default InventarioTable;