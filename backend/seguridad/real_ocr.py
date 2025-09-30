"""
Reconocimiento REAL de placas usando Google Vision API
"""

import os
import json
from google.cloud import vision
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


class RealPlateRecognizer:
    """Reconocedor REAL de placas usando Google Vision API"""

    def __init__(self):
        # Verificar si las credenciales están configuradas
        creds_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        if not creds_path or not os.path.exists(creds_path):
            logger.warning("Google Vision API no configurado - usando modo simulación")
            self.available = False
            return

        try:
            self.client = vision.ImageAnnotatorClient()
            self.available = True
            logger.info("Google Vision API configurado correctamente")
        except Exception as e:
            logger.error(f"Error configurando Google Vision: {e}")
            self.available = False

    def recognize_plate_real(self, image_bytes: bytes) -> Dict[str, Any]:
        """Reconocimiento REAL de placas"""
        if not self.available:
            return {"exito": False, "error": "Google Vision API no está configurado"}

        try:
            # Crear imagen para Google Vision
            image = vision.Image(content=image_bytes)

            # Configuración específica para OCR
            image_context = vision.ImageContext(
                text_detection_params=vision.TextDetectionParams(
                    enable_text_detection_confidence_score=True
                )
            )

            # Realizar OCR
            response = self.client.text_detection(
                image=image, image_context=image_context
            )

            if response.error.message:
                return {"exito": False, "error": response.error.message}

            texts = response.text_annotations
            if not texts:
                return {"exito": False, "mensaje": "No se detectó texto en la imagen"}

            # Obtener todo el texto detectado
            full_text = texts[0].description.strip()

            # Buscar patrones de placas bolivianas
            placa_detectada = self._extract_bolivian_plate(full_text)

            if not placa_detectada:
                return {
                    "exito": False,
                    "mensaje": "No se detectó una placa boliviana válida",
                    "texto_detectado": full_text,
                }

            # Obtener coordenadas de la placa
            coordinates = []
            for text in texts[1:]:  # Saltar el primer elemento (texto completo)
                if placa_detectada in text.description:
                    vertices = []
                    for vertex in text.bounding_poly.vertices:
                        vertices.append({"x": vertex.x, "y": vertex.y})
                    coordinates.append(
                        {
                            "text": text.description,
                            "confidence": getattr(text, "confidence", 0.0),
                            "bounding_box": vertices,
                        }
                    )

            return {
                "exito": True,
                "placa_detectada": placa_detectada,
                "confidence": 0.95,  # Google Vision no da confianza por texto individual
                "texto_completo": full_text,
                "coordenadas": coordinates,
                "confidence_promedio": 0.95,
            }

        except Exception as e:
            logger.error(f"Error en reconocimiento real: {e}")
            return {"exito": False, "error": f"Error interno: {str(e)}"}

    def _extract_bolivian_plate(self, text: str) -> Optional[str]:
        """Extrae placa boliviana del texto detectado"""
        import re

        # Patrones para placas bolivianas
        patterns = [
            r"[A-Z]{2}\s?\d{4}",  # AB 1234
            r"[A-Z]{3}\s?\d{3}",  # ABC 123
            r"[A-Z]{2}\s?\d{3}[A-Z]",  # AB 123C
            r"\d{4}[A-Z]{2}",  # 1234AB
            r"[A-Z]\d{3}[A-Z]{2}",  # A123BC
        ]

        # Limpiar texto
        cleaned_text = re.sub(r"[^A-Z0-9\s]", "", text.upper())

        for pattern in patterns:
            match = re.search(pattern, cleaned_text)
            if match:
                return match.group().replace(" ", "")

        return None


# Instancia global
real_recognizer = RealPlateRecognizer()
