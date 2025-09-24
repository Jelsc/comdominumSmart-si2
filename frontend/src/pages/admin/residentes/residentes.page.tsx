import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Home, AlertTriangle, CheckCircle } from 'lucide-react';
import { useResidentes } from '@/hooks/useResidentes';
import { ResidenteTable } from './components/table';
import { ResidenteFiltersComponent } from './components/filters';
import { ResidenteStore } from './components/store';
import { ResidenteDelete } from './components/delete';
import AdminLayout from '@/app/layout/admin-layout';

const ITEMS_PER_PAGE = 10;

export default function ResidentesPage() {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [searchDebounced, setSearchDebounced] = useState<string>("");
  const [estadoFilter, setEstadoFilter] = useState<string>("all");
  const [tipoFilter, setTipoFilter] = useState<string>("all");
  const [unidadFilter, setUnidadFilter] = useState<string>("all");

  const {
    data,
    loading,
    error,
    selectedItem,
    isStoreModalOpen,
    isDeleteModalOpen,
    residentesActivos,
    residentesInactivos,
    loadData,
    createItem,
    updateItem,
    deleteItem,
    openStoreModal,
    closeStoreModal,
    openDeleteModal,
    closeDeleteModal,
    clearError,
  } = useResidentes();

  // Función para cargar datos con filtros y paginación
  const fetchResidentes = async (pageNumber = 1, searchQuery = "", estado = "all", tipo = "all", unidad = "all") => {
    const filters: any = {
      ...(searchQuery && { search: searchQuery }),
      ...(estado !== "all" && { estado }),
      ...(tipo !== "all" && { tipo }),
      ...(unidad && { unidad_habitacional: unidad }),
    };
    
    await loadData(filters);
  };

  // Debounce para el campo de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search);
    }, 1000);

    return () => clearTimeout(timer);
  }, [search]);

  // Cargar datos al montar el componente y cuando cambien los filtros
  useEffect(() => {
    fetchResidentes(page, searchDebounced, estadoFilter, tipoFilter, unidadFilter);
  }, [page, searchDebounced, estadoFilter, tipoFilter, unidadFilter]);

  const handleCreate = () => {
    openStoreModal();
  };

  const handleEdit = (residente: any) => {
    openStoreModal(residente);
  };

  const handleDelete = (residente: any) => {
    openDeleteModal(residente);
  };

  const handleStoreSubmit = async (data: any) => {
    if (selectedItem) {
      return await updateItem(selectedItem.id, data);
    } else {
      return await createItem(data);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedItem) {
      return await deleteItem(selectedItem.id);
    }
    return false;
  };

  const totalPages = Math.ceil((data?.count || 0) / ITEMS_PER_PAGE);

  const totalResidentes = data?.count || 0;
  const residentesActivosCount = data?.results?.filter(r => r.estado === 'activo').length || 0;
  const residentesInactivosCount = totalResidentes - residentesActivosCount;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Residentes</h1>
            <p className="text-muted-foreground">
              Administra la información de los residentes del condominio
            </p>
          </div>
          <Button onClick={handleCreate} className="flex items-center gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Agregar Residente
          </Button>
        </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Residentes</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalResidentes}
            </div>
            <p className="text-xs text-muted-foreground">
              Residentes registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Residentes Activos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {residentesActivosCount}
            </div>
            <p className="text-xs text-muted-foreground">
              En el sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Residentes Inactivos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {residentesInactivosCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Fuera del sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Propietarios</CardTitle>
            <Home className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {data?.results?.filter(r => r.tipo === 'propietario').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Propietarios registrados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <ResidenteFiltersComponent
        search={search}
        estadoFilter={estadoFilter}
        tipoFilter={tipoFilter}
        onSearchChange={setSearch}
        onEstadoFilterChange={setEstadoFilter}
        onTipoFilterChange={setTipoFilter}
        loading={loading}
      />

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Residentes</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearError}
                className="mt-2"
              >
                Cerrar
              </Button>
            </div>
          )}
          
          <ResidenteTable
            data={data?.results || []}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            page={page}
            totalPages={totalPages}
            onPageChange={(newPage) => {
              setPage(newPage);
              fetchResidentes(newPage, searchDebounced, estadoFilter, tipoFilter, unidadFilter);
            }}
          />
        </CardContent>
      </Card>

      {/* Modales */}
      <ResidenteStore
        isOpen={isStoreModalOpen}
        onClose={closeStoreModal}
        onSubmit={handleStoreSubmit}
        initialData={selectedItem}
        loading={loading}
      />

      <ResidenteDelete
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        residente={selectedItem}
        loading={loading}
      />
      </div>
    </AdminLayout>
  );
}
