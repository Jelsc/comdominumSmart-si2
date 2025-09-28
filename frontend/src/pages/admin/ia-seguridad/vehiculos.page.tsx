import React, { useEffect, useState } from "react";
import {
  Car,
  Eye,
  Check,
  X,
  Search,
  AlertCircle,
  Camera,
  Calendar,
  Filter,
  Download,
  Scan,
  Shield,
  ShieldCheck,
  Plus,
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
import CameraCapture from "@/components/CameraCapture";
import { iaSecurityService, aiService } from "@/services";
import type { VehicleRecognition } from "@/types/ia-security";

const VehicleRecognitionPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<VehicleRecognition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] =
    useState<VehicleRecognition | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [searchPlate, setSearchPlate] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Toast notifications
  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    if (type === "error") {
      alert(`❌ ${message}`);
    } else {
      alert(`✅ ${message}`);
    }
  };

  // Filtros
  const [filters, setFilters] = useState({
    autorizado: "todos",
    fecha: "hoy",
    tipo_vehiculo: "todos",
  });

  // Toast placeholder
  const toast = (options: any) => {
    console.log("Toast:", options);
    alert(options.description);
  };

  useEffect(() => {
    loadVehicleRecognitions();
  }, []);

  const loadVehicleRecognitions = async () => {
    try {
      setLoading(true);
      const data = await iaSecurityService.getVehicleRecognitions();
      setVehicles(data);
    } catch (error) {
      console.error("Error al cargar reconocimientos de vehículos:", error);
      toast({
        title: "Error",
        description:
          "No se pudieron cargar los reconocimientos. Mostrando datos de ejemplo.",
        variant: "destructive",
      });

      // Datos de ejemplo
      setVehicles([
        {
          id: 1,
          placa: "ABC-123",
          propietario: "Juan Pérez",
          tipo_vehiculo: "Automóvil",
          color: "Blanco",
          foto: "/api/placeholder/300/200",
          fecha_reconocimiento: "2025-01-28T14:30:00Z",
          camara: "Cámara Principal Entrada",
          confianza: 95,
          autorizado: true,
        },
        {
          id: 2,
          placa: "XYZ-789",
          propietario: "Desconocido",
          tipo_vehiculo: "Camioneta",
          color: "Negro",
          foto: "/api/placeholder/300/200",
          fecha_reconocimiento: "2025-01-28T13:15:00Z",
          camara: "Cámara Garaje",
          confianza: 88,
          autorizado: false,
        },
        {
          id: 3,
          placa: "DEF-456",
          propietario: "María González",
          tipo_vehiculo: "Motocicleta",
          color: "Rojo",
          foto: "/api/placeholder/300/200",
          fecha_reconocimiento: "2025-01-28T12:45:00Z",
          camara: "Cámara Estacionamiento",
          confianza: 92,
          autorizado: true,
        },
        {
          id: 4,
          placa: "GHI-012",
          propietario: "Desconocido",
          tipo_vehiculo: "Automóvil",
          color: "Azul",
          foto: "/api/placeholder/300/200",
          fecha_reconocimiento: "2025-01-28T11:20:00Z",
          camara: "Cámara Principal Entrada",
          confianza: 78,
          autorizado: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Función para procesar imagen capturada
  const handleCaptureImage = async (imageData: string) => {
    setIsProcessing(true);
    try {
      // Convertir base64 a blob
      const response = await fetch(imageData);
      const blob = await response.blob();

      // Procesar con IA para reconocer placa
      const result = await aiService.recognizePlate(blob);

      if (!result.success || !result.data.plateNumber) {
        showToast(
          "No se pudo reconocer la placa en la imagen. Intente con otra foto.",
          "error"
        );
        return;
      }

      const plateNumber = result.data.plateNumber;
      showToast(
        `Placa reconocida: ${plateNumber} (Confianza: ${Math.round(
          (result.data.confidence || 0) * 100
        )}%)`
      );

      // Buscar vehículo en la base de datos
      const existingVehicle = vehicles.find(
        (v) => v.placa.toLowerCase() === plateNumber.toLowerCase()
      );

      if (existingVehicle) {
        showToast(
          `Vehículo encontrado: ${existingVehicle.propietario || "Desconocido"}`
        );
        setSelectedVehicle(existingVehicle);
        setIsDialogOpen(true);
      } else {
        showToast(`Vehículo no autorizado detectado: ${plateNumber}`, "error");
      }

      setShowCamera(false);
    } catch (error) {
      console.error("Error processing image:", error);
      showToast("Error al procesar la imagen. Intente nuevamente.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Función para procesar archivo seleccionado
  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    try {
      // Procesar con IA para reconocer placa
      const result = await aiService.recognizePlate(file);

      if (!result.success || !result.data.plateNumber) {
        showToast(
          "No se pudo reconocer la placa en la imagen seleccionada.",
          "error"
        );
        return;
      }

      const plateNumber = result.data.plateNumber;
      showToast(
        `Placa reconocida: ${plateNumber} (Confianza: ${Math.round(
          (result.data.confidence || 0) * 100
        )}%)`
      );

      // Buscar vehículo en la base de datos
      const existingVehicle = vehicles.find(
        (v) => v.placa.toLowerCase() === plateNumber.toLowerCase()
      );

      if (existingVehicle) {
        showToast(
          `Vehículo encontrado: ${existingVehicle.propietario || "Desconocido"}`
        );
        setSelectedVehicle(existingVehicle);
        setIsDialogOpen(true);
      } else {
        showToast(`Vehículo no autorizado detectado: ${plateNumber}`, "error");
      }

      setShowCamera(false);
    } catch (error) {
      console.error("Error processing file:", error);
      showToast("Error al procesar el archivo. Intente nuevamente.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Función para escanear placa en tiempo real
  const handleScanPlate = () => {
    setShowCamera(true);
  };

  const handleAuthorizeVehicle = async (vehicle: VehicleRecognition) => {
    try {
      setProcessingId(vehicle.id);
      const updatedVehicle = await iaSecurityService.authorizeVehicle(
        vehicle.id
      );
      setVehicles(
        vehicles.map((v) => (v.id === vehicle.id ? updatedVehicle : v))
      );
      toast({
        title: "Éxito",
        description: "Vehículo autorizado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo autorizar el vehículo.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDenyVehicle = async (
    vehicle: VehicleRecognition,
    razon: string
  ) => {
    try {
      setProcessingId(vehicle.id);
      const updatedVehicle = await iaSecurityService.denyVehicle(
        vehicle.id,
        razon
      );
      setVehicles(
        vehicles.map((v) => (v.id === vehicle.id ? updatedVehicle : v))
      );
      toast({
        title: "Éxito",
        description: "Vehículo denegado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo denegar el vehículo.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const openVehicleDialog = (vehicle: VehicleRecognition) => {
    setSelectedVehicle(vehicle);
    setIsDialogOpen(true);
  };

  const getStatusBadge = (autorizado: boolean, confianza: number) => {
    if (autorizado) {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          Autorizado
        </Badge>
      );
    } else if (confianza < 80) {
      return (
        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">
          Baja confianza
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
          No autorizado
        </Badge>
      );
    }
  };

  const getStatusIcon = (autorizado: boolean) => {
    return autorizado ? (
      <ShieldCheck className="h-5 w-5 text-green-600" />
    ) : (
      <Shield className="h-5 w-5 text-red-600" />
    );
  };

  const getConfidenceColor = (confianza: number) => {
    if (confianza >= 90) return "text-green-600";
    if (confianza >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  const getVehicleTypeIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case "motocicleta":
        return "🏍️";
      case "camioneta":
        return "🚙";
      default:
        return "🚗";
    }
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    if (
      filters.autorizado !== "todos" &&
      vehicle.autorizado.toString() !== filters.autorizado
    ) {
      return false;
    }

    if (
      searchPlate &&
      !vehicle.placa.toLowerCase().includes(searchPlate.toLowerCase())
    ) {
      return false;
    }

    if (
      filters.tipo_vehiculo !== "todos" &&
      vehicle.tipo_vehiculo !== filters.tipo_vehiculo
    ) {
      return false;
    }

    if (filters.fecha === "hoy") {
      const today = new Date().toDateString();
      const vehicleDate = new Date(vehicle.fecha_reconocimiento).toDateString();
      return today === vehicleDate;
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
              Identificación de Vehículos
            </h1>
            <p className="text-gray-600 mt-1">
              Lectura automática de placas con OCR y control de acceso
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={handleScanPlate}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              <Scan className="h-4 w-4 mr-2" />
              {isProcessing ? "Procesando..." : "Escanear Placa"}
            </Button>
            <Button variant="outline" className="text-blue-600 border-blue-600">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Autorizados
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {filteredVehicles.filter((v) => v.autorizado).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    No autorizados
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {filteredVehicles.filter((v) => !v.autorizado).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Scan className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Alta confianza
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {filteredVehicles.filter((v) => v.confianza >= 90).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Car className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {filteredVehicles.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 flex-1">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Buscar por placa..."
                  value={searchPlate}
                  onChange={(e) => setSearchPlate(e.target.value)}
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
                value={filters.autorizado}
                onValueChange={(value) =>
                  setFilters({ ...filters, autorizado: value })
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="true">Autorizados</SelectItem>
                  <SelectItem value="false">No autorizados</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.tipo_vehiculo}
                onValueChange={(value) =>
                  setFilters({ ...filters, tipo_vehiculo: value })
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Automóvil">Automóvil</SelectItem>
                  <SelectItem value="Camioneta">Camioneta</SelectItem>
                  <SelectItem value="Motocicleta">Motocicleta</SelectItem>
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

        {/* Vehicle Recognition List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <Card
              key={vehicle.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center">
                    {getStatusIcon(vehicle.autorizado)}
                    <span className="ml-2 text-2xl">
                      {getVehicleTypeIcon(vehicle.tipo_vehiculo)}
                    </span>
                    <span className="ml-2 font-mono font-bold">
                      {vehicle.placa}
                    </span>
                  </CardTitle>
                  {getStatusBadge(vehicle.autorizado, vehicle.confianza)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Vehicle Photo */}
                  <div className="bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={vehicle.foto}
                      alt={`Vehículo ${vehicle.placa}`}
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/api/placeholder/300/200";
                      }}
                    />
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Propietario:</span>
                      <span className="font-medium">{vehicle.propietario}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Tipo:</span>
                      <span className="font-medium">
                        {vehicle.tipo_vehiculo}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Color:</span>
                      <span className="font-medium">{vehicle.color}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Fecha:</span>
                      <span className="font-medium">
                        {new Date(
                          vehicle.fecha_reconocimiento
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Hora:</span>
                      <span className="font-medium">
                        {new Date(
                          vehicle.fecha_reconocimiento
                        ).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Cámara:</span>
                      <span className="font-medium text-xs">
                        {vehicle.camara}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Confianza OCR:</span>
                      <span
                        className={`font-medium ${getConfidenceColor(
                          vehicle.confianza
                        )}`}
                      >
                        {vehicle.confianza}%
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-2">
                    {!vehicle.autorizado ? (
                      <>
                        <Button
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => handleAuthorizeVehicle(vehicle)}
                          disabled={processingId === vehicle.id}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Autorizar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() =>
                            handleDenyVehicle(
                              vehicle,
                              "Vehículo no autorizado por seguridad"
                            )
                          }
                          disabled={processingId === vehicle.id}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Denegar
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => openVehicleDialog(vehicle)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Detalles
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredVehicles.length === 0 && (
          <div className="text-center py-12">
            <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay vehículos detectados
            </h3>
            <p className="text-gray-600">
              No se encontraron vehículos con los filtros actuales.
            </p>
          </div>
        )}

        {/* Vehicle Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <span className="text-2xl mr-2">
                  {selectedVehicle &&
                    getVehicleTypeIcon(selectedVehicle.tipo_vehiculo)}
                </span>
                Detalles del Vehículo {selectedVehicle?.placa}
              </DialogTitle>
            </DialogHeader>

            {selectedVehicle && (
              <div className="space-y-4">
                {/* Vehicle Photo */}
                <div className="bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={selectedVehicle.foto}
                    alt={`Vehículo ${selectedVehicle.placa}`}
                    className="w-full h-48 object-cover"
                  />
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Placa</Label>
                    <p className="font-mono font-bold text-lg">
                      {selectedVehicle.placa}
                    </p>
                  </div>
                  <div>
                    <Label>Estado</Label>
                    <div className="mt-1">
                      {getStatusBadge(
                        selectedVehicle.autorizado,
                        selectedVehicle.confianza
                      )}
                    </div>
                  </div>
                  <div>
                    <Label>Propietario</Label>
                    <p className="font-medium">{selectedVehicle.propietario}</p>
                  </div>
                  <div>
                    <Label>Tipo de Vehículo</Label>
                    <p className="font-medium">
                      {selectedVehicle.tipo_vehiculo}
                    </p>
                  </div>
                  <div>
                    <Label>Color</Label>
                    <p className="font-medium">{selectedVehicle.color}</p>
                  </div>
                  <div>
                    <Label>Confianza OCR</Label>
                    <p
                      className={`font-medium ${getConfidenceColor(
                        selectedVehicle.confianza
                      )}`}
                    >
                      {selectedVehicle.confianza}%
                    </p>
                  </div>
                  <div>
                    <Label>Fecha de Reconocimiento</Label>
                    <p className="font-medium">
                      {new Date(
                        selectedVehicle.fecha_reconocimiento
                      ).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label>Cámara</Label>
                    <p className="font-medium">{selectedVehicle.camara}</p>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                  >
                    Cerrar
                  </Button>
                  {!selectedVehicle.autorizado && (
                    <>
                      <Button
                        onClick={() => {
                          handleAuthorizeVehicle(selectedVehicle);
                          setIsDialogOpen(false);
                        }}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Autorizar
                      </Button>
                      <Button
                        onClick={() => {
                          handleDenyVehicle(
                            selectedVehicle,
                            "Denegado desde vista de detalles"
                          );
                          setIsDialogOpen(false);
                        }}
                        variant="outline"
                        className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Denegar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Camera Capture Modal */}
        {showCamera && (
          <CameraCapture
            onCapture={handleCaptureImage}
            onFileSelect={handleFileSelect}
            onClose={() => setShowCamera(false)}
            title="Escanear Placa de Vehículo"
            isProcessing={isProcessing}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default VehicleRecognitionPage;
