import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Camera,
  User,
  Search,
  Upload,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

const ReconocimientoFacial: React.FC = () => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [faces, setFaces] = useState<FaceDetection[]>([]);
  const [registeredFaces, setRegisteredFaces] = useState<RegisteredFace[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [residenteId, setResidenteId] = useState("");
  const [nombre, setNombre] = useState("");
  const [recognitionResult, setRecognitionResult] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // Cargar caras registradas al montar el componente
  useEffect(() => {
    loadRegisteredFaces();
  }, []);

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
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: "user",
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo acceder a la cámara",
        variant: "destructive",
      });
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Reconocimiento Facial</h1>
        <Badge variant="outline" className="text-sm">
          {registeredFaces.length} caras registradas
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Captura de imagen */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Captura de Imagen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Cámara web */}
            <div className="space-y-2">
              <Label>Cámara Web</Label>
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full h-48 bg-gray-100 rounded-lg"
                  autoPlay
                  playsInline
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

            {/* Detectar caras */}
            <Button
              onClick={detectFaces}
              disabled={!selectedImage || isDetecting}
              className="w-full"
            >
              {isDetecting ? "Detectando..." : "Detectar Caras"}
            </Button>
          </CardContent>
        </Card>

        {/* Resultados de detección */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Resultados de Detección
            </CardTitle>
          </CardHeader>
          <CardContent>
            {faces.length > 0 ? (
              <div className="space-y-4">
                {faces.map((face, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Cara {index + 1}</h4>
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
            ) : (
              <p className="text-gray-500 text-center py-8">
                No se han detectado caras
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Registro de cara */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Registrar Nueva Cara
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="residenteId">ID del Residente</Label>
              <Input
                id="residenteId"
                value={residenteId}
                onChange={(e) => setResidenteId(e.target.value)}
                placeholder="Ej: 12345"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre Completo</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Juan Pérez"
              />
            </div>
          </div>
          <Button
            onClick={registerFace}
            disabled={
              !selectedImage || !residenteId || !nombre || isRegistering
            }
            className="w-full mt-4"
          >
            {isRegistering ? "Registrando..." : "Registrar Cara"}
          </Button>
        </CardContent>
      </Card>

      {/* Reconocimiento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Reconocer Cara
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={recognizeFace}
            disabled={!selectedImage || isRecognizing}
            className="w-full"
          >
            {isRecognizing ? "Reconociendo..." : "Reconocer Cara"}
          </Button>

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

      {/* Caras registradas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Caras Registradas ({registeredFaces.length})
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
                    <p className="font-semibold">{face.external_image_id}</p>
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
  );
};

export default ReconocimientoFacial;
