import React, { useEffect } from "react";
import AdminLayout from "@/app/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, Building as BuildingIcon, CheckCircle, AlertTriangle, Construction } from "lucide-react";
import { useUnidades } from "@/hooks/useUnidades";

// Importando componentes locales
import Table from "./components/table";
import Filters from "./components/filters";
import Store from "./components/store";
import Delete from "./components/delete";

const ITEMS_PER_PAGE = 10;

export default function UnidadesPage() {
  const [page, setPage] = React.useState<number>(1);
  const [search, setSearch] = React.useState<string>("");
  const [searchDebounced, setSearchDebounced] = React.useState<string>("");
  const [estadoFilter, setEstadoFilter] = React.useState<string>("all");
  
  const {
    data,
    loading,
    error,
    selectedItem,
    isStoreModalOpen,
    isDeleteModalOpen,
    loadData,
    createItem,
    updateItem,
    deleteItem,
    openStoreModal,
    closeStoreModal,
    openDeleteModal,
    closeDeleteModal,
    clearError,
  } = useUnidades();

  // Función para cargar datos con filtros y paginación
  const fetchUnidades = async (pageNumber = 1, searchQuery = "", estado = "all") => {
    const filters: any = {
      ...(searchQuery && { search: searchQuery }),
      ...(estado !== "all" && { estado }),
      page: pageNumber,
      page_size: ITEMS_PER_PAGE,
    };
    
    await loadData(filters);
  };

  // Debounce para el campo de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Cargar datos al montar el componente y cuando cambien los filtros
  useEffect(() => {
    fetchUnidades(page, searchDebounced, estadoFilter);
  }, [page, searchDebounced, estadoFilter]);

  const handleCreate = () => {
    openStoreModal();
  };

  const handleEdit = (unidad: any) => {
    openStoreModal(unidad);
  };

  const handleDelete = (unidad: any) => {
    openDeleteModal(unidad);
  };

  const totalUnidades = data?.count || 0;
  const unidadesOcupadas = data?.results?.filter(u => u.estado === 'OCUPADA').length || 0;
  const unidadesDesocupadas = data?.results?.filter(u => u.estado === 'DESOCUPADA').length || 0;
  const unidadesEnMantenimiento = data?.results?.filter(u => u.estado === 'MANTENIMIENTO').length || 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Unidades Habitacionales</h1>
            <p className="text-muted-foreground">
              Gestiona la información de las unidades habitacionales del condominio
            </p>
          </div>
          <Button onClick={handleCreate} className="flex items-center gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Agregar Unidad
          </Button>
        </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Unidades</CardTitle>
            <BuildingIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalUnidades}
            </div>
            <p className="text-xs text-muted-foreground">
              Unidades registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unidades Ocupadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {unidadesOcupadas}
            </div>
            <p className="text-xs text-muted-foreground">
              Con residentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unidades Desocupadas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {unidadesDesocupadas}
            </div>
            <p className="text-xs text-muted-foreground">
              Sin residentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Mantenimiento</CardTitle>
            <Construction className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {unidadesEnMantenimiento}
            </div>
            <p className="text-xs text-muted-foreground">
              No disponibles temporalmente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Filters 
        search={search} 
        setSearch={setSearch} 
        estadoFilter={estadoFilter}
        setEstadoFilter={setEstadoFilter}
        loading={loading}
      />

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Unidades</CardTitle>
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
          <Table
            data={data?.results || []}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            page={page}
            totalPages={Math.max(1, Math.ceil((data?.count || 0) / ITEMS_PER_PAGE))}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>

      {isStoreModalOpen && (
        <Store
          open={isStoreModalOpen}
          onClose={closeStoreModal}
          unidad={selectedItem}
          onSuccess={() => {
            fetchUnidades(page, searchDebounced, estadoFilter);
            closeStoreModal();
          }}
        />
      )}

      {isDeleteModalOpen && (
        <Delete
          open={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onDelete={async () => {
            if (selectedItem) await deleteItem(selectedItem.id);
            fetchUnidades(page, searchDebounced, estadoFilter);
          }}
          unidad={selectedItem}
        />
      )}
      </div>
    </AdminLayout>
  );
}