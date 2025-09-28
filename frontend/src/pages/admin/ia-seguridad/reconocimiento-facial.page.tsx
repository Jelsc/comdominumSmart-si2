import React, { useEffect, useState } from "react";
import {
  UserCheck,
  Plus,
  Eye,
  Upload,
  Trash2,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Camera,
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
import type { FacialRecognition, DetectedPerson } from "@/types/ia-security";

const FacialRecognitionPage: React.FC = () => {
  const [recognitions, setRecognitions] = useState<FacialRecognition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecognition, setSelectedRecognition] =
    useState<FacialRecognition | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Toast notifications
  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    // Simple alert as fallback - in a real app you'd use a proper toast library
    if (type === "error") {
      alert(`❌ ${message}`);
    } else {
      alert(`✅ ${message}`);
    }
  };

  // Estado del formulario
  const [formData, setFormData] = useState({
    residente_id: 0,
    residente_nombre: "",
    estado: "activo" as FacialRecognition["estado"],
    confianza_minima: 85,
    imagen_perfil: null as File | null,
  });

  // Toast placeholder
  const toast = (options: any) => {
    console.log("Toast:", options);
    alert(options.description);
  };

  useEffect(() => {
    loadFacialRecognitions();
  }, []);

  const loadFacialRecognitions = async () => {
    try {
      setLoading(true);
      const data = await iaSecurityService.getFacialRecognitions();
      setRecognitions(data);
    } catch (error) {
      console.error("Error al cargar reconocimientos faciales:", error);
      toast({
        title: "Error",
        description:
          "No se pudieron cargar los reconocimientos. Mostrando datos de ejemplo.",
        variant: "destructive",
      });

      // Datos de ejemplo
      setRecognitions([
        {
          id: 1,
          residente_id: 1,
          residente_nombre: "Juan Pérez",
          imagen_perfil: "/api/placeholder/150/150",
          estado: "activo",
          fecha_registro: "2025-01-15T10:30:00Z",
          confianza_minima: 85,
          ultima_deteccion: "2025-01-28T08:15:00Z",
        },
        {
          id: 2,
          residente_id: 2,
          residente_nombre: "María González",
          imagen_perfil: "/api/placeholder/150/150",
          estado: "activo",
          fecha_registro: "2025-01-20T14:20:00Z",
          confianza_minima: 90,
          ultima_deteccion: "2025-01-28T07:45:00Z",
        },
        {
          id: 3,
          residente_id: 3,
          residente_nombre: "Carlos López",
          imagen_perfil: "/api/placeholder/150/150",
          estado: "inactivo",
          fecha_registro: "2025-01-10T09:15:00Z",
          confianza_minima: 80,
          ultima_deteccion: null,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFacialRecognition = async () => {
    try {
      const formDataToSend = new FormData();
      // Solo enviar los campos que el backend FotoResidenteSerializer espera
      formDataToSend.append("residente", formData.residente_id.toString());

      if (formData.imagen_perfil) {
        formDataToSend.append("imagen", formData.imagen_perfil);
      }

      // Campos opcionales
      formDataToSend.append("es_principal", "true");
      formDataToSend.append("activo", "true");

      if (isAddingNew) {
        const newRecognition = await iaSecurityService.createFacialRecognition(
          formDataToSend
        );
        setRecognitions([...recognitions, newRecognition]);
        toast({
          title: "Éxito",
          description: "Reconocimiento facial agregado correctamente.",
        });
      } else if (selectedRecognition) {
        const updatedRecognition =
          await iaSecurityService.updateFacialRecognition(
            selectedRecognition.id,
            {
              estado: formData.estado,
              confianza_minima: formData.confianza_minima,
            }
          );
        setRecognitions(
          recognitions.map((r) =>
            r.id === selectedRecognition.id ? updatedRecognition : r
          )
        );
        toast({
          title: "Éxito",
          description: "Reconocimiento facial actualizado correctamente.",
        });
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el reconocimiento facial.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRecognition = async (recognition: FacialRecognition) => {
    if (
      !window.confirm(
        `¿Está seguro de eliminar el reconocimiento de "${recognition.residente_nombre}"?`
      )
    ) {
      return;
    }

    try {
      await iaSecurityService.deleteFacialRecognition(recognition.id);
      setRecognitions(recognitions.filter((r) => r.id !== recognition.id));
      showToast("Reconocimiento facial eliminado correctamente.");
    } catch (error) {
      showToast("No se pudo eliminar el reconocimiento facial.", "error");
    }
  };

  // Función para procesar imagen capturada
  const handleCaptureImage = async (imageData: string) => {
    setIsProcessing(true);
    try {
      // Convertir base64 a blob
      const response = await fetch(imageData);
      const blob = await response.blob();

      // Crear imagen para el procesamiento
      const image = new Image();
      const url = URL.createObjectURL(blob);
      image.src = url;

      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
      });

      // Procesar con IA para detectar rostros
      const result = await aiService.detectFaces(image);

      if (
        !result.success ||
        !result.data.faces ||
        result.data.faces.length === 0
      ) {
        showToast(
          "No se detectó ningún rostro en la imagen. Intente con otra foto.",
          "error"
        );
        return;
      }

      if (result.data.faces.length > 1) {
        showToast(
          "Se detectaron múltiples rostros. Use una imagen con una sola persona.",
          "error"
        );
        return;
      }

      const face = result.data.faces[0];
      if (face) {
        showToast(
          `Rostro detectado con ${Math.round(
            face.confidence * 100
          )}% de confianza`
        );
      }

      // Guardar imagen en el formulario
      const file = new File([blob], "captured_face.jpg", {
        type: "image/jpeg",
      });
      setFormData((prev) => ({
        ...prev,
        imagen_perfil: file,
      }));

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
      // Crear imagen para el procesamiento
      const image = new Image();
      const url = URL.createObjectURL(file);
      image.src = url;

      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
      });

      // Procesar con IA para detectar rostros
      const result = await aiService.detectFaces(image);

      if (
        !result.success ||
        !result.data.faces ||
        result.data.faces.length === 0
      ) {
        showToast(
          "No se detectó ningún rostro en la imagen seleccionada.",
          "error"
        );
        return;
      }

      if (result.data.faces.length > 1) {
        showToast(
          "Se detectaron múltiples rostros. Use una imagen con una sola persona.",
          "error"
        );
        return;
      }

      const face = result.data.faces[0];
      if (face) {
        showToast(
          `Rostro detectado con ${Math.round(
            face.confidence * 100
          )}% de confianza`
        );
      }

      // Guardar archivo en el formulario
      setFormData((prev) => ({
        ...prev,
        imagen_perfil: file,
      }));

      setShowCamera(false);
    } catch (error) {
      console.error("Error processing file:", error);
      showToast("Error al procesar el archivo. Intente nuevamente.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Función para entrenar modelo con nueva imagen
  const handleTrainModelAI = async () => {
    setIsTraining(true);
    try {
      await aiService.trainFaceRecognition(recognitions);
      showToast("Modelo de reconocimiento facial entrenado exitosamente.");
    } catch (error) {
      console.error("Error training model:", error);
      showToast("Error al entrenar el modelo. Intente nuevamente.", "error");
    } finally {
      setIsTraining(false);
    }
  };

  // Función para reconocer rostro en tiempo real
  const handleRealTimeRecognition = async () => {
    setShowCamera(true);
  };

  const handleTrainModel = async () => {
    try {
      setIsTraining(true);
      const result = await iaSecurityService.trainFacialModel();
      toast({
        title: result.status === "success" ? "Éxito" : "Error",
        description: result.message,
        variant: result.status === "success" ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo entrenar el modelo de reconocimiento facial.",
        variant: "destructive",
      });
    } finally {
      setIsTraining(false);
    }
  };

  const openAddDialog = () => {
    setIsAddingNew(true);
    setSelectedRecognition(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (recognition: FacialRecognition) => {
    setIsAddingNew(false);
    setSelectedRecognition(recognition);
    setFormData({
      residente_id: recognition.residente_id,
      residente_nombre: recognition.residente_nombre,
      estado: recognition.estado,
      confianza_minima: recognition.confianza_minima,
      imagen_perfil: null,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      residente_id: 0,
      residente_nombre: "",
      estado: "activo",
      confianza_minima: 85,
      imagen_perfil: null,
    });
  };

  const getStatusBadge = (estado: FacialRecognition["estado"]) => {
    switch (estado) {
      case "activo":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            Activo
          </Badge>
        );
      case "inactivo":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
            Inactivo
          </Badge>
        );
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  };

  const getStatusIcon = (estado: FacialRecognition["estado"]) => {
    switch (estado) {
      case "activo":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "inactivo":
        return <XCircle className="h-5 w-5 text-gray-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Nunca";
    return new Date(dateString).toLocaleString();
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
              Reconocimiento Facial
            </h1>
            <p className="text-gray-600 mt-1">
              Gestión de reconocimiento facial de residentes autorizados
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={handleRealTimeRecognition}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              <Camera className="h-4 w-4 mr-2" />
              Reconocer en Tiempo Real
            </Button>
            <Button
              onClick={handleTrainModelAI}
              disabled={isTraining}
              variant="outline"
              className="text-orange-600 border-orange-600 hover:bg-orange-50"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isTraining ? "animate-spin" : ""}`}
              />
              {isTraining ? "Entrenando..." : "Entrenar Modelo"}
            </Button>
            <Button
              onClick={openAddDialog}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Reconocimiento
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Activos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {recognitions.filter((r) => r.estado === "activo").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Inactivos</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {recognitions.filter((r) => r.estado === "inactivo").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Detectados Hoy
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {
                      recognitions.filter(
                        (r) =>
                          r.ultima_deteccion &&
                          new Date(r.ultima_deteccion).toDateString() ===
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
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {recognitions.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recognition List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recognitions.map((recognition) => (
            <Card
              key={recognition.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center">
                    {getStatusIcon(recognition.estado)}
                    <span className="ml-2">{recognition.residente_nombre}</span>
                  </CardTitle>
                  {getStatusBadge(recognition.estado)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Avatar */}
                  <div className="flex justify-center">
                    <Avatar className="h-20 w-20">
                      <AvatarImage
                        src={recognition.imagen_perfil}
                        alt={recognition.residente_nombre}
                      />
                      <AvatarFallback>
                        <User className="h-10 w-10" />
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">ID Residente:</span>
                      <span className="font-medium">
                        #{recognition.residente_id}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Confianza mín:</span>
                      <span className="font-medium">
                        {recognition.confianza_minima}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Registrado:</span>
                      <span className="font-medium text-xs">
                        {new Date(
                          recognition.fecha_registro
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Última det.:</span>
                      <span className="font-medium text-xs">
                        {recognition.ultima_deteccion
                          ? new Date(
                              recognition.ultima_deteccion
                            ).toLocaleDateString()
                          : "Nunca"}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEditDialog(recognition)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteRecognition(recognition)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add/Edit Recognition Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {isAddingNew
                  ? "Nuevo Reconocimiento Facial"
                  : "Editar Reconocimiento"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="residente_id">ID Residente</Label>
                  <Input
                    id="residente_id"
                    type="number"
                    value={formData.residente_id || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        residente_id: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="123"
                  />
                </div>
                <div>
                  <Label htmlFor="confianza_minima">Confianza mín. (%)</Label>
                  <Input
                    id="confianza_minima"
                    type="number"
                    min="50"
                    max="99"
                    value={formData.confianza_minima}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confianza_minima: parseInt(e.target.value) || 85,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="residente_nombre">Nombre Residente</Label>
                <Input
                  id="residente_nombre"
                  value={formData.residente_nombre}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      residente_nombre: e.target.value,
                    })
                  }
                  placeholder="Ej: Juan Pérez"
                />
              </div>

              <div>
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={formData.estado}
                  onValueChange={(value: FacialRecognition["estado"]) =>
                    setFormData({ ...formData, estado: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isAddingNew && (
                <div>
                  <Label htmlFor="imagen_perfil">Imagen de Perfil</Label>
                  <div className="space-y-3">
                    <Input
                      id="imagen_perfil"
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          imagen_perfil: e.target.files?.[0] || null,
                        })
                      }
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCamera(true)}
                        disabled={isProcessing}
                        className="flex-1"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Usar Cámara
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Seleccione una imagen clara del rostro del residente o use
                    la cámara para capturar una foto
                  </p>
                  {formData.imagen_perfil && (
                    <p className="text-sm text-green-600 mt-1">
                      ✓ Imagen seleccionada: {formData.imagen_perfil.name}
                    </p>
                  )}
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveFacialRecognition}
                  className="flex-1"
                >
                  {isAddingNew ? "Crear" : "Guardar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Camera Capture Modal */}
        {showCamera && (
          <CameraCapture
            onCapture={handleCaptureImage}
            onFileSelect={handleFileSelect}
            onClose={() => setShowCamera(false)}
            title="Capturar Rostro para Reconocimiento"
            isProcessing={isProcessing}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default FacialRecognitionPage;
