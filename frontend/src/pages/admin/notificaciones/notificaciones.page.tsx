import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Bell, AlertTriangle, CheckCircle, Search, Filter } from 'lucide-react';
import { useNotificaciones } from '@/hooks/useNotificaciones';
import { useRoles } from '@/hooks/useRoles'; // Añadido hook de roles
import { NotificacionesTable } from './components/table';
import { NotificacionesFilters } from './components/filters';
import { NotificacionForm } from './components/form';
import { NotificacionDeleteDialog } from './components/delete-dialog';
import { NotificacionesStats } from './components/stats';
import AdminLayout from '@/app/layout/admin-layout';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { NotificacionFilters } from '@/types';

const ITEMS_PER_PAGE = 10;

export default function NotificacionesPage() {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [searchDebounced, setSearchDebounced] = useState<string>("");
  const [estadoFilter, setEstadoFilter] = useState<string>("all");
  const [tipoFilter, setTipoFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Obtenemos los roles para el formulario
  const { roles, loading: loadingRoles } = useRoles();

  const {
    data,
    loading,
    error,
    selectedItem,
    isStoreModalOpen,
    isDeleteModalOpen,
    showStats,
    estadisticas,
    filters,
    loadData,
    createItem,
    updateItem,
    deleteItem,
    openStoreModal,
    closeStoreModal,
    openDeleteModal,
    closeDeleteModal,
    toggleStats,
    setFilters,
    clearError,
  } = useNotificaciones();

  // Función para cargar datos con filtros y paginación
  const fetchNotificaciones = async (pageNumber = 1, searchQuery = "", estado = "all", tipo = "all") => {
    const newFilters: NotificacionFilters = {
      ...(searchQuery && { search: searchQuery }),
      ...(estado !== "all" && { estado }),
      ...(tipo !== "all" && { tipo }),
      page: pageNumber,
      page_size: ITEMS_PER_PAGE,
    };
    
    await loadData(newFilters);
  };

  // Efecto para cargar las notificaciones al inicio y cuando cambien los filtros
  useEffect(() => {
    fetchNotificaciones(page, searchDebounced, estadoFilter, tipoFilter);
  }, [page, searchDebounced, estadoFilter, tipoFilter]);

  // Efecto para el debounce del término de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Manejadores de eventos
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleEstadoFilterChange = (value: string) => {
    setEstadoFilter(value);
    setPage(1);
  };

  const handleTipoFilterChange = (value: string) => {
    setTipoFilter(value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setSearchDebounced("");
    setEstadoFilter("all");
    setTipoFilter("all");
    setPage(1);
  };

  const handleFiltersChange = (newFilters: NotificacionFilters) => {
    setFilters(newFilters);
  };

  // Calcular estadísticas para tarjetas
  const notificacionesLeidas = estadisticas?.leidas || 0;
  const notificacionesNoLeidas = estadisticas?.no_leidas || 0;
  const totalNotificaciones = (data?.count || 0);

  return (
    <AdminLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Notificaciones</h1>
          <div className="flex items-center space-x-2">
            <Button
              onClick={toggleStats}
              variant={showStats ? "secondary" : "outline"}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Estadísticas
            </Button>
            <Button onClick={() => openStoreModal()}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Notificación
            </Button>
          </div>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Notificaciones</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalNotificaciones}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Leídas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notificacionesLeidas}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">No Leídas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notificacionesNoLeidas}</div>
            </CardContent>
          </Card>
        </div>

        {/* Estadísticas detalladas */}
        {showStats && estadisticas && (
          <NotificacionesStats estadisticas={estadisticas} />
        )}

        {/* Controles de búsqueda y filtros */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Buscador */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar notificaciones..."
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
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
                  estadoFilter={estadoFilter}
                  tipoFilter={tipoFilter}
                  onEstadoChange={handleEstadoFilterChange}
                  onTipoChange={handleTipoFilterChange}
                  onClearFilters={handleClearFilters}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabla de notificaciones */}
        <NotificacionesTable
          data={data?.results || []}
          loading={loading}
          onEdit={(item) => item && openStoreModal(item)}
          onDelete={(item) => item && openDeleteModal(item)}
          page={page}
          totalPages={data?.total_pages ?? 1}
          onPageChange={handlePageChange}
        />

        {/* Modal para crear/editar notificación */}
        {isStoreModalOpen && (
          <NotificacionForm
            open={isStoreModalOpen}
            onOpenChange={closeStoreModal}
            onSubmit={async (data) => {
              if (selectedItem) {
                await updateItem(selectedItem.id, data);
              } else {
                await createItem(data);
              }
            }}
            notificacion={selectedItem}
            roles={roles}
            loading={loading || loadingRoles}
          />
        )}

        {/* Modal para confirmar eliminación */}
        {isDeleteModalOpen && selectedItem && (
          <NotificacionDeleteDialog
            open={isDeleteModalOpen}
            onOpenChange={closeDeleteModal}
            onConfirm={() => {
              deleteItem(selectedItem.id);
              closeDeleteModal();
            }}
            notificacion={selectedItem}
            loading={loading}
          />
        )}
      </div>
    </AdminLayout>
  );
}