import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";

import {
  NotificacionesTable,
  NotificacionesFilters,
  NotificacionDeleteDialog,
  NotificacionForm,
  NotificacionesStats,
} from "./components";

import { notificacionesService } from "@/services";
import type {
  Notificacion,
  NotificacionFilters as Filters,
  NotificacionEstadisticas,
  RolOption,
  NotificacionFormData,
  PaginatedResponse,
} from "@/types";

export default function NotificacionesPage() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [editingNotificacion, setEditingNotificacion] =
    useState<Notificacion | null>(null);
  const [deletingNotificacion, setDeletingNotificacion] =
    useState<Notificacion | null>(null);
  const [filters, setFilters] = useState<Filters>({});
  const [estadisticas, setEstadisticas] =
    useState<NotificacionEstadisticas | null>(null);
  const [roles, setRoles] = useState<RolOption[]>([]);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  // No need for hook, using toast directly

  const loadNotificaciones = async () => {
    try {
      setLoading(true);
      const searchParams: any = {
        ...filters,
        page: currentPage,
        page_size: pageSize,
      };
      if (searchTerm) {
        searchParams.search = searchTerm;
      }
      const response = await notificacionesService.getNotificaciones(
        searchParams
      );

      setNotificaciones(response.results);
      setTotalCount(response.count);
      setTotalPages(Math.ceil(response.count / pageSize));
    } catch (error) {
      toast.error("No se pudieron cargar las notificaciones");
      console.error("Error loading notificaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadEstadisticas = async () => {
    try {
      const stats = await notificacionesService.getEstadisticas();
      setEstadisticas(stats);
    } catch (error) {
      console.error("Error loading estadisticas:", error);
    }
  };

  const loadRoles = async () => {
    try {
      const rolesData = await notificacionesService.getRolesDisponibles();
      setRoles(rolesData);
    } catch (error) {
      console.error("Error loading roles:", error);
    }
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchTerm("");
  };

  useEffect(() => {
    loadNotificaciones();
  }, [searchTerm, filters, currentPage]);

  useEffect(() => {
    loadEstadisticas();
    loadRoles();
  }, []);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleCreate = () => {
    setEditingNotificacion(null);
    setShowForm(true);
  };

  const handleEdit = (notificacion: Notificacion) => {
    setEditingNotificacion(notificacion);
    setShowForm(true);
  };

  const handleDelete = (notificacion: Notificacion) => {
    setDeletingNotificacion(notificacion);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingNotificacion(null);
    loadNotificaciones();
    loadEstadisticas();
    toast.success(
      editingNotificacion
        ? "Notificación actualizada correctamente"
        : "Notificación creada correctamente"
    );
  };

  const handleFormSubmit = async (data: NotificacionFormData) => {
    try {
      if (editingNotificacion) {
        await notificacionesService.updateNotificacion(
          editingNotificacion.id,
          data
        );
      } else {
        await notificacionesService.createNotificacion(data);
      }
      handleFormSuccess();
    } catch (error) {
      toast.error("Error al guardar la notificación");
    }
  };

  const handleDeleteSuccess = () => {
    setDeletingNotificacion(null);
    loadNotificaciones();
    loadEstadisticas();
    toast.success("Notificación eliminada correctamente");
  };

  const handleEnviar = async (notificacion: Notificacion) => {
    const result = await notificacionesService.enviarNotificacion(
      notificacion.id
    );
    if (result.success) {
      toast.success(result.message || "Notificación enviada correctamente");
      loadNotificaciones();
      loadEstadisticas();
    } else {
      toast.error(result.error || "Error al enviar la notificación");
    }
  };

  const handleCancelar = async (notificacion: Notificacion) => {
    const result = await notificacionesService.cancelarNotificacion(
      notificacion.id
    );
    if (result.success) {
      toast.success(result.message || "Notificación cancelada correctamente");
      loadNotificaciones();
      loadEstadisticas();
    } else {
      toast.error(result.error || "Error al cancelar la notificación");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestión de Notificaciones
          </h1>
          <p className="text-muted-foreground">
            Administra las notificaciones del condominio
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => setShowStats(!showStats)}
            className="gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Estadísticas
          </Button>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Notificación
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      {showStats && estadisticas && (
        <NotificacionesStats estadisticas={estadisticas} />
      )}

      {/* Controles */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Buscador */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar notificaciones..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtros */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
              {Object.keys(filters).length > 0 && (
                <Badge variant="secondary">{Object.keys(filters).length}</Badge>
              )}
            </Button>
          </div>

          {/* Panel de filtros */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t">
              <NotificacionesFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                roles={roles}
                onClearFilters={handleClearFilters}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabla de notificaciones */}
      <NotificacionesTable
        notificaciones={notificaciones}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        onPageChange={setCurrentPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onEnviar={handleEnviar}
        onCancelar={handleCancelar}
      />

      {/* Dialogs */}
      {showForm && (
        <NotificacionForm
          notificacion={editingNotificacion}
          open={showForm}
          onOpenChange={(open) => !open && setShowForm(false)}
          roles={roles}
          onSubmit={handleFormSubmit}
        />
      )}

      {deletingNotificacion && (
        <NotificacionDeleteDialog
          notificacion={deletingNotificacion}
          open={!!deletingNotificacion}
          onOpenChange={(open) => !open && setDeletingNotificacion(null)}
          onConfirm={handleDeleteSuccess}
        />
      )}
    </div>
  );
}
