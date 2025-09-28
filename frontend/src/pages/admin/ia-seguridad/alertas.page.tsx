import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  Eye,
  Check,
  X,
  Clock,
  User,
  Camera as CameraIcon,
  Calendar,
  Filter,
  Download,
  Bell,
  BellOff,
  UserX,
  Car,
  Dog,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AdminLayout from "@/app/layout/admin-layout";
import { iaSecurityService } from "@/services/iaSecurityService";
import type { SecurityAlert } from "@/types/ia-security";

const SecurityAlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Filtros
  const [filters, setFilters] = useState({
    estado: "todos",
    gravedad: "todas",
    tipo: "todos",
    fecha: "hoy",
  });

  // Toast placeholder
  const toast = (options: any) => {
    console.log("Toast:", options);
    alert(options.description);
  };

  useEffect(() => {
    loadSecurityAlerts();

    // Auto-refresh cada 30 segundos para alertas activas
    const interval = setInterval(loadSecurityAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadSecurityAlerts = async () => {
    try {
      setLoading(true);
      const data = await iaSecurityService.getSecurityAlerts();
      setAlerts(data);
    } catch (error) {
      console.error("Error al cargar alertas de seguridad:", error);
      toast({
        title: "Error",
        description:
          "No se pudieron cargar las alertas. Mostrando datos de ejemplo.",
        variant: "destructive",
      });

      // Datos de ejemplo
      setAlerts([
        {
          id: 1,
          tipo: "perro_suelto",
          descripcion: "Perro suelto detectado en área de piscina",
          gravedad: "media",
          fecha_deteccion: "2025-01-28T14:30:00Z",
          camara: "Cámara Piscina",
          imagen_evidencia: "/api/placeholder/400/300",
          estado: "activa",
          asignado_a: null,
          observaciones: "",
        },
        {
          id: 2,
          tipo: "vehiculo_mal_estacionado",
          descripcion:
            "Vehículo mal estacionado bloqueando acceso de emergencia",
          gravedad: "alta",
          fecha_deteccion: "2025-01-28T13:15:00Z",
          camara: "Cámara Estacionamiento",
          imagen_evidencia: "/api/placeholder/400/300",
          estado: "revisada",
          asignado_a: "Carlos Seguridad",
          observaciones: "Se notificó al propietario del vehículo ABC-123",
        },
        {
          id: 3,
          tipo: "comportamiento_sospechoso",
          descripcion: "Persona merodeando por perímetro durante la madrugada",
          gravedad: "critica",
          fecha_deteccion: "2025-01-28T02:45:00Z",
          camara: "Cámara Perímetro Norte",
          imagen_evidencia: "/api/placeholder/400/300",
          estado: "resuelta",
          asignado_a: "Juan Guardia",
          observaciones: "Se identificó como nuevo residente. Falsa alarma.",
        },
        {
          id: 4,
          tipo: "mascota_necesidades",
          descripcion:
            "Mascota haciendo necesidades en área común (jardín central)",
          gravedad: "baja",
          fecha_deteccion: "2025-01-28T11:20:00Z",
          camara: "Cámara Jardín Central",
          imagen_evidencia: "/api/placeholder/400/300",
          estado: "activa",
          asignado_a: null,
          observaciones: "",
        },
        {
          id: 5,
          tipo: "acceso_no_autorizado",
          descripcion: "Intento de acceso no autorizado a área restringida",
          gravedad: "critica",
          fecha_deteccion: "2025-01-28T10:15:00Z",
          camara: "Cámara Acceso Técnico",
          imagen_evidencia: "/api/placeholder/400/300",
          estado: "activa",
          asignado_a: "María Supervisora",
          observaciones: "Requiere intervención inmediata",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAlertStatus = async (
    alert: SecurityAlert,
    newStatus: SecurityAlert["estado"],
    observaciones?: string
  ) => {
    try {
      setProcessingId(alert.id);
      const updatedAlert = await iaSecurityService.updateAlertStatus(
        alert.id,
        newStatus,
        observaciones
      );
      setAlerts(alerts.map((a) => (a.id === alert.id ? updatedAlert : a)));
      toast({
        title: "Éxito",
        description: `Alerta marcada como ${newStatus}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la alerta.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleAssignAlert = async (
    alert: SecurityAlert,
    asignado_a: string
  ) => {
    try {
      const updatedAlert = await iaSecurityService.assignAlert(
        alert.id,
        asignado_a
      );
      setAlerts(alerts.map((a) => (a.id === alert.id ? updatedAlert : a)));
      toast({
        title: "Éxito",
        description: `Alerta asignada a ${asignado_a}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo asignar la alerta.",
        variant: "destructive",
      });
    }
  };

  const openAlertDialog = (alert: SecurityAlert) => {
    setSelectedAlert(alert);
    setIsDialogOpen(true);
  };

  const getStatusBadge = (estado: SecurityAlert["estado"]) => {
    switch (estado) {
      case "activa":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200 animate-pulse">
            Activa
          </Badge>
        );
      case "revisada":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            Revisada
          </Badge>
        );
      case "resuelta":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            Resuelta
          </Badge>
        );
      case "falsa_alarma":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
            Falsa Alarma
          </Badge>
        );
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  };

  const getGravityBadge = (gravedad: SecurityAlert["gravedad"]) => {
    switch (gravedad) {
      case "critica":
        return (
          <Badge className="bg-red-600 text-white hover:bg-red-700">
            Crítica
          </Badge>
        );
      case "alta":
        return (
          <Badge className="bg-orange-500 text-white hover:bg-orange-600">
            Alta
          </Badge>
        );
      case "media":
        return (
          <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">
            Media
          </Badge>
        );
      case "baja":
        return (
          <Badge className="bg-blue-500 text-white hover:bg-blue-600">
            Baja
          </Badge>
        );
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  };

  const getStatusIcon = (estado: SecurityAlert["estado"]) => {
    switch (estado) {
      case "activa":
        return <Bell className="h-5 w-5 text-red-600 animate-pulse" />;
      case "revisada":
        return <Eye className="h-5 w-5 text-yellow-600" />;
      case "resuelta":
        return <Check className="h-5 w-5 text-green-600" />;
      case "falsa_alarma":
        return <BellOff className="h-5 w-5 text-gray-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case "perro_suelto":
      case "mascota_necesidades":
        return <Dog className="h-5 w-5 text-brown-600" />;
      case "vehiculo_mal_estacionado":
        return <Car className="h-5 w-5 text-blue-600" />;
      case "comportamiento_sospechoso":
      case "acceso_no_autorizado":
        return <UserX className="h-5 w-5 text-red-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
    }
  };

  const getTypeDisplayName = (tipo: string) => {
    switch (tipo) {
      case "perro_suelto":
        return "Perro Suelto";
      case "vehiculo_mal_estacionado":
        return "Vehículo Mal Estacionado";
      case "comportamiento_sospechoso":
        return "Comportamiento Sospechoso";
      case "mascota_necesidades":
        return "Mascota - Necesidades";
      case "acceso_no_autorizado":
        return "Acceso No Autorizado";
      default:
        return tipo.replace("_", " ").toUpperCase();
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filters.estado !== "todos" && alert.estado !== filters.estado) {
      return false;
    }
    if (filters.gravedad !== "todas" && alert.gravedad !== filters.gravedad) {
      return false;
    }
    if (filters.tipo !== "todos" && alert.tipo !== filters.tipo) {
      return false;
    }
    if (filters.fecha === "hoy") {
      const today = new Date().toDateString();
      const alertDate = new Date(alert.fecha_deteccion).toDateString();
      return today === alertDate;
    }
    return true;
  });

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
              Alertas de Seguridad
            </h1>
            <p className="text-gray-600 mt-1">
              Alertas de comportamiento sospechoso detectadas automáticamente
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={loadSecurityAlerts}
              className="text-blue-600 border-blue-600"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
            <Button
              variant="outline"
              className="text-green-600 border-green-600"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Activas</p>
                  <p className="text-2xl font-bold text-red-600">
                    {filteredAlerts.filter((a) => a.estado === "activa").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Revisadas</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {
                      filteredAlerts.filter((a) => a.estado === "revisada")
                        .length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Check className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Resueltas</p>
                  <p className="text-2xl font-bold text-green-600">
                    {
                      filteredAlerts.filter((a) => a.estado === "resuelta")
                        .length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Críticas</p>
                  <p className="text-2xl font-bold text-red-600">
                    {
                      filteredAlerts.filter((a) => a.gravedad === "critica")
                        .length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {filteredAlerts.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Filtros:
                </span>
              </div>

              <Select
                value={filters.estado}
                onValueChange={(value) =>
                  setFilters({ ...filters, estado: value })
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="activa">Activas</SelectItem>
                  <SelectItem value="revisada">Revisadas</SelectItem>
                  <SelectItem value="resuelta">Resueltas</SelectItem>
                  <SelectItem value="falsa_alarma">Falsas Alarmas</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.gravedad}
                onValueChange={(value) =>
                  setFilters({ ...filters, gravedad: value })
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="critica">Crítica</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="baja">Baja</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.tipo}
                onValueChange={(value) =>
                  setFilters({ ...filters, tipo: value })
                }
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los tipos</SelectItem>
                  <SelectItem value="perro_suelto">Perro Suelto</SelectItem>
                  <SelectItem value="vehiculo_mal_estacionado">
                    Vehículo Mal Estacionado
                  </SelectItem>
                  <SelectItem value="comportamiento_sospechoso">
                    Comportamiento Sospechoso
                  </SelectItem>
                  <SelectItem value="mascota_necesidades">
                    Mascota - Necesidades
                  </SelectItem>
                  <SelectItem value="acceso_no_autorizado">
                    Acceso No Autorizado
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.fecha}
                onValueChange={(value) =>
                  setFilters({ ...filters, fecha: value })
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hoy">Hoy</SelectItem>
                  <SelectItem value="semana">Esta semana</SelectItem>
                  <SelectItem value="mes">Este mes</SelectItem>
                  <SelectItem value="todos">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Security Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlerts.map((alert) => (
            <Card
              key={alert.id}
              className={`hover:shadow-md transition-shadow ${
                alert.estado === "activa"
                  ? "ring-2 ring-red-200 ring-opacity-50"
                  : ""
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center">
                    {getStatusIcon(alert.estado)}
                    {getTypeIcon(alert.tipo)}
                    <span className="ml-2">#{alert.id}</span>
                  </CardTitle>
                  <div className="flex space-x-1">
                    {getGravityBadge(alert.gravedad)}
                    {getStatusBadge(alert.estado)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Alert Image */}
                  <div className="bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={alert.imagen_evidencia}
                      alt={`Evidencia alerta ${alert.id}`}
                      className="w-full h-32 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => openAlertDialog(alert)}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/api/placeholder/400/300";
                      }}
                    />
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="font-medium text-gray-600">Tipo:</p>
                      <p className="text-gray-900">
                        {getTypeDisplayName(alert.tipo)}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-600">Descripción:</p>
                      <p className="text-gray-900 text-sm">
                        {alert.descripcion}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Fecha:</span>
                      <span className="font-medium">
                        {new Date(alert.fecha_deteccion).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Hora:</span>
                      <span className="font-medium">
                        {new Date(alert.fecha_deteccion).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Cámara:</span>
                      <span className="font-medium text-xs">
                        {alert.camara}
                      </span>
                    </div>
                    {alert.asignado_a && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Asignado a:</span>
                        <span className="font-medium text-xs">
                          {alert.asignado_a}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Observaciones */}
                  {alert.observaciones && (
                    <div className="bg-gray-50 p-2 rounded text-xs">
                      <p className="text-gray-600 font-medium">
                        Observaciones:
                      </p>
                      <p className="text-gray-800 mt-1">
                        {alert.observaciones}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openAlertDialog(alert)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    {alert.estado === "activa" && (
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() =>
                          handleUpdateAlertStatus(
                            alert,
                            "revisada",
                            "Revisada por el operador"
                          )
                        }
                        disabled={processingId === alert.id}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Revisar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAlerts.length === 0 && (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay alertas
            </h3>
            <p className="text-gray-600">
              No se encontraron alertas con los filtros actuales.
            </p>
          </div>
        )}

        {/* Alert Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                {selectedAlert && getTypeIcon(selectedAlert.tipo)}
                <span className="ml-2">
                  Alerta #{selectedAlert?.id} -{" "}
                  {selectedAlert && getTypeDisplayName(selectedAlert.tipo)}
                </span>
              </DialogTitle>
            </DialogHeader>

            {selectedAlert && (
              <div className="space-y-4">
                {/* Alert Image */}
                <div className="bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={selectedAlert.imagen_evidencia}
                    alt={`Evidencia alerta ${selectedAlert.id}`}
                    className="w-full h-64 object-cover"
                  />
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Estado</Label>
                    <div className="mt-1">
                      {getStatusBadge(selectedAlert.estado)}
                    </div>
                  </div>
                  <div>
                    <Label>Gravedad</Label>
                    <div className="mt-1">
                      {getGravityBadge(selectedAlert.gravedad)}
                    </div>
                  </div>
                  <div>
                    <Label>Fecha de Detección</Label>
                    <p className="font-medium">
                      {new Date(selectedAlert.fecha_deteccion).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label>Cámara</Label>
                    <p className="font-medium">{selectedAlert.camara}</p>
                  </div>
                  <div className="col-span-2">
                    <Label>Descripción</Label>
                    <p className="font-medium">{selectedAlert.descripcion}</p>
                  </div>
                  {selectedAlert.asignado_a && (
                    <div>
                      <Label>Asignado a</Label>
                      <p className="font-medium">{selectedAlert.asignado_a}</p>
                    </div>
                  )}
                </div>

                {/* Observaciones */}
                <div>
                  <Label>Observaciones</Label>
                  <Textarea
                    value={selectedAlert.observaciones}
                    rows={3}
                    className="mt-1"
                    placeholder="Sin observaciones..."
                    readOnly
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                  >
                    Cerrar
                  </Button>
                  {selectedAlert.estado === "activa" && (
                    <>
                      <Button
                        onClick={() => {
                          handleUpdateAlertStatus(
                            selectedAlert,
                            "revisada",
                            "Revisada desde vista de detalles"
                          );
                          setIsDialogOpen(false);
                        }}
                        className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Marcar como Revisada
                      </Button>
                      <Button
                        onClick={() => {
                          handleUpdateAlertStatus(
                            selectedAlert,
                            "resuelta",
                            "Resuelta desde vista de detalles"
                          );
                          setIsDialogOpen(false);
                        }}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Marcar como Resuelta
                      </Button>
                    </>
                  )}
                  {selectedAlert.estado === "revisada" && (
                    <Button
                      onClick={() => {
                        handleUpdateAlertStatus(
                          selectedAlert,
                          "resuelta",
                          "Resuelta desde vista de detalles"
                        );
                        setIsDialogOpen(false);
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Marcar como Resuelta
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default SecurityAlertsPage;
