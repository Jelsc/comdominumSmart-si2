import React, { useEffect, useState } from "react";
import {
  LogIn,
  LogOut,
  Eye,
  Plus,
  User,
  Users,
  UserCheck,
  Clock,
  Calendar,
  Filter,
  Download,
  Search,
  Camera as CameraIcon,
  CheckCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
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
import type { AccessLog } from "@/types/ia-security";

const AccessLogPage: React.FC = () => {
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccess, setSelectedAccess] = useState<AccessLog | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddingManual, setIsAddingManual] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Filtros
  const [filters, setFilters] = useState({
    tipo: "todos",
    persona_tipo: "todos",
    fecha: "hoy",
    autorizado: "todos",
    metodo_deteccion: "todos",
  });

  // Formulario para acceso manual
  const [manualAccessForm, setManualAccessForm] = useState({
    tipo: "ingreso" as AccessLog["tipo"],
    persona_tipo: "visitante" as AccessLog["persona_tipo"],
    nombre: "",
    observaciones: "",
    autorizado: true,
  });

  // Toast placeholder
  const toast = (options: any) => {
    console.log("Toast:", options);
    alert(options.description);
  };

  useEffect(() => {
    loadAccessLogs();

    // Auto-refresh cada 60 segundos
    const interval = setInterval(loadAccessLogs, 60000);
    return () => clearInterval(interval);
  }, [filters]);

  const loadAccessLogs = async () => {
    try {
      setLoading(true);
      const filterParams: any = {};
      if (filters.fecha === "hoy") {
        filterParams.fecha_inicio = new Date().toISOString().split("T")[0];
      }
      if (filters.tipo !== "todos") {
        filterParams.tipo = filters.tipo;
      }
      if (filters.persona_tipo !== "todos") {
        filterParams.persona_tipo = filters.persona_tipo;
      }

      const data = await iaSecurityService.getAccessLogs(filterParams);
      setAccessLogs(data);
    } catch (error) {
      console.error("Error al cargar registro de accesos:", error);
      toast({
        title: "Error",
        description:
          "No se pudo cargar el registro de accesos. Mostrando datos de ejemplo.",
        variant: "destructive",
      });

      // Datos de ejemplo
      setAccessLogs([
        {
          id: 1,
          tipo: "ingreso",
          persona_tipo: "residente",
          persona_id: 1,
          nombre: "Juan Pérez",
          foto: "/api/placeholder/100/100",
          fecha_hora: "2025-01-28T14:30:00Z",
          camara: "Cámara Principal Entrada",
          metodo_deteccion: "facial",
          autorizado: true,
          observaciones: "Reconocimiento facial exitoso",
        },
        {
          id: 2,
          tipo: "salida",
          persona_tipo: "visitante",
          persona_id: null,
          nombre: "María Visitante",
          foto: "/api/placeholder/100/100",
          fecha_hora: "2025-01-28T13:45:00Z",
          camara: "Cámara Principal Entrada",
          metodo_deteccion: "manual",
          autorizado: true,
          observaciones: "Visitante autorizado por residente Juan Pérez",
        },
        {
          id: 3,
          tipo: "ingreso",
          persona_tipo: "personal",
          persona_id: 2,
          nombre: "Carlos Mantenimiento",
          foto: "/api/placeholder/100/100",
          fecha_hora: "2025-01-28T12:00:00Z",
          camara: "Cámara Servicio",
          metodo_deteccion: "qr",
          autorizado: true,
          observaciones: "Personal de mantenimiento - turno mañana",
        },
        {
          id: 4,
          tipo: "ingreso",
          persona_tipo: "visitante",
          persona_id: null,
          nombre: "Desconocido",
          foto: "/api/placeholder/100/100",
          fecha_hora: "2025-01-28T11:30:00Z",
          camara: "Cámara Principal Entrada",
          metodo_deteccion: "facial",
          autorizado: false,
          observaciones: "Acceso denegado - no autorizado",
        },
        {
          id: 5,
          tipo: "salida",
          persona_tipo: "residente",
          persona_id: 3,
          nombre: "Ana González",
          foto: "/api/placeholder/100/100",
          fecha_hora: "2025-01-28T10:15:00Z",
          camara: "Cámara Garaje",
          metodo_deteccion: "facial",
          autorizado: true,
          observaciones: "Salida vehicular registrada",
        },
        {
          id: 6,
          tipo: "ingreso",
          persona_tipo: "visitante",
          persona_id: null,
          nombre: "Pedro Delivery",
          foto: "/api/placeholder/100/100",
          fecha_hora: "2025-01-28T09:45:00Z",
          camara: "Cámara Principal Entrada",
          metodo_deteccion: "manual",
          autorizado: true,
          observaciones: "Delivery autorizado - apartamento 301",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateManualAccess = async () => {
    try {
      const newAccess: Partial<AccessLog> = {
        ...manualAccessForm,
        fecha_hora: new Date().toISOString(),
        camara: "Manual - Guardianía",
        metodo_deteccion: "manual",
        foto: "/api/placeholder/100/100",
      };

      const createdAccess = await iaSecurityService.createManualAccess(
        newAccess
      );
      setAccessLogs([createdAccess, ...accessLogs]);

      toast({
        title: "Éxito",
        description: "Registro de acceso manual creado correctamente.",
      });

      setIsAddingManual(false);
      resetManualForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el registro manual.",
        variant: "destructive",
      });
    }
  };

  const resetManualForm = () => {
    setManualAccessForm({
      tipo: "ingreso",
      persona_tipo: "visitante",
      nombre: "",
      observaciones: "",
      autorizado: true,
    });
  };

  const openAccessDialog = (access: AccessLog) => {
    setSelectedAccess(access);
    setIsDialogOpen(true);
  };

  const getTypeBadge = (tipo: AccessLog["tipo"]) => {
    return tipo === "ingreso" ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
        Ingreso
      </Badge>
    ) : (
      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
        Salida
      </Badge>
    );
  };

  const getPersonTypeBadge = (persona_tipo: AccessLog["persona_tipo"]) => {
    switch (persona_tipo) {
      case "residente":
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
            Residente
          </Badge>
        );
      case "visitante":
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">
            Visitante
          </Badge>
        );
      case "personal":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            Personal
          </Badge>
        );
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  };

  const getMethodBadge = (metodo: AccessLog["metodo_deteccion"]) => {
    switch (metodo) {
      case "facial":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            Facial
          </Badge>
        );
      case "manual":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
            Manual
          </Badge>
        );
      case "qr":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            QR
          </Badge>
        );
      default:
        return <Badge variant="secondary">Otro</Badge>;
    }
  };

  const getTypeIcon = (tipo: AccessLog["tipo"]) => {
    return tipo === "ingreso" ? (
      <LogIn className="h-5 w-5 text-green-600" />
    ) : (
      <LogOut className="h-5 w-5 text-blue-600" />
    );
  };

  const getPersonTypeIcon = (persona_tipo: AccessLog["persona_tipo"]) => {
    switch (persona_tipo) {
      case "residente":
        return <UserCheck className="h-5 w-5 text-purple-600" />;
      case "visitante":
        return <User className="h-5 w-5 text-orange-600" />;
      case "personal":
        return <Users className="h-5 w-5 text-blue-600" />;
      default:
        return <User className="h-5 w-5 text-gray-600" />;
    }
  };

  const getAuthorizationIcon = (autorizado: boolean) => {
    return autorizado ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const filteredAccessLogs = accessLogs.filter((access) => {
    if (filters.tipo !== "todos" && access.tipo !== filters.tipo) return false;
    if (
      filters.persona_tipo !== "todos" &&
      access.persona_tipo !== filters.persona_tipo
    )
      return false;
    if (
      filters.autorizado !== "todos" &&
      access.autorizado.toString() !== filters.autorizado
    )
      return false;
    if (
      filters.metodo_deteccion !== "todos" &&
      access.metodo_deteccion !== filters.metodo_deteccion
    )
      return false;
    if (
      searchTerm &&
      !access.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;

    if (filters.fecha === "hoy") {
      const today = new Date().toDateString();
      const accessDate = new Date(access.fecha_hora).toDateString();
      return today === accessDate;
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
              Registro de Accesos
            </h1>
            <p className="text-gray-600 mt-1">
              Registro automático de ingresos/salidas con foto y control de
              acceso
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => setIsAddingManual(true)}
              variant="outline"
              className="text-green-600 border-green-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Registro Manual
            </Button>
            <Button variant="outline" className="text-blue-600 border-blue-600">
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
                <LogIn className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Ingresos Hoy
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {
                      filteredAccessLogs.filter(
                        (a) =>
                          a.tipo === "ingreso" &&
                          new Date(a.fecha_hora).toDateString() ===
                            new Date().toDateString()
                      ).length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <LogOut className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Salidas Hoy
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {
                      filteredAccessLogs.filter(
                        (a) =>
                          a.tipo === "salida" &&
                          new Date(a.fecha_hora).toDateString() ===
                            new Date().toDateString()
                      ).length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Residentes
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {
                      filteredAccessLogs.filter(
                        (a) => a.persona_tipo === "residente"
                      ).length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Visitantes
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {
                      filteredAccessLogs.filter(
                        (a) => a.persona_tipo === "visitante"
                      ).length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Autorizados
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {filteredAccessLogs.filter((a) => a.autorizado).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4 flex-wrap gap-4">
              <div className="flex items-center space-x-2 flex-1 min-w-60">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Buscar por nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Filtros:
                </span>
              </div>

              <Select
                value={filters.tipo}
                onValueChange={(value) =>
                  setFilters({ ...filters, tipo: value })
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ingreso">Ingresos</SelectItem>
                  <SelectItem value="salida">Salidas</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.persona_tipo}
                onValueChange={(value) =>
                  setFilters({ ...filters, persona_tipo: value })
                }
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="residente">Residentes</SelectItem>
                  <SelectItem value="visitante">Visitantes</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.autorizado}
                onValueChange={(value) =>
                  setFilters({ ...filters, autorizado: value })
                }
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="true">Autorizados</SelectItem>
                  <SelectItem value="false">No autorizados</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.metodo_deteccion}
                onValueChange={(value) =>
                  setFilters({ ...filters, metodo_deteccion: value })
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="facial">Facial</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="qr">QR</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.fecha}
                onValueChange={(value) =>
                  setFilters({ ...filters, fecha: value })
                }
              >
                <SelectTrigger className="w-32">
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

        {/* Access Logs List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Registro de Accesos ({filteredAccessLogs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredAccessLogs.map((access) => (
                <div
                  key={access.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => openAccessDialog(access)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(access.tipo)}
                      {access.tipo === "ingreso" ? (
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ArrowLeft className="h-4 w-4 text-gray-400" />
                      )}
                    </div>

                    <Avatar className="h-12 w-12">
                      <AvatarImage src={access.foto} alt={access.nombre} />
                      <AvatarFallback>
                        {getPersonTypeIcon(access.persona_tipo)}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900">
                          {access.nombre}
                        </p>
                        {getAuthorizationIcon(access.autorizado)}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        {getPersonTypeBadge(access.persona_tipo)}
                        {getMethodBadge(access.metodo_deteccion)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      {getTypeBadge(access.tipo)}
                      <Clock className="h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(access.fecha_hora).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">{access.camara}</p>
                  </div>
                </div>
              ))}

              {filteredAccessLogs.length === 0 && (
                <div className="text-center py-12">
                  <LogIn className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay registros de acceso
                  </h3>
                  <p className="text-gray-600">
                    No se encontraron registros con los filtros actuales.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Access Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                {selectedAccess && getTypeIcon(selectedAccess.tipo)}
                <span className="ml-2">
                  Detalles de Acceso #{selectedAccess?.id}
                </span>
              </DialogTitle>
            </DialogHeader>

            {selectedAccess && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Avatar className="h-24 w-24 border-2 border-gray-200">
                    <AvatarImage
                      src={selectedAccess.foto}
                      alt={selectedAccess.nombre}
                    />
                    <AvatarFallback>
                      {getPersonTypeIcon(selectedAccess.persona_tipo)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre</Label>
                    <p className="font-medium">{selectedAccess.nombre}</p>
                  </div>
                  <div>
                    <Label>Tipo</Label>
                    <div className="mt-1">
                      {getTypeBadge(selectedAccess.tipo)}
                    </div>
                  </div>
                  <div>
                    <Label>Tipo de Persona</Label>
                    <div className="mt-1">
                      {getPersonTypeBadge(selectedAccess.persona_tipo)}
                    </div>
                  </div>
                  <div>
                    <Label>Método</Label>
                    <div className="mt-1">
                      {getMethodBadge(selectedAccess.metodo_deteccion)}
                    </div>
                  </div>
                  <div>
                    <Label>Fecha y Hora</Label>
                    <p className="font-medium">
                      {new Date(selectedAccess.fecha_hora).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label>Cámara</Label>
                    <p className="font-medium text-sm">
                      {selectedAccess.camara}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <Label>Estado</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      {getAuthorizationIcon(selectedAccess.autorizado)}
                      <span
                        className={
                          selectedAccess.autorizado
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {selectedAccess.autorizado
                          ? "Autorizado"
                          : "No autorizado"}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedAccess.observaciones && (
                  <div>
                    <Label>Observaciones</Label>
                    <p className="text-sm text-gray-700 mt-1 p-2 bg-gray-50 rounded">
                      {selectedAccess.observaciones}
                    </p>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Manual Access Dialog */}
        <Dialog open={isAddingManual} onOpenChange={setIsAddingManual}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Registro Manual de Acceso</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo de Acceso</Label>
                  <Select
                    value={manualAccessForm.tipo}
                    onValueChange={(value: AccessLog["tipo"]) =>
                      setManualAccessForm({ ...manualAccessForm, tipo: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ingreso">Ingreso</SelectItem>
                      <SelectItem value="salida">Salida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Tipo de Persona</Label>
                  <Select
                    value={manualAccessForm.persona_tipo}
                    onValueChange={(value: AccessLog["persona_tipo"]) =>
                      setManualAccessForm({
                        ...manualAccessForm,
                        persona_tipo: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residente">Residente</SelectItem>
                      <SelectItem value="visitante">Visitante</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Nombre</Label>
                <Input
                  value={manualAccessForm.nombre}
                  onChange={(e) =>
                    setManualAccessForm({
                      ...manualAccessForm,
                      nombre: e.target.value,
                    })
                  }
                  placeholder="Nombre completo"
                />
              </div>

              <div>
                <Label>Observaciones</Label>
                <Textarea
                  value={manualAccessForm.observaciones}
                  onChange={(e) =>
                    setManualAccessForm({
                      ...manualAccessForm,
                      observaciones: e.target.value,
                    })
                  }
                  placeholder="Observaciones adicionales..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autorizado"
                  checked={manualAccessForm.autorizado}
                  onChange={(e) =>
                    setManualAccessForm({
                      ...manualAccessForm,
                      autorizado: e.target.checked,
                    })
                  }
                />
                <Label htmlFor="autorizado">Acceso autorizado</Label>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingManual(false);
                    resetManualForm();
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button onClick={handleCreateManualAccess} className="flex-1">
                  Registrar Acceso
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AccessLogPage;
