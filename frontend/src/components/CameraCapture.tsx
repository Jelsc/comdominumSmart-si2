import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Upload, X, Check } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onFileSelect: (file: File) => void;
  onClose: () => void;
  title?: string;
  isProcessing?: boolean;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  onFileSelect,
  onClose,
  title = "Capturar Imagen",
  isProcessing = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setError("");
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("No se pudo acceder a la cámara. Verifique los permisos.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsVideoReady(false);
  };

  const handleVideoLoad = () => {
    setIsVideoReady(true);
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current || !isVideoReady) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      // Convert to base64
      const imageData = canvas.toDataURL("image/jpeg", 0.8);
      onCapture(imageData);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      onFileSelect(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            {title}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={startCamera} variant="outline">
                Reintentar
              </Button>
            </div>
          ) : (
            <>
              {/* Video preview */}
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  onLoadedMetadata={handleVideoLoad}
                  className="w-full rounded-lg bg-black"
                  style={{ maxHeight: "400px" }}
                />
                {!isVideoReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                    <p className="text-gray-500">Iniciando cámara...</p>
                  </div>
                )}
              </div>

              {/* Hidden canvas for capture */}
              <canvas ref={canvasRef} style={{ display: "none" }} />

              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={captureImage}
                  disabled={!isVideoReady || isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Procesando...
                    </div>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 mr-2" />
                      Capturar Foto
                    </>
                  )}
                </Button>

                <Button
                  onClick={triggerFileInput}
                  variant="outline"
                  disabled={isProcessing}
                  className="flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Subir Imagen
                </Button>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />

              {/* Instructions */}
              <div className="text-sm text-gray-600 text-center">
                <p>
                  Toma una foto con la cámara o sube una imagen desde tu
                  dispositivo
                </p>
                <p>Asegúrate de que el rostro esté bien iluminado y centrado</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CameraCapture;
