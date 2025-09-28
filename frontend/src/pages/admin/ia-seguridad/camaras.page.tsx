import React, { useEffect, useState } from "react";
import {
  Camera as CameraIcon,
  Plus,
  Eye,
  Settings,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Wifi,
  WifiOff,
  AlertCircle,
  CheckCircle,
  Video,
  VideoOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import AdminLayout from "@/app/layout/admin-layout";
import CameraCapture from "@/components/CameraCapture";
import { iaSecurityService, aiService } from "@/services";
import type { Camera } from "@/types/ia-security";

const CameraManagementPage: React.FC = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [activeCameraStreams, setActiveCameraStreams] = useState<{
    [key: number]: MediaStream | null;
  }>({});
  const [liveViewCamera, setLiveViewCamera] = useState<Camera | null>(null);
  const [showLiveView, setShowLiveView] = useState(false);

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

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: "",
    ubicacion: "",
    tipo: "fija",
    ip: "",
    puerto: 554,
    estado: "activa" as Camera["estado"],
    configuracion: {},
  });

  useEffect(() => {
    loadCameras();
  }, []);

  const loadCameras = async () => {
    try {
      setLoading(true);
      const data = await iaSecurityService.getCameras();
      setCameras(data);
    } catch (error) {
      console.error("Error al cargar cámaras:", error);
      showToast(
        "No se pudieron cargar las cámaras. Mostrando datos de ejemplo.",
        "error"
      );

      // Datos de ejemplo para mostrar la interfaz
      setCameras([
        {
          id: 1,
          nombre: "Cámara Principal Entrada",
          ubicacion: "Portón Principal",
          tipo: "fija",
          estado: "activa",
          ip: "192.168.1.101",
          puerto: 554,
          configuracion: { resolution: "1080p", fps: 30 },
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-01T00:00:00Z",
        },
        {
          id: 2,
          nombre: "Cámara Garaje",
          ubicacion: "Estacionamiento Subterráneo",
          tipo: "fija",
          estado: "activa",
          ip: "192.168.1.102",
          puerto: 554,
          configuracion: { resolution: "720p", fps: 25 },
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-01T00:00:00Z",
        },
        {
          id: 3,
          nombre: "Cámara Piscina",
          ubicacion: "Área Recreativa",
          tipo: "PTZ",
          estado: "mantenimiento",
          ip: "192.168.1.103",
          puerto: 554,
          configuracion: { resolution: "4K", fps: 30, ptz: true },
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-01T00:00:00Z",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Función para activar vista en vivo de cámara
  const handleActivateCamera = async (camera: Camera) => {
    try {
      // Solicitar acceso a la cámara del dispositivo
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: "environment", // Cámara trasera preferida
        },
        audio: false,
      });

      setActiveCameraStreams((prev) => ({
        ...prev,
        [camera.id]: stream,
      }));

      // Actualizar estado de la cámara a activa
      const updatedCamera = { ...camera, estado: "activa" as const };
      setCameras(cameras.map((c) => (c.id === camera.id ? updatedCamera : c)));

      showToast(`Cámara ${camera.nombre} activada correctamente`);
    } catch (error) {
      console.error("Error activating camera:", error);
      showToast(`Error al activar la cámara ${camera.nombre}`, "error");
    }
  };

  // Función para desactivar cámara
  const handleDeactivateCamera = (camera: Camera) => {
    const stream = activeCameraStreams[camera.id];
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setActiveCameraStreams((prev) => {
        const updated = { ...prev };
        delete updated[camera.id];
        return updated;
      });
    }

    // Actualizar estado de la cámara a inactiva
    const updatedCamera = { ...camera, estado: "inactiva" as const };
    setCameras(cameras.map((c) => (c.id === camera.id ? updatedCamera : c)));

    showToast(`Cámara ${camera.nombre} desactivada`);
  };

  // Función para mostrar vista en vivo
  const handleLiveView = (camera: Camera) => {
    setLiveViewCamera(camera);
    setShowLiveView(true);
  };

  // Función para iniciar análisis con IA en tiempo real
  const handleStartAIAnalysis = async (camera: Camera) => {
    const stream = activeCameraStreams[camera.id];
    if (!stream) {
      showToast("Primero active la cámara para iniciar el análisis", "error");
      return;
    }

    try {
      showToast(`Iniciando análisis de IA en ${camera.nombre}...`);
      // En una implementación real, aquí se iniciaría el análisis continuo
      // Por ahora solo simulamos el inicio
      setTimeout(() => {
        showToast(`Análisis de IA activo en ${camera.nombre}`);
      }, 2000);
    } catch (error) {
      console.error("Error starting AI analysis:", error);
      showToast("Error al iniciar análisis de IA", "error");
    }
  };

  const handleSaveCamera = async () => {
    try {
      if (isAddingNew) {
        const newCamera = await iaSecurityService.createCamera(formData);
        setCameras([...cameras, newCamera]);
        showToast("Cámara agregada correctamente.");
      } else if (selectedCamera) {
        const updatedCamera = await iaSecurityService.updateCamera(
          selectedCamera.id,
          formData
        );
        setCameras(
          cameras.map((c) => (c.id === selectedCamera.id ? updatedCamera : c))
        );
        showToast("Cámara actualizada correctamente.");
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      showToast("No se pudo guardar la cámara.", "error");
    }
  };

  const handleDeleteCamera = async (camera: Camera) => {
    if (
      !window.confirm(`¿Está seguro de eliminar la cámara "${camera.nombre}"?`)
    ) {
      return;
    }

    try {
      await iaSecurityService.deleteCamera(camera.id);
      setCameras(cameras.filter((c) => c.id !== camera.id));
      showToast("Cámara eliminada correctamente.");
    } catch (error) {
      showToast("No se pudo eliminar la cámara.", "error");
    }
  };

  const handleTestCamera = async (camera: Camera) => {
    try {
      const result = await iaSecurityService.testCamera(camera.id);
      showToast(result.mensaje, result.exito ? "success" : "error");
    } catch (error) {
      showToast("No se pudo probar la conexión con la cámara.", "error");
    }
  };

  const openAddDialog = () => {
    setIsAddingNew(true);
    setSelectedCamera(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (camera: Camera) => {
    setIsAddingNew(false);
    setSelectedCamera(camera);
    setFormData({
      nombre: camera.nombre,
      ubicacion: camera.ubicacion,
      tipo: camera.tipo,
      ip: camera.ip,
      puerto: camera.puerto,
      estado: camera.estado,
      configuracion: camera.configuracion || {},
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      ubicacion: "",
      tipo: "fija",
      ip: "",
      puerto: 554,
      estado: "activa",
      configuracion: {},
    });
  };

  const getStatusBadge = (estado: Camera["estado"]) => {
    switch (estado) {
      case "activa":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            Activa
          </Badge>
        );
      case "inactiva":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
            Inactiva
          </Badge>
        );
      case "mantenimiento":
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">
            Mantenimiento
          </Badge>
        );
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  };

  const getStatusIcon = (estado: Camera["estado"]) => {
    switch (estado) {
      case "activa":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "inactiva":
        return <WifiOff className="h-5 w-5 text-gray-600" />;
      case "mantenimiento":
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      default:
        return <WifiOff className="h-5 w-5 text-gray-600" />;
    }
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
              Control de Cámaras
            </h1>
            <p className="text-gray-600 mt-1">
              Gestión y configuración de cámaras con visión artificial
            </p>
          </div>
          <Button
            onClick={openAddDialog}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Cámara
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Activas</p>
                  <p className="text-2xl font-bold text-green-600">
                    {cameras.filter((c) => c.estado === "activa").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <WifiOff className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Inactivas</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {cameras.filter((c) => c.estado === "inactiva").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Mantenimiento
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {cameras.filter((c) => c.estado === "mantenimiento").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CameraIcon className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {cameras.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cameras Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cameras.map((camera) => (
            <Card key={camera.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center">
                    {getStatusIcon(camera.estado)}
                    <span className="ml-2">{camera.nombre}</span>
                  </CardTitle>
                  {getStatusBadge(camera.estado)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Ubicación:</span>
                    <span className="font-medium">{camera.ubicacion}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Tipo:</span>
                    <span className="font-medium capitalize">
                      {camera.tipo}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">IP:</span>
                    <span className="font-mono text-xs">
                      {camera.ip}:{camera.puerto}
                    </span>
                  </div>

                  {/* Stream Preview Placeholder */}
                  <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <CameraIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">Vista previa del stream</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    {/* Primera fila de botones */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        camera.estado === "activa"
                          ? handleDeactivateCamera(camera)
                          : handleActivateCamera(camera)
                      }
                      className={
                        camera.estado === "activa"
                          ? "text-red-600 hover:text-red-700"
                          : "text-green-600 hover:text-green-700"
                      }
                    >
                      {camera.estado === "activa" ? (
                        <>
                          <VideoOff className="h-4 w-4 mr-1" />
                          Desactivar
                        </>
                      ) : (
                        <>
                          <Video className="h-4 w-4 mr-1" />
                          Activar
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLiveView(camera)}
                      disabled={camera.estado !== "activa"}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Vista Live
                    </Button>

                    {/* Segunda fila de botones */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStartAIAnalysis(camera)}
                      disabled={camera.estado !== "activa"}
                      className="text-purple-600 hover:text-purple-700"
                    >
                      <CameraIcon className="h-4 w-4 mr-1" />
                      IA Análisis
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestCamera(camera)}
                    >
                      <Wifi className="h-4 w-4 mr-1" />
                      Test
                    </Button>

                    {/* Tercera fila de botones */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(camera)}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Config
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteCamera(camera)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add/Edit Camera Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {isAddingNew ? "Nueva Cámara" : "Editar Cámara"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  placeholder="Ej: Cámara Principal Entrada"
                />
              </div>

              <div>
                <Label htmlFor="ubicacion">Ubicación</Label>
                <Input
                  id="ubicacion"
                  value={formData.ubicacion}
                  onChange={(e) =>
                    setFormData({ ...formData, ubicacion: e.target.value })
                  }
                  placeholder="Ej: Portón Principal"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value) =>
                      setFormData({ ...formData, tipo: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fija">Fija</SelectItem>
                      <SelectItem value="PTZ">PTZ (Pan-Tilt-Zoom)</SelectItem>
                      <SelectItem value="domo">Domo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="estado">Estado</Label>
                  <Select
                    value={formData.estado}
                    onValueChange={(value: Camera["estado"]) =>
                      setFormData({ ...formData, estado: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activa">Activa</SelectItem>
                      <SelectItem value="inactiva">Inactiva</SelectItem>
                      <SelectItem value="mantenimiento">
                        Mantenimiento
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="ip">Dirección IP</Label>
                  <Input
                    id="ip"
                    value={formData.ip}
                    onChange={(e) =>
                      setFormData({ ...formData, ip: e.target.value })
                    }
                    placeholder="192.168.1.100"
                  />
                </div>
                <div>
                  <Label htmlFor="puerto">Puerto</Label>
                  <Input
                    id="puerto"
                    type="number"
                    value={formData.puerto}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        puerto: parseInt(e.target.value) || 554,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button onClick={handleSaveCamera} className="flex-1">
                  {isAddingNew ? "Crear" : "Guardar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Live View Modal */}
        {showLiveView && liveViewCamera && (
          <Dialog open={showLiveView} onOpenChange={setShowLiveView}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Vista en Vivo - {liveViewCamera.nombre}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
                  {activeCameraStreams[liveViewCamera.id] ? (
                    <video
                      ref={(video) => {
                        if (video && activeCameraStreams[liveViewCamera.id]) {
                          video.srcObject =
                            activeCameraStreams[liveViewCamera.id];
                          video.play();
                        }
                      }}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full rounded-lg"
                    />
                  ) : (
                    <div className="text-center text-white">
                      <CameraIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>Cámara no disponible</p>
                      <Button
                        onClick={() => handleActivateCamera(liveViewCamera)}
                        className="mt-4"
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Activar Cámara
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <div>
                    <p className="font-medium">{liveViewCamera.nombre}</p>
                    <p className="text-sm text-gray-600">
                      {liveViewCamera.ubicacion}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStartAIAnalysis(liveViewCamera)}
                      disabled={!activeCameraStreams[liveViewCamera.id]}
                    >
                      <CameraIcon className="h-4 w-4 mr-2" />
                      Iniciar IA
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowLiveView(false)}
                    >
                      Cerrar
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  );
};

export default CameraManagementPage;
