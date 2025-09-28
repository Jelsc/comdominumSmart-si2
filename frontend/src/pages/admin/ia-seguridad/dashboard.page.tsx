import React, { useEffect, useState } from "react";
import {
  Camera,
  Users,
  Car,
  AlertTriangle,
  Eye,
  TrendingUp,
  Shield,
  Activity,
  MonitorSpeaker,
  UserCheck,
  CarFront,
  Bell,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlaceholderImage } from "@/components/ui/placeholder-image";
import { useNavigate } from "react-router-dom";
import { iaSecurityService } from "@/services/iaSecurityService";
import type { DashboardStats } from "@/services/iaSecurityService";
import AdminLayout from "@/app/layout/admin-layout";

const IASecurityDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const data = await iaSecurityService.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error("Error al cargar estadísticas del dashboard:", err);
        setError("Error al cargar las estadísticas");
        // Datos de demo para mostrar la interfaz
        setStats({
          camaras_activas: 8,
          total_camaras: 10,
          reconocimientos_hoy: 45,
          visitantes_detectados: 12,
          alertas_activas: 3,
          vehiculos_registrados: 28,
          ingresos_hoy: 67,
          salidas_hoy: 52,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();

    // Actualizar cada 30 segundos
    const interval = setInterval(fetchDashboardStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (activas: number, total: number) => {
    const percentage = (activas / total) * 100;
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getAlertColor = (count: number) => {
    if (count === 0) return "text-green-600";
    if (count <= 2) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Seguridad con IA
            </h1>
            <p className="text-gray-600 mt-1">
              Control centralizado de cámaras con visión artificial
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => navigate("/admin/ia-seguridad/monitoreo")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <MonitorSpeaker className="h-4 w-4 mr-2" />
              Monitoreo en Vivo
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/admin/ia-seguridad/configuracion")}
            >
              <Activity className="h-4 w-4 mr-2" />
              Configuración
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  {error} - Mostrando datos de demostración
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Cámaras Activas
              </CardTitle>
              <Camera className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <span
                  className={getStatusColor(
                    stats?.camaras_activas || 0,
                    stats?.total_camaras || 1
                  )}
                >
                  {stats?.camaras_activas}
                </span>
                <span className="text-gray-500">/{stats?.total_camaras}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round(
                  ((stats?.camaras_activas || 0) /
                    (stats?.total_camaras || 1)) *
                    100
                )}
                % operativas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Reconocimientos Hoy
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats?.reconocimientos_hoy || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Residentes identificados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Visitantes Detectados
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats?.visitantes_detectados || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Pendientes de autorización
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Alertas Activas
              </CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${getAlertColor(
                  stats?.alertas_activas || 0
                )}`}
              >
                {stats?.alertas_activas || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Requieren atención
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Navigation */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="cameras">Cámaras</TabsTrigger>
            <TabsTrigger value="access">Accesos</TabsTrigger>
            <TabsTrigger value="alerts">Alertas</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Accesos de Hoy */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                    Accesos del Día
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Ingresos</span>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        {stats?.ingresos_hoy || 0}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Salidas</span>
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-800"
                      >
                        {stats?.salidas_hoy || 0}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Vehículos Registrados
                      </span>
                      <Badge
                        variant="secondary"
                        className="bg-purple-100 text-purple-800"
                      >
                        {stats?.vehiculos_registrados || 0}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    className="w-full mt-4"
                    variant="outline"
                    onClick={() => navigate("/admin/ia-seguridad/accesos")}
                  >
                    Ver Registro Completo
                  </Button>
                </CardContent>
              </Card>

              {/* Módulos Rápidos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-blue-600" />
                    Acceso Rápido
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex flex-col"
                      onClick={() =>
                        navigate("/admin/ia-seguridad/reconocimiento-facial")
                      }
                    >
                      <UserCheck className="h-6 w-6 mb-2 text-blue-600" />
                      <span className="text-xs">Reconocimiento Facial</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex flex-col"
                      onClick={() => navigate("/admin/ia-seguridad/visitantes")}
                    >
                      <Users className="h-6 w-6 mb-2 text-green-600" />
                      <span className="text-xs">Visitantes</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex flex-col"
                      onClick={() => navigate("/admin/ia-seguridad/vehiculos")}
                    >
                      <CarFront className="h-6 w-6 mb-2 text-purple-600" />
                      <span className="text-xs">Vehículos</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex flex-col"
                      onClick={() => navigate("/admin/ia-seguridad/alertas")}
                    >
                      <AlertTriangle className="h-6 w-6 mb-2 text-red-600" />
                      <span className="text-xs">Alertas</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="cameras">
            <Card>
              <CardHeader>
                <CardTitle>Estado de Cámaras</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 py-8">
                  Cargando información de cámaras...
                </p>
                <Button
                  className="w-full"
                  onClick={() => navigate("/admin/ia-seguridad/camaras")}
                >
                  Administrar Cámaras
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="access">
            <Card>
              <CardHeader>
                <CardTitle>Registro de Accesos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 py-8">
                  Cargando registro de accesos...
                </p>
                <Button
                  className="w-full"
                  onClick={() => navigate("/admin/ia-seguridad/accesos")}
                >
                  Ver Registro Completo
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle>Alertas Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 py-8">
                  Cargando alertas...
                </p>
                <Button
                  className="w-full"
                  onClick={() => navigate("/admin/ia-seguridad/alertas")}
                >
                  Ver Todas las Alertas
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default IASecurityDashboard;
