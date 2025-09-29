import React from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { MoreHorizontal, Edit, Trash2, Home, Loader2 } from "lucide-react";
import type { Unidad } from "@/types/unidades";

interface UnidadTableProps {
  data: Unidad[];
  loading: boolean;
  onEdit: (unidad: Unidad) => void;
  onDelete: (unidad: Unidad) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function UnidadTable({
  data,
  loading,
  onEdit,
  onDelete,
  page,
  totalPages,
  onPageChange
}: UnidadTableProps) {
  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'OCUPADA': 'default',
      'DESOCUPADA': 'secondary',
      'MANTENIMIENTO': 'destructive',
    };
    const labels: Record<string, string> = {
      'OCUPADA': 'Ocupada',
      'DESOCUPADA': 'Desocupada',
      'MANTENIMIENTO': 'En Mantenimiento',
    };
    return (
      <Badge variant={variants[estado] || 'outline'}>
        {labels[estado] || estado}
      </Badge>
    );
  };

  const getCodigoBadge = (codigo: string) => (
    <Badge variant="outline" className="font-mono">
      <Home className="h-3 w-3 mr-1" />
      {codigo}
    </Badge>
  );

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
        No hay unidades habitacionales disponibles
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((unidad) => (
              <TableRow key={unidad.id}>
                <TableCell className="font-medium">{getCodigoBadge(unidad.codigo)}</TableCell>
                <TableCell>{unidad.direccion}</TableCell>
                <TableCell>{getEstadoBadge(unidad.estado)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(unidad)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(unidad)} className="text-red-600">
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
    </>
  );
}