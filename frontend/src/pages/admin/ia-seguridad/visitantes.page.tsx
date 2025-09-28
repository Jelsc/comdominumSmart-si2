import React, { useEffect, useState } from "react";
import {
  Users,
  Eye,
  Check,
  X,
  Clock,
  AlertCircle,
  Camera as CameraIcon,
  User,
  Calendar,
  Filter,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlaceholderImage } from "@/components/ui/placeholder-image";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CameraCapture from "@/components/CameraCapture";
import { iaSecurityService } from "@/services/iaSecurityService";
import { aiService } from "@/services/aiService";
import { useToast } from "@/hooks/use-toast";

interface Visitante {
  id: number;
  foto: string;
  fecha_deteccion: string;
  camara: string;
  estado: "identificado" | "no_identificado" | "autorizado" | "denegado";
  confianza: number;
  observaciones: string;
  procesado: boolean;
  residente_asociado?: string;
}

export default function VisitantesPage() {
  const [visitors, setVisitors] = useState<Visitante[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitante | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  // SVG de data URI para evitar CORS
  const personPlaceholder = `data:image/svg+xml;base64,${btoa(`
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <circle cx="100" cy="75" r="25" fill="#9ca3af"/>
      <path d="M50 175 Q50 150 75 150 L125 150 Q150 150 150 175 Z" fill="#9ca3af"/>
      <text x="50%" y="190" text-anchor="middle" fill="#6b7280" font-family="Arial" font-size="12">Visitante</text>
    </svg>
  `)}`;

  useEffect(() => {
    loadVisitors();
  }, []);

  const loadVisitors = async () => {
    try {
      setLoading(true);
      const data = await iaSecurityService.getVisitantesDetectados();
      setVisitors(data);
    } catch (error) {
      console.error("Error cargando visitantes:", error);
      toast({
        title: "Error",
        description:
          "No se pudieron cargar las detecciones. Mostrando datos de ejemplo.",
        variant: "destructive",
      });

      // Datos de ejemplo con placeholder SVG
      setVisitors([
        {
          id: 1,
          foto: personPlaceholder,
          fecha_deteccion: "2025-01-28T14:30:00Z",
          camara: "Cámara Principal Entrada",
          estado: "no_identificado",
          confianza: 92,
          observaciones: "",
          procesado: false,
        },
        {
          id: 2,
          foto: personPlaceholder,
          fecha_deteccion: "2025-01-28T13:15:00Z",
          camara: "Cámara Estacionamiento",
          estado: "identificado",
          confianza: 87,
          observaciones: "Residente Juan Pérez - Apto 304",
          procesado: true,
          residente_asociado: "Juan Pérez",
        },
        {
          id: 3,
          foto: personPlaceholder,
          fecha_deteccion: "2025-01-28T12:45:00Z",
          camara: "Cámara Entrada Peatonal",
          estado: "autorizado",
          confianza: 95,
          observaciones: "Visitante autorizado por residente",
          procesado: true,
        },
        {
          id: 4,
          foto: personPlaceholder,
          fecha_deteccion: "2025-01-28T11:20:00Z",
          camara: "Cámara Principal Entrada",
          estado: "denegado",
          confianza: 78,
          observaciones: "Acceso denegado - No autorizado",
          procesado: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessVisitor = async (
    visitorId: number,
    estado: string,
    observaciones: string
  ) => {
    try {
      setIsProcessing(true);
      await iaSecurityService.procesarVisitante(
        visitorId,
        estado,
        observaciones
      );
      await loadVisitors();
      setSelectedVisitor(null);
      toast({
        title: "Éxito",
        description: "Visitante procesado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo procesar el visitante",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCameraCapture = async (imageData: string) => {
    setIsAnalyzing(true);
    try {
      // Convertir data URL a Blob
      const response = await fetch(imageData);
      const blob = await response.blob();

      // Analizar con IA
      const result = await aiService.analyzeImage(blob);

      if (result.success && result.data.faces && result.data.faces.length > 0) {
        const firstFace = result.data.faces[0];
        const confidence = firstFace?.confidence
          ? Math.round(firstFace.confidence * 100)
          : 0;

        toast({
          title: "Rostro Detectado",
          description: `Se detectaron ${result.data.faces.length} rostro(s) con confianza del ${confidence}%`,
        });

        // Crear nuevo visitante detectado
        const newVisitor: Visitante = {
          id: Date.now(),
          foto: imageData,
          fecha_deteccion: new Date().toISOString(),
          camara: "Cámara Web (Captura Manual)",
          estado: "no_identificado",
          confianza: confidence,
          observaciones: "Captura manual desde interfaz web",
          procesado: false,
        };

        setVisitors((prev) => [newVisitor, ...prev]);
      } else {
        toast({
          title: "No se detectó rostro",
          description: "No se pudo detectar ningún rostro en la imagen",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error en análisis:", error);
      toast({
        title: "Error de análisis",
        description: "No se pudo analizar la imagen",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setShowCamera(false);
    }
  };

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case "identificado":
        return "default";
      case "autorizado":
        return "default";
      case "denegado":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "identificado":
        return <Eye className="h-4 w-4" />;
      case "autorizado":
        return <Check className="h-4 w-4" />;
      case "denegado":
        return <X className="h-4 w-4" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case "identificado":
        return "Identificado";
      case "autorizado":
        return "Autorizado";
      case "denegado":
        return "Denegado";
      case "no_identificado":
        return "No Identificado";
      default:
        return estado;
    }
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">
            Cargando visitantes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Visitantes Detectados
          </h1>
          <p className="text-muted-foreground">
            Gestión de visitantes detectados por las cámaras de seguridad
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCamera(true)} className="gap-2">
            <CameraIcon className="h-4 w-4" />
            Capturar Visitante
          </Button>
          <Button variant="outline" onClick={loadVisitors}>
            <Download className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Detectados
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{visitors.length}</div>
            <p className="text-xs text-muted-foreground">En las últimas 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              No Identificados
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {visitors.filter((v) => v.estado === "no_identificado").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Requieren procesamiento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Autorizados</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {visitors.filter((v) => v.estado === "autorizado").length}
            </div>
            <p className="text-xs text-muted-foreground">Acceso permitido</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Denegados</CardTitle>
            <X className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {visitors.filter((v) => v.estado === "denegado").length}
            </div>
            <p className="text-xs text-muted-foreground">Acceso denegado</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de visitantes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Visitantes Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Foto</th>
                  <th className="text-left p-2">Fecha/Hora</th>
                  <th className="text-left p-2">Cámara</th>
                  <th className="text-left p-2">Estado</th>
                  <th className="text-left p-2">Confianza</th>
                  <th className="text-left p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visitors.map((visitor) => (
                  <tr key={visitor.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={visitor.foto} alt="Visitante" />
                        <AvatarFallback>
                          <User className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                    </td>
                    <td className="p-2 text-sm">
                      {formatFecha(visitor.fecha_deteccion)}
                    </td>
                    <td className="p-2 text-sm">{visitor.camara}</td>
                    <td className="p-2">
                      <Badge variant={getEstadoBadgeVariant(visitor.estado)}>
                        <span className="flex items-center gap-1">
                          {getEstadoIcon(visitor.estado)}
                          {getEstadoLabel(visitor.estado)}
                        </span>
                      </Badge>
                    </td>
                    <td className="p-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600"
                            style={{ width: `${visitor.confianza}%` }}
                          />
                        </div>
                        <span className="text-xs">{visitor.confianza}%</span>
                      </div>
                    </td>
                    <td className="p-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedVisitor(visitor)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Detalles
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog para procesar visitante */}
      <Dialog
        open={selectedVisitor !== null}
        onOpenChange={() => setSelectedVisitor(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Procesar Visitante</DialogTitle>
          </DialogHeader>

          {selectedVisitor && (
            <div className="space-y-6">
              {/* Información del visitante */}
              <div className="flex gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={selectedVisitor.foto} alt="Visitante" />
                  <AvatarFallback>
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <div>
                    <Label>Fecha de Detección</Label>
                    <p className="text-sm text-muted-foreground">
                      {formatFecha(selectedVisitor.fecha_deteccion)}
                    </p>
                  </div>
                  <div>
                    <Label>Cámara</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedVisitor.camara}
                    </p>
                  </div>
                  <div>
                    <Label>Confianza de Detección</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedVisitor.confianza}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Formulario de procesamiento */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  const estado = formData.get("estado") as string;
                  const observaciones = formData.get("observaciones") as string;
                  handleProcessVisitor(
                    selectedVisitor.id,
                    estado,
                    observaciones
                  );
                }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="estado">Estado</Label>
                  <Select name="estado" defaultValue={selectedVisitor.estado}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="identificado">Identificado</SelectItem>
                      <SelectItem value="autorizado">Autorizado</SelectItem>
                      <SelectItem value="denegado">Denegado</SelectItem>
                      <SelectItem value="no_identificado">
                        No Identificado
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Textarea
                    name="observaciones"
                    placeholder="Agregar observaciones sobre el visitante..."
                    defaultValue={selectedVisitor.observaciones}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedVisitor(null)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isProcessing}>
                    {isProcessing ? "Procesando..." : "Procesar Visitante"}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para captura de cámara */}
      <Dialog open={showCamera} onOpenChange={setShowCamera}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Capturar Visitante</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <CameraCapture
              onCapture={handleCameraCapture}
              onFileSelect={async (file: File) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                  if (e.target?.result) {
                    handleCameraCapture(e.target.result as string);
                  }
                };
                reader.readAsDataURL(file);
              }}
              onClose={() => setShowCamera(false)}
            />

            {isAnalyzing && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Analizando imagen con IA...
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
