"""
Servicios de desarrollo para el módulo de seguridad
Permite probar el sistema sin credenciales reales
"""

import logging
from typing import Dict, Any
import random
import time

logger = logging.getLogger(__name__)


class DevAWSRekognitionService:
    """Servicio simulado de AWS Rekognition para desarrollo"""

    def __init__(self):
        self.available = True
        self.collection_id = "dev-condominio-faces"
        logger.info("🔧 Usando AWS Rekognition simulado (desarrollo)")

    def crear_coleccion(self) -> Dict[str, Any]:
        """Simular creación de colección"""
        return {
            "exito": True,
            "mensaje": f"Colección simulada '{self.collection_id}' creada",
            "status_code": 200,
        }

    def indexar_rostro(self, imagen_bytes: bytes, persona_id: str) -> Dict[str, Any]:
        """Simular indexación de rostro"""
        time.sleep(0.5)  # Simular procesamiento
        return {
            "exito": True,
            "face_id": f"dev-face-{persona_id}-{random.randint(1000, 9999)}",
            "external_image_id": persona_id,
            "confidence": round(random.uniform(85.0, 99.0), 2),
        }

    def buscar_rostro(self, imagen_bytes: bytes) -> Dict[str, Any]:
        """Simular búsqueda de rostro"""
        time.sleep(0.8)  # Simular procesamiento

        # 70% de probabilidad de encontrar rostro
        if random.random() < 0.7:
            return {
                "exito": True,
                "persona_id": f"persona-{random.randint(1, 10)}",
                "confidence": round(random.uniform(80.0, 95.0), 2),
                "face_id": f"dev-face-{random.randint(1000, 9999)}",
            }
        else:
            return {
                "exito": False,
                "mensaje": "No se encontró rostro coincidente (simulado)",
            }

    def detectar_rostros(self, imagen_bytes: bytes) -> Dict[str, Any]:
        """Simular detección de rostros"""
        return {
            "exito": True,
            "rostros_detectados": random.randint(1, 3),
            "rostros": [
                {
                    "confidence": round(random.uniform(85.0, 99.0), 2),
                    "bounding_box": {
                        "Width": 0.3,
                        "Height": 0.4,
                        "Left": 0.2,
                        "Top": 0.1,
                    },
                }
            ],
        }


class DevGoogleVisionService:
    """Servicio simulado de Google Vision para desarrollo"""

    def __init__(self):
        self.available = True
        logger.info("🔧 Usando Google Vision simulado (desarrollo)")

    def detectar_vehiculo(self, imagen_bytes: bytes) -> Dict[str, Any]:
        """Simular detección de vehículo y placa"""
        time.sleep(1.0)  # Simular procesamiento

        placas_simuladas = [
            "1234ABC",
            "5678DEF",
            "9012GHI",
            "3456JKL",
            "7890MNO",
            "1852PHD",
            "0632580",
            "4567PQR",
        ]

        # 80% de probabilidad de detectar placa
        if random.random() < 0.8:
            placa = random.choice(placas_simuladas)
            return {
                "exito": True,
                "placa_detectada": placa,
                "confidence": round(random.uniform(0.85, 0.98), 2),
                "texto_completo": f"BOLIVIA {placa} 2024",
                "coordenadas": [
                    {
                        "text": placa,
                        "confidence": round(random.uniform(0.85, 0.98), 2),
                        "bounding_box": [
                            {"x": 150, "y": 200},
                            {"x": 350, "y": 200},
                            {"x": 350, "y": 250},
                            {"x": 150, "y": 250},
                        ],
                    }
                ],
                "modo": "dev_simulation",
            }
        else:
            return {
                "exito": False,
                "mensaje": "No se detectó placa válida (simulado)",
                "texto_detectado": "TEXTO ILEGIBLE",
                "modo": "dev_simulation_no_plate",
            }


class DevSeguridadAIService:
    """Servicio principal simulado para desarrollo"""

    def __init__(self):
        self.aws_service = DevAWSRekognitionService()
        self.google_service = DevGoogleVisionService()
        logger.info("🔧 Sistema de seguridad en modo desarrollo")

    def procesar_reconocimiento_facial(
        self, imagen_bytes: bytes, tipo_acceso: str
    ) -> Dict[str, Any]:
        """Procesar reconocimiento facial simulado"""
        try:
            resultado_busqueda = self.aws_service.buscar_rostro(imagen_bytes)

            if not resultado_busqueda["exito"]:
                return {
                    "exito": False,
                    "mensaje": "Rostro no reconocido (simulado)",
                    "tipo_acceso": tipo_acceso,
                    "modo": "dev_simulation",
                }

            return {
                "exito": True,
                "persona_id": resultado_busqueda["persona_id"],
                "confidence": resultado_busqueda["confidence"],
                "tipo_acceso": tipo_acceso,
                "face_id": resultado_busqueda.get("face_id"),
                "modo": "dev_simulation",
            }

        except Exception as e:
            logger.error(f"Error en procesamiento facial simulado: {e}")
            return {
                "exito": False,
                "error": str(e),
                "tipo_acceso": tipo_acceso,
                "modo": "dev_simulation_error",
            }

    def procesar_reconocimiento_placa(self, imagen_bytes: bytes) -> Dict[str, Any]:
        """Procesar reconocimiento de placa simulado"""
        try:
            resultado = self.google_service.detectar_vehiculo(imagen_bytes)
            return resultado

        except Exception as e:
            logger.error(f"Error en procesamiento de placa simulado: {e}")
            return {
                "exito": False,
                "error": str(e),
                "modo": "dev_simulation_error",
            }


# Instancia global para desarrollo
dev_seguridad_ai = DevSeguridadAIService()

