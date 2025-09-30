import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Camera,
  Car,
  User,
  CheckCircle,
  XCircle,
  Upload,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface PersonaAutorizada {
  id: number;
  nombre: string;
  ci: string;
  tipo_acceso: string;
  activo: boolean;
}

interface VehiculoAutorizado {
  id: number;
  placa: string;
  propietario: string;
  tipo_vehiculo: string;
  activo: boolean;
}

interface FaceDetection {
  confidence: number;
  bounding_box: {
    Width: number;
    Height: number;
    Left: number;
    Top: number;
  };
  emotions: string[];
  age_range: {
    low: number;
    high: number;
  };
  gender?: string;
}

interface RegisteredFace {
  face_id: string;
  external_image_id: string;
  confidence: number;
  bounding_box: any;
}

export default function SeguridadSimplePage() {
  const [personas, setPersonas] = useState<PersonaAutorizada[]>([]);
  const [vehiculos, setVehiculos] = useState<VehiculoAutorizado[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<
    "persona" | "vehiculo" | "facial"
  >("persona");
  const [formData, setFormData] = useState<any>({});
  const [resultado, setResultado] = useState<any>(null);

  // Estados para reconocimiento facial
  const [faces, setFaces] = useState<FaceDetection[]>([]);
  const [registeredFaces, setRegisteredFaces] = useState<RegisteredFace[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [residenteId, setResidenteId] = useState("");
  const [nombre, setNombre] = useState("");
  const [recognitionResult, setRecognitionResult] = useState<any>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // Cargar datos
  const loadData = async () => {
    try {
      setLoading(true);
      const [personasRes, vehiculosRes] = await Promise.all([
        api.get("/api/seguridad/personas/"),
        api.get("/api/seguridad/vehiculos/"),
      ]);
      setPersonas(personasRes.data.results || personasRes.data);
      setVehiculos(vehiculosRes.data.results || vehiculosRes.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Funciones para reconocimiento facial
  const loadRegisteredFaces = async () => {
    try {
      const response = await fetch("/api/seguridad/caras-registradas/");
      const data = await response.json();

      if (data.exito) {
        setRegisteredFaces(data.faces || []);
      }
    } catch (error) {
      console.error("Error cargando caras registradas:", error);
    }
  };

  const startCamera = async () => {
    try {
      console.log("Iniciando cámara...");

      // Detener stream anterior si existe
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: false,
      });

      console.log("Stream obtenido:", stream);
      console.log("Tracks de video:", stream.getVideoTracks());

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log("Stream asignado al video");

        // Esperar a que el video esté listo
        videoRef.current.onloadedmetadata = () => {
          console.log("Metadata cargada, iniciando reproducción");
          if (videoRef.current) {
            videoRef.current
              .play()
              .then(() => {
                console.log("Video reproduciéndose");
                // Forzar actualización del video
                setTimeout(() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = 0;
                    videoRef.current.load();
                  }
                }, 100);
              })
              .catch((err) => {
                console.error("Error al reproducir:", err);
              });
          }
        };

        // Evento adicional para forzar renderizado
        videoRef.current.oncanplay = () => {
          console.log("Video puede reproducirse");
          if (videoRef.current) {
            videoRef.current.play().catch(console.error);
          }
        };
      }

      toast({
        title: "Éxito",
        description: "Cámara activada correctamente",
      });
    } catch (error: any) {
      console.error("Error de cámara:", error);
      toast({
        title: "Error",
        description: `No se pudo acceder a la cámara: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], "captured_photo.jpg", {
                type: "image/jpeg",
              });
              setSelectedImage(file);
              setPreviewUrl(URL.createObjectURL(blob));
              stopCamera(); // Detener cámara después de capturar
            }
          },
          "image/jpeg",
          0.8
        );
      }
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const detectFaces = async () => {
    if (!selectedImage) {
      toast({
        title: "Error",
        description: "Selecciona una imagen primero",
        variant: "destructive",
      });
      return;
    }

    setIsDetecting(true);
    try {
      const formData = new FormData();
      formData.append("imagen", selectedImage);

      const response = await fetch("/api/seguridad/detectar-caras/", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.exito) {
        setFaces(data.faces || []);
        toast({
          title: "Éxito",
          description: `Se detectaron ${data.faces_detected} cara(s)`,
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Error detectando caras",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive",
      });
    } finally {
      setIsDetecting(false);
    }
  };

  const registerFace = async () => {
    if (!selectedImage || !residenteId || !nombre) {
      toast({
        title: "Error",
        description: "Completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    setIsRegistering(true);
    try {
      const formData = new FormData();
      formData.append("imagen", selectedImage);
      formData.append("residente_id", residenteId);
      formData.append("nombre", nombre);

      const response = await fetch("/api/seguridad/registrar-cara/", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.exito) {
        toast({
          title: "Éxito",
          description: `Cara registrada para ${nombre}`,
        });
        setResidenteId("");
        setNombre("");
        setSelectedImage(null);
        setPreviewUrl("");
        loadRegisteredFaces();
      } else {
        toast({
          title: "Error",
          description: data.error || "Error registrando cara",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const recognizeFace = async () => {
    if (!selectedImage) {
      toast({
        title: "Error",
        description: "Selecciona una imagen primero",
        variant: "destructive",
      });
      return;
    }

    setIsRecognizing(true);
    try {
      const formData = new FormData();
      formData.append("imagen", selectedImage);

      const response = await fetch("/api/seguridad/reconocer-cara/", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.exito) {
        setRecognitionResult(data);
        if (data.cara_encontrada) {
          toast({
            title: "Cara reconocida",
            description: `Bienvenido ${data.nombre}`,
          });
        } else {
          toast({
            title: "Cara no encontrada",
            description: "No se encontró esta cara en la base de datos",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: data.error || "Error reconociendo cara",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive",
      });
    } finally {
      setIsRecognizing(false);
    }
  };

  const deleteFace = async (faceId: string) => {
    try {
      const response = await fetch("/api/seguridad/eliminar-cara/", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ face_id: faceId }),
      });

      const data = await response.json();

      if (data.exito) {
        toast({
          title: "Éxito",
          description: "Cara eliminada correctamente",
        });
        loadRegisteredFaces();
      } else {
        toast({
          title: "Error",
          description: data.error || "Error eliminando cara",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadData();
    loadRegisteredFaces();

    // Limpiar recursos al desmontar
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Crear persona
  const createPersona = async (data: any) => {
    try {
      await api.post("/api/seguridad/personas/", data);
      toast({
        title: "Éxito",
        description: "Persona registrada correctamente",
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Error al crear persona",
        variant: "destructive",
      });
    }
  };

  // Crear vehículo
  const createVehiculo = async (data: any) => {
    try {
      await api.post("/api/seguridad/vehiculos/", data);
      toast({
        title: "Éxito",
        description: "Vehículo registrado correctamente",
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Error al crear vehículo",
        variant: "destructive",
      });
    }
  };

  // Reconocimiento de placas
  const reconocerPlaca = async (imagen: File) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("imagen", imagen);

      const response = await api.post(
        "/api/seguridad/reconocimiento-placa/",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setResultado(response.data);

      if (response.data.exito) {
        toast({
          title: "Placa detectada",
          description: `Placa: ${
            response.data.placa_detectada || "No detectada"
          }`,
        });
      } else {
        toast({
          title: "Error",
          description: response.data.mensaje || "No se pudo detectar la placa",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Error en el reconocimiento de placas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Reconocimiento facial
  const reconocerFacial = async (imagen: File) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("imagen", imagen);
      formData.append("tipo_acceso", "entrada");

      const response = await api.post(
        "/api/seguridad/detectar-caras/",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setResultado(response.data);

      if (response.data.exito) {
        toast({
          title: "Persona reconocida",
          description: `Bienvenido: ${
            response.data.persona_detectada?.nombre || "Desconocido"
          }`,
        });
      } else {
        toast({
          title: "Error",
          description:
            response.data.mensaje || "No se pudo reconocer la persona",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Error en el reconocimiento facial",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "placa" | "facial"
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (type === "placa") {
        reconocerPlaca(file);
      } else {
        reconocerFacial(file);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dialogType === "persona") {
      createPersona(formData);
    } else {
      createVehiculo(formData);
    }
    setIsDialogOpen(false);
    setFormData({});
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Módulo de Seguridad
              </h1>
              <p className="text-gray-600">Reconocimiento facial y de placas</p>
            </div>
          </div>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Personas Registradas
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {personas.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Vehículos Registrados
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {vehiculos.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Car className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reconocimiento */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Reconocimiento de Placas */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Car className="w-5 h-5 text-blue-600" />
                </div>
                <span>Reconocimiento de Placas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-6 text-lg">
                  Sube una imagen de la placa
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "placa")}
                  className="hidden"
                  id="placa-upload"
                />
                <Button
                  asChild
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <label htmlFor="placa-upload" className="cursor-pointer">
                    Seleccionar Imagen
                  </label>
                </Button>
              </div>

              {resultado && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Resultado:</h4>
                  <div className="flex items-center space-x-2">
                    {resultado.exito ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span>{resultado.mensaje}</span>
                  </div>
                  {resultado.placa_detectada && (
                    <p className="text-sm text-gray-600 mt-2">
                      Placa detectada: {resultado.placa_detectada}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reconocimiento Facial Completo */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-xl">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  <span>Reconocimiento Facial</span>
                </div>
                <Badge variant="outline" className="text-sm">
                  {registeredFaces.length} caras registradas
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Cámara web */}
              <div className="space-y-2">
                <Label>Cámara Web</Label>
                <div className="relative">
                  <video
                    ref={videoRef}
                    className="w-full h-48 bg-gray-100 rounded-lg"
                    autoPlay
                    playsInline
                    muted
                    controls={false}
                    style={{
                      objectFit: "cover",
                      backgroundColor: "#f3f4f6",
                    }}
                    onLoadedMetadata={() => {
                      console.log("onLoadedMetadata disparado");
                      if (videoRef.current) {
                        videoRef.current.play().catch(console.error);
                      }
                    }}
                    onCanPlay={() => {
                      console.log("onCanPlay disparado");
                      if (videoRef.current) {
                        videoRef.current.play().catch(console.error);
                      }
                    }}
                    onPlay={() => {
                      console.log("onPlay disparado - video reproduciéndose");
                    }}
                    onError={(e) => {
                      console.error("Error del video:", e);
                      toast({
                        title: "Error",
                        description: "Error al cargar el video de la cámara",
                        variant: "destructive",
                      });
                    }}
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  <Button
                    onClick={startCamera}
                    className="absolute bottom-2 left-2"
                    size="sm"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Activar Cámara
                  </Button>
                  <Button
                    onClick={capturePhoto}
                    className="absolute bottom-2 right-2"
                    size="sm"
                    variant="secondary"
                  >
                    Capturar
                  </Button>
                  <Button
                    onClick={stopCamera}
                    className="absolute bottom-2 left-1/2 transform -translate-x-1/2"
                    size="sm"
                    variant="destructive"
                  >
                    Detener
                  </Button>
                  <Button
                    onClick={() => {
                      if (videoRef.current) {
                        console.log("Forzando reproducción...");
                        videoRef.current
                          .play()
                          .then(() => {
                            console.log("Reproducción forzada exitosa");
                          })
                          .catch(console.error);
                      }
                    }}
                    className="absolute top-2 right-2"
                    size="sm"
                    variant="outline"
                  >
                    🔄
                  </Button>
                </div>
              </div>

              {/* Subir archivo */}
              <div className="space-y-2">
                <Label>O subir archivo</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="cursor-pointer"
                />
              </div>

              {/* Preview */}
              {previewUrl && (
                <div className="space-y-2">
                  <Label>Vista previa</Label>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Botones de acción */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Button
                  onClick={detectFaces}
                  disabled={!selectedImage || isDetecting}
                  className="w-full"
                >
                  {isDetecting ? "Detectando..." : "Detectar Caras"}
                </Button>
                <Button
                  onClick={recognizeFace}
                  disabled={!selectedImage || isRecognizing}
                  className="w-full"
                  variant="outline"
                >
                  {isRecognizing ? "Reconociendo..." : "Reconocer Cara"}
                </Button>
                <Button
                  onClick={() => setDialogType("facial")}
                  disabled={!selectedImage}
                  className="w-full"
                  variant="secondary"
                >
                  Registrar Cara
                </Button>
              </div>

              {/* Resultados de detección */}
              {faces.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold">Caras Detectadas:</h4>
                  {faces.map((face, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-semibold">Cara {index + 1}</h5>
                        <Badge variant="outline">
                          {Math.round(face.confidence)}% confianza
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          Edad: {face.age_range.low}-{face.age_range.high} años
                        </p>
                        {face.gender && <p>Género: {face.gender}</p>}
                        {face.emotions.length > 0 && (
                          <p>Emociones: {face.emotions.join(", ")}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Resultado de reconocimiento */}
              {recognitionResult && (
                <div className="mt-4 p-4 border rounded-lg">
                  {recognitionResult.cara_encontrada ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <div>
                        <p className="font-semibold">Cara reconocida</p>
                        <p>Residente: {recognitionResult.nombre}</p>
                        <p>ID: {recognitionResult.residente_id}</p>
                        <p>
                          Similitud: {Math.round(recognitionResult.similarity)}%
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600">
                      <XCircle className="h-5 w-5" />
                      <p>Cara no encontrada en la base de datos</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Registro */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personas */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between text-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <span>Personas Registradas</span>
                </div>
                <Dialog
                  open={isDialogOpen && dialogType === "persona"}
                  onOpenChange={setIsDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      onClick={() => setDialogType("persona")}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nueva Persona</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="nombre">Nombre</Label>
                        <Input
                          id="nombre"
                          value={formData.nombre || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, nombre: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="ci">Cédula</Label>
                        <Input
                          id="ci"
                          value={formData.ci || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, ci: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="tipo_acceso">Tipo de Acceso</Label>
                        <Select
                          value={formData.tipo_acceso || ""}
                          onValueChange={(value) =>
                            setFormData({ ...formData, tipo_acceso: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="residente">Residente</SelectItem>
                            <SelectItem value="personal">Personal</SelectItem>
                            <SelectItem value="visitante">Visitante</SelectItem>
                            <SelectItem value="proveedor">Proveedor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="submit" className="w-full">
                        Crear Persona
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {personas.map((persona) => (
                  <div
                    key={persona.id}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div>
                      <p className="font-medium">{persona.nombre}</p>
                      <p className="text-sm text-gray-600">{persona.ci}</p>
                    </div>
                    <Badge variant={persona.activo ? "default" : "secondary"}>
                      {persona.tipo_acceso}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Vehículos */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between text-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Car className="w-5 h-5 text-green-600" />
                  </div>
                  <span>Vehículos Registrados</span>
                </div>
                <Dialog
                  open={isDialogOpen && dialogType === "vehiculo"}
                  onOpenChange={setIsDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      onClick={() => setDialogType("vehiculo")}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nuevo Vehículo</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="placa">Placa</Label>
                        <Input
                          id="placa"
                          value={formData.placa || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, placa: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="propietario">Propietario</Label>
                        <Input
                          id="propietario"
                          value={formData.propietario || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              propietario: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="tipo_vehiculo">Tipo de Vehículo</Label>
                        <Select
                          value={formData.tipo_vehiculo || ""}
                          onValueChange={(value) =>
                            setFormData({ ...formData, tipo_vehiculo: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auto">Automóvil</SelectItem>
                            <SelectItem value="moto">Motocicleta</SelectItem>
                            <SelectItem value="camion">Camión</SelectItem>
                            <SelectItem value="bus">Bus</SelectItem>
                            <SelectItem value="otro">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="submit" className="w-full">
                        Crear Vehículo
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {vehiculos.map((vehiculo) => (
                  <div
                    key={vehiculo.id}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div>
                      <p className="font-medium">{vehiculo.placa}</p>
                      <p className="text-sm text-gray-600">
                        {vehiculo.propietario}
                      </p>
                    </div>
                    <Badge variant={vehiculo.activo ? "default" : "secondary"}>
                      {vehiculo.tipo_vehiculo}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Caras Registradas */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <span>Caras Registradas ({registeredFaces.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {registeredFaces.length > 0 ? (
                <div className="space-y-2">
                  {registeredFaces.map((face) => (
                    <div
                      key={face.face_id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-semibold">
                          {face.external_image_id}
                        </p>
                        <p className="text-sm text-gray-600">
                          Confianza: {Math.round(face.confidence)}%
                        </p>
                      </div>
                      <Button
                        onClick={() => deleteFace(face.face_id)}
                        size="sm"
                        variant="destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No hay caras registradas
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Modal para registro facial */}
        <Dialog
          open={isDialogOpen && dialogType === "facial"}
          onOpenChange={setIsDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Nueva Cara</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                registerFace();
                setIsDialogOpen(false);
              }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="residenteId">ID del Residente</Label>
                <Input
                  id="residenteId"
                  value={residenteId}
                  onChange={(e) => setResidenteId(e.target.value)}
                  placeholder="Ej: 12345"
                  required
                />
              </div>
              <div>
                <Label htmlFor="nombre">Nombre Completo</Label>
                <Input
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  required
                />
              </div>
              {previewUrl && (
                <div>
                  <Label>Imagen seleccionada:</Label>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg mt-2"
                  />
                </div>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={
                  !selectedImage || !residenteId || !nombre || isRegistering
                }
              >
                {isRegistering ? "Registrando..." : "Registrar Cara"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
