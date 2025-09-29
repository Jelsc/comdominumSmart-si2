import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/app/layout/admin-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Plus, Home, CheckCircle, AlertTriangle, Settings } from "lucide-react";
import { useAreasComunes } from "@/hooks";
import AreasComunesFilters from "./components/filters";
import AreasComunesTable from "./components/table";
import AreaComunStore from "./components/store";
import AreaComunDelete from "./components/delete";
import type { AreaComunForm, EstadoArea } from "@/types/areas-comunes";
import type { AreasComunesApiResponse } from "@/services/areas-comunes.api";
import type { AreaComun } from "@/types/areas-comunes";

// Constante para paginación
const PAGE_SIZE = 10;

const buildParams = (
  page: number,
  estado: EstadoArea | "all",
  search: string
) => ({
  page,
  page_size: PAGE_SIZE,
  ...(estado !== "all" ? { estado: estado as EstadoArea } : {}),
  ...(search ? { search } : {}),
});

const AreasComunesPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<"all" | AreaComun["estado"]>("all");

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
  } = useAreasComunes();

  useEffect(() => {
    const handler = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);

    return () => window.clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, estadoFilter]);

  useEffect(() => {
    const params = buildParams(page, estadoFilter, debouncedSearch);
    void loadData(params);
  }, [page, debouncedSearch, estadoFilter]);

  const handleStoreSubmit = (values: AreaComunForm) => {
    if (selectedItem) {
      return updateItem(selectedItem.id, values);
    }
    return createItem(values);
  };

  const handleDeleteConfirm = () => {
    if (!selectedItem) {
      return Promise.resolve<AreasComunesApiResponse<null>>({
        success: false,
        data: null,
        error: "No se encontró el registro seleccionado.",
      });
    }
    return deleteItem(selectedItem.id);
  };

  const isActionLoading = useMemo(
    () => loading && (isStoreModalOpen || isDeleteModalOpen),
    [loading, isStoreModalOpen, isDeleteModalOpen]
  );

  const isTableLoading = loading && !isActionLoading;

  const totalPages = useMemo(() => {
    if (!data?.count) {
      return 1;
    }
    return Math.max(1, Math.ceil(data.count / PAGE_SIZE));
  }, [data?.count]);

  const handleOpenCreate = () => openStoreModal();

  const handleEdit = (area: AreaComun) => openStoreModal(area);

  const handleDelete = (area: AreaComun) => openDeleteModal(area);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Áreas comunes</h1>
            <p className="text-muted-foreground">
              Gestiona los espacios compartidos del condominio.
            </p>
          </div>
          <Button onClick={handleOpenCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nueva área común
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Áreas Activas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {data?.results?.filter(a => a.estado === "ACTIVO").length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                En funcionamiento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Áreas Inactivas</CardTitle>
              <Settings className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-500">
                {data?.results?.filter(a => a.estado === "INACTIVO").length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Fuera de servicio
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Mantenimiento</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {data?.results?.filter(a => a.estado === "MANTENIMIENTO").length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                En reparación
              </p>
            </CardContent>
          </Card>
        </div>

        <AreasComunesFilters
          estado={estadoFilter}
          onEstadoChange={(value) => setEstadoFilter(value)}
          search={search}
          onSearchChange={setSearch}
          loading={isTableLoading}
        />


        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error al cargar los datos</AlertTitle>
            <AlertDescription className="flex items-center justify-between gap-4">
              <span>{error}</span>
              <Button size="sm" variant="outline" onClick={clearError}>
                Cerrar
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Lista de Áreas Comunes</CardTitle>
          </CardHeader>
          <CardContent>
            <AreasComunesTable
              data={data?.results ?? []}
              loading={isTableLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </CardContent>
        </Card>
      </div>

      <AreaComunStore
        open={isStoreModalOpen}
        onClose={closeStoreModal}
        initialData={selectedItem}
        onSubmit={handleStoreSubmit}
        loading={loading && isStoreModalOpen}
      />

      <AreaComunDelete
        open={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        area={selectedItem ?? null}
        loading={loading && isDeleteModalOpen}
      />
    </AdminLayout>
  );
};

export default AreasComunesPage;
