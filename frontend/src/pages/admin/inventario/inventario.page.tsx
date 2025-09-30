import React, { useEffect, useMemo, useState, useCallback } from "react";
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
import { Plus, CheckCircle, AlertTriangle, Settings, Wrench, FileSpreadsheet, FileText } from "lucide-react";
import { useInventario } from "@/hooks/use-inventario";
import InventarioFilters from "./components/filters";
import InventarioTable from "./components/table";
import { InventarioStore } from "./components/store";
import { InventarioDelete } from "./components/delete";
import { exportToExcel, exportToPDF } from "./components/export";
import type { InventarioForm, EstadoInventario, CategoriaInventario } from "@/types/inventario";
import type { InventarioDetallado } from "@/types/inventario";
import type { AreaComun } from "@/types";
import { areasComunesApi } from "@/services/areas-comunes.api";

// Constante para paginación
const PAGE_SIZE = 10;

const buildParams = (
  page: number,
  estado: EstadoInventario | "all",
  categoria: CategoriaInventario | "all",
  areaComun: number | "all",
  search: string
) => ({
  page,
  page_size: PAGE_SIZE,
  ...(estado !== "all" ? { estado } : {}),
  ...(categoria !== "all" ? { categoria } : {}),
  ...(areaComun !== "all" ? { area_comun: areaComun } : {}),
  ...(search ? { search } : {}),
});

const InventarioPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<"all" | EstadoInventario>("all");
  const [categoriaFilter, setCategoriaFilter] = useState<"all" | CategoriaInventario>("all");
  const [areaComunFilter, setAreaComunFilter] = useState<"all" | number>("all");
  const [areasComunes, setAreasComunes] = useState<AreaComun[]>([]);

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
    openDeleteModal: openDeleteConfirmation,
    closeDeleteModal,
    clearError,
    itemsActivos,
    itemsInactivos,
    itemsEnReparacion,
    itemsDadosDeBaja
  } = useInventario();

  useEffect(() => {
    const handler = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);

    return () => window.clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, estadoFilter, categoriaFilter, areaComunFilter]);



  useEffect(() => {
    // Incluimos la búsqueda por nombres de áreas comunes
    const searchTerm = debouncedSearch;
    const params = buildParams(page, estadoFilter, categoriaFilter, areaComunFilter, searchTerm);
    void loadData(params);
  }, [page, debouncedSearch, estadoFilter, categoriaFilter, areaComunFilter]);

  // Cargar las áreas comunes al iniciar
  useEffect(() => {
    const fetchAreasComunes = async () => {
      try {
        const response = await areasComunesApi.list();
        if (response.success && response.data) {
          setAreasComunes(response.data.results || []);
        }
      } catch (error) {
        console.error("Error al cargar las áreas comunes:", error);
      }
    };

    void fetchAreasComunes();
  }, []);

  const handleStoreSubmit = (values: InventarioForm) => {
    if (selectedItem) {
      return updateItem(selectedItem.id, values);
    }
    return createItem(values);
  };

  const handleDeleteConfirm = () => {
    if (!selectedItem) {
      return Promise.resolve({
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

  const handleEdit = (item: InventarioDetallado) => {
    if (!item) return;
    // Convertir de InventarioDetallado a Inventario
    const inventarioItem = {
      ...item,
      area_comun: item.area_comun?.id ?? null,
      area_comun_nombre: item.area_comun?.nombre ?? null
    };
    openStoreModal(inventarioItem);
  };

  const handleDelete = (item: InventarioDetallado) => {
    if (!item) return;
    // Convertir de InventarioDetallado a Inventario
    const inventarioItem = {
      ...item,
      area_comun: item.area_comun?.id ?? null,
      area_comun_nombre: item.area_comun?.nombre ?? null
    };
    openDeleteConfirmation(inventarioItem);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventario</h1>
            <p className="text-muted-foreground">
              Gestiona los elementos y equipos del condominio.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleOpenCreate} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nuevo elemento
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Elementos Activos</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {itemsActivos}
              </div>
              <p className="text-xs text-muted-foreground">
                En uso
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
              <Settings className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-500">
                {itemsInactivos}
              </div>
              <p className="text-xs text-muted-foreground">
                Fuera de uso
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Reparación</CardTitle>
              <Wrench className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {itemsEnReparacion}
              </div>
              <p className="text-xs text-muted-foreground">
                Mantenimiento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dados de Baja</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {itemsDadosDeBaja}
              </div>
              <p className="text-xs text-muted-foreground">
                Descartados
              </p>
            </CardContent>
          </Card>
        </div>

        <InventarioFilters
          estado={estadoFilter}
          onEstadoChange={setEstadoFilter}
          categoria={categoriaFilter}
          onCategoriaChange={setCategoriaFilter}
          areaComun={areaComunFilter}
          onAreaComunChange={setAreaComunFilter}
          search={search}
          onSearchChange={setSearch}
          loading={isTableLoading}
          areasComunes={areasComunes}
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
        <div className="flex gap-2">
            {!isTableLoading && data?.results && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2"
                  onClick={() => {
                    const currencyFormatter = new Intl.NumberFormat("es-VE", {
                      style: "currency",
                      currency: "VES",
                      minimumFractionDigits: 2,
                    });
                    
                    const formatCurrency = (value: string | number) => {
                      const numeric = typeof value === 'string' ? Number(value) : value;
                      if (Number.isNaN(numeric)) {
                        return String(value);
                      }
                      return currencyFormatter.format(numeric);
                    };
                    
                    // Convertir datos a formato para ExportButtons
                    const exportData = data.results.map(item => {
                      const areaComun = item.area_comun && areasComunes.find(a => a.id === item.area_comun);
                      return {
                        ...item,
                        area_comun: areaComun || null
                      } as InventarioDetallado;
                    });
                    
                    // Llamar a la función de exportación a Excel
                    exportToExcel(exportData, formatCurrency);
                  }}
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Exportar CSV
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2"
                  onClick={() => {
                    const currencyFormatter = new Intl.NumberFormat("es-VE", {
                      style: "currency",
                      currency: "VES",
                      minimumFractionDigits: 2,
                    });
                    
                    const formatCurrency = (value: string | number) => {
                      const numeric = typeof value === 'string' ? Number(value) : value;
                      if (Number.isNaN(numeric)) {
                        return String(value);
                      }
                      return currencyFormatter.format(numeric);
                    };
                    
                    // Convertir datos a formato para ExportButtons
                    const exportData = data.results.map(item => {
                      const areaComun = item.area_comun && areasComunes.find(a => a.id === item.area_comun);
                      return {
                        ...item,
                        area_comun: areaComun || null
                      } as InventarioDetallado;
                    });
                    
                    // Llamar a la función de exportación a PDF
                    exportToPDF(exportData, formatCurrency);
                  }}
                >
                  <FileText className="h-4 w-4" />
                  Exportar PDF
                </Button>
              </>
            )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Inventario</CardTitle>
          </CardHeader>
          <CardContent>
            <InventarioTable
              data={(data?.results ?? []).map(item => {
                // Convertir cada item de Inventario a InventarioDetallado
                const areaComun = item.area_comun && areasComunes.find(a => a.id === item.area_comun);
                
                return {
                  ...item,
                  area_comun: areaComun || null
                } as InventarioDetallado;
              })}
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

      <InventarioStore
        open={isStoreModalOpen}
        onClose={closeStoreModal}
        item={selectedItem}
        onSubmit={handleStoreSubmit}
        loading={loading && isStoreModalOpen}
        areasComunes={areasComunes}
      />

      <InventarioDelete
        open={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        item={selectedItem ?? null}
        loading={loading && isDeleteModalOpen}
      />
    </AdminLayout>
  );
};

export default InventarioPage;