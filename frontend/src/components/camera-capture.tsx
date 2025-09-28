import React, { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Square, RotateCcw, Upload } from "lucide-react";
import { toast } from "sonner";

interface CameraCaptureProps {
  onCapture: (imageBlob: Blob, imageUrl: string) => void;
  onFileSelect: (file: File, imageUrl: string) => void;
  title?: string;
  description?: string;
}

export default function CameraCapture({
  onCapture,
  onFileSelect,
  title = "Capturar Imagen",
  description = "Use la cámara o seleccione una imagen",
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreaming(true);
        toast.success("Cámara activada correctamente");
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("No se pudo acceder a la cámara. Verifique los permisos.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setStreaming(false);
      toast.info("Cámara desactivada");
    }
  }, []);

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const imageUrl = URL.createObjectURL(blob);
          setCapturedImage(imageUrl);
          onCapture(blob, imageUrl);
          stopCamera();
          toast.success("Imagen capturada exitosamente");
        }
      },
      "image/jpeg",
      0.9
    );
  }, [onCapture, stopCamera]);

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && file.type.startsWith("image/")) {
        const imageUrl = URL.createObjectURL(file);
        setCapturedImage(imageUrl);
        onFileSelect(file, imageUrl);
        toast.success("Imagen seleccionada correctamente");
      } else {
        toast.error("Por favor seleccione un archivo de imagen válido");
      }
    },
    [onFileSelect]
  );

  const resetCapture = useCallback(() => {
    setCapturedImage(null);
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
    }
  }, [capturedImage]);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        {/* Vista previa de imagen capturada */}
        {capturedImage && (
          <div className="relative">
            <img
              src={capturedImage}
              alt="Imagen capturada"
              className="w-full max-w-md mx-auto rounded-lg border"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={resetCapture}
              className="absolute top-2 right-2"
            >
              <RotateCcw className="h-4 w-4" />
              Nueva captura
            </Button>
          </div>
        )}

        {/* Video stream */}
        {streaming && !capturedImage && (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full max-w-md mx-auto rounded-lg border"
            />
            <Button
              onClick={captureImage}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
              size="lg"
            >
              <Square className="h-6 w-6 mr-2" />
              Capturar
            </Button>
          </div>
        )}

        {/* Canvas oculto para procesamiento */}
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {/* Controles */}
        {!capturedImage && (
          <div className="flex gap-2 justify-center">
            {!streaming ? (
              <Button onClick={startCamera} variant="default">
                <Camera className="h-4 w-4 mr-2" />
                Activar Cámara
              </Button>
            ) : (
              <Button onClick={stopCamera} variant="outline">
                Desactivar Cámara
              </Button>
            )}

            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
            >
              <Upload className="h-4 w-4 mr-2" />
              Subir Imagen
            </Button>
          </div>
        )}

        {/* Input oculto para seleccionar archivos */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
      </div>
    </Card>
  );
}
