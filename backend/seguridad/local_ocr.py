"""
Reconocimiento LOCAL de placas usando Tesseract OCR
"""

import cv2
import numpy as np
import pytesseract
import re
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


class LocalPlateRecognizer:
    """Reconocedor LOCAL de placas usando Tesseract"""

    def __init__(self):
        try:
            # Verificar si Tesseract está instalado
            pytesseract.get_tesseract_version()
            self.available = True
            logger.info("Tesseract OCR disponible")
        except Exception as e:
            logger.warning(f"Tesseract no disponible: {e}")
            self.available = False

    def recognize_plate_local(self, image_bytes: bytes) -> Dict[str, Any]:
        """Reconocimiento LOCAL de placas"""
        if not self.available:
            return {"exito": False, "error": "Tesseract OCR no está instalado"}

        try:
            # Convertir bytes a imagen OpenCV
            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if image is None:
                return {"exito": False, "error": "No se pudo decodificar la imagen"}

            # Preprocesar imagen para mejor OCR
            processed_image = self._preprocess_image(image)

            # Configuración de Tesseract para placas
            config = "--oem 3 --psm 8 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

            # Realizar OCR
            text = pytesseract.image_to_string(processed_image, config=config)
            text = text.strip()

            if not text:
                return {"exito": False, "mensaje": "No se detectó texto en la imagen"}

            # Buscar placa boliviana
            placa_detectada = self._extract_bolivian_plate(text)

            if not placa_detectada:
                return {
                    "exito": False,
                    "mensaje": "No se detectó una placa boliviana válida",
                    "texto_detectado": text,
                }

            return {
                "exito": True,
                "placa_detectada": placa_detectada,
                "confidence": 0.85,  # Tesseract no da confianza por defecto
                "texto_completo": text,
                "coordenadas": [
                    {
                        "text": placa_detectada,
                        "confidence": 0.85,
                        "bounding_box": [
                            {"x": 50, "y": 30},
                            {"x": 250, "y": 30},
                            {"x": 250, "y": 80},
                            {"x": 50, "y": 80},
                        ],
                    }
                ],
                "confidence_promedio": 0.85,
            }

        except Exception as e:
            logger.error(f"Error en reconocimiento local: {e}")
            return {"exito": False, "error": f"Error interno: {str(e)}"}

    def _preprocess_image(self, image):
        """Preprocesa la imagen para mejor OCR"""
        # Convertir a escala de grises
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Aplicar filtro gaussiano para reducir ruido
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)

        # Aplicar umbralización adaptativa
        thresh = cv2.adaptiveThreshold(
            blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
        )

        # Operaciones morfológicas para limpiar
        kernel = np.ones((2, 2), np.uint8)
        cleaned = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)

        return cleaned

    def _extract_bolivian_plate(self, text: str) -> Optional[str]:
        """Extrae placa boliviana del texto detectado"""
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
local_recognizer = LocalPlateRecognizer()
