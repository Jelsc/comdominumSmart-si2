"""
Implementación básica de IA sin dependencias externas
Para desarrollo rápido sin instalar librerías complejas
"""
# Imports condicionales para evitar problemas
try:
    from PIL import Image
    PIL_DISPONIBLE = True
except ImportError:
    PIL_DISPONIBLE = False
    Image = None

import base64
import logging
from io import BytesIO
import re

logger = logging.getLogger(__name__)


class ReconocimientoFacialBasico:
    """Servicio básico de reconocimiento facial (simulado para desarrollo)"""
    
    @staticmethod
    def generar_encoding_facial(imagen_path_o_bytes):
        """
        Simula la generación de encoding facial
        En producción esto sería reemplazado por face_recognition
        """
        try:
            # Simulamos un encoding facial básico basado en el hash de la imagen
            if isinstance(imagen_path_o_bytes, str):
                with open(imagen_path_o_bytes, 'rb') as f:
                    imagen_bytes = f.read()
            else:
                imagen_bytes = imagen_path_o_bytes
            
            # Generar un "encoding" simple basado en características de la imagen
            imagen_hash = hash(imagen_bytes) % 1000000
            
            # Simular un encoding de 128 dimensiones como face_recognition
            encoding_simulado = [float(imagen_hash + i) / 1000000 for i in range(128)]
            
            logger.info("Encoding facial simulado generado")
            return encoding_simulado
            
        except Exception as e:
            logger.error(f"Error generando encoding facial simulado: {e}")
            return None
    
    @staticmethod
    def comparar_caras(encoding1, encoding2, tolerancia=0.6):
        """
        Simula la comparación de encodings faciales
        En producción esto sería reemplazado por face_recognition
        """
        try:
            if not encoding1 or not encoding2:
                return False, 0
            
            # Calcular una "distancia" simulada
            diferencias = [abs(e1 - e2) for e1, e2 in zip(encoding1[:10], encoding2[:10])]
            distancia_simulada = sum(diferencias) / len(diferencias)
            
            # Simular confianza basada en la distancia
            confianza = max(0, (1 - distancia_simulada * 10) * 100)
            es_coincidencia = confianza > (tolerancia * 100)
            
            logger.info(f"Comparación facial simulada: confianza={confianza}")
            return es_coincidencia, confianza
            
        except Exception as e:
            logger.error(f"Error comparando caras simuladas: {e}")
            return False, 0


class OCRPlacasBasico:
    """Servicio básico de OCR para placas (simulado)"""
    
    @staticmethod
    def extraer_texto_placa(imagen_path_o_bytes):
        """
        Simula la extracción de texto de placas
        En producción esto sería reemplazado por pytesseract
        """
        try:
            # Simulamos algunas placas de ejemplo para demostración
            placas_simuladas = [
                "ABC123", "XYZ789", "DEF456", "GHI012", "JKL345",
                "MNO678", "PQR901", "STU234", "VWX567", "YZA890"
            ]
            
            # Seleccionar una placa "aleatoria" basada en la imagen
            if isinstance(imagen_path_o_bytes, str):
                with open(imagen_path_o_bytes, 'rb') as f:
                    imagen_bytes = f.read()
            else:
                imagen_bytes = imagen_path_o_bytes
            
            placa_index = hash(imagen_bytes) % len(placas_simuladas)
            placa_simulada = placas_simuladas[placa_index]
            
            confianza_simulada = 85.0  # Confianza fija para demo
            
            logger.info(f"OCR simulado: placa={placa_simulada}, confianza={confianza_simulada}")
            return placa_simulada, confianza_simulada
            
        except Exception as e:
            logger.error(f"Error en OCR simulado: {e}")
            return None, 0
    
    @staticmethod
    def limpiar_texto_placa(texto):
        """Limpia y valida texto de placa"""
        if not texto:
            return None
            
        # Remover espacios y caracteres especiales
        texto_limpio = re.sub(r'[^A-Z0-9]', '', texto.upper())
        
        # Validar longitud
        if 4 <= len(texto_limpio) <= 8:
            return texto_limpio
            
        return None


class DeteccionAnomaliaBasico:
    """Servicio básico de detección de anomalías (simulado)"""
    
    @staticmethod
    def detectar_perros_sueltos(imagen_path_o_bytes):
        """
        Simula la detección de perros
        En producción esto sería reemplazado por YOLO o similar
        """
        try:
            # Simular detección aleatoria
            if isinstance(imagen_path_o_bytes, str):
                with open(imagen_path_o_bytes, 'rb') as f:
                    imagen_bytes = f.read()
            else:
                imagen_bytes = imagen_path_o_bytes
            
            # "Detectar" perros basado en el hash de la imagen
            deteccion_hash = hash(imagen_bytes) % 100
            perros_detectados = deteccion_hash < 20  # 20% probabilidad
            confianza = 70 if perros_detectados else 30
            
            logger.info(f"Detección de perros simulada: {perros_detectados}, confianza={confianza}")
            return perros_detectados, confianza
            
        except Exception as e:
            logger.error(f"Error en detección de perros simulada: {e}")
            return False, 0
    
    @staticmethod
    def detectar_mal_estacionamiento(imagen_path_o_bytes, zonas_permitidas=None):
        """
        Simula la detección de mal estacionamiento
        """
        try:
            # Simular detección aleatoria
            if isinstance(imagen_path_o_bytes, str):
                with open(imagen_path_o_bytes, 'rb') as f:
                    imagen_bytes = f.read()
            else:
                imagen_bytes = imagen_path_o_bytes
            
            # "Detectar" mal estacionamiento basado en el hash
            deteccion_hash = hash(imagen_bytes) % 100
            mal_estacionado = deteccion_hash < 15  # 15% probabilidad
            confianza = 75 if mal_estacionado else 25
            
            logger.info(f"Detección de mal estacionamiento simulada: {mal_estacionado}, confianza={confianza}")
            return mal_estacionado, confianza
            
        except Exception as e:
            logger.error(f"Error en detección de mal estacionamiento simulada: {e}")
            return False, 0


class ServicioIABasico:
    """Servicio principal de IA con implementación básica para desarrollo"""
    
    def __init__(self):
        self.reconocimiento_facial = ReconocimientoFacialBasico()
        self.ocr_placas = OCRPlacasBasico()
        self.deteccion_anomalias = DeteccionAnomaliaBasico()
    
    def procesar_imagen_entrada(self, imagen_bytes, tipo_analisis='completo'):
        """
        Procesa imagen con IA básica
        """
        resultado = {
            'facial': None,
            'placa': None,
            'anomalias': None,
            'timestamp': None,
            'modo': 'simulado'  # Indicar que es simulación
        }
        
        try:
            if tipo_analisis in ['facial', 'completo']:
                encoding = self.reconocimiento_facial.generar_encoding_facial(imagen_bytes)
                resultado['facial'] = {
                    'encoding_generado': encoding is not None,
                    'encoding': encoding
                }
            
            if tipo_analisis in ['placa', 'completo']:
                texto_placa, confianza = self.ocr_placas.extraer_texto_placa(imagen_bytes)
                resultado['placa'] = {
                    'texto': texto_placa,
                    'confianza': confianza
                }
            
            if tipo_analisis in ['anomalias', 'completo']:
                perros_detectados, conf_perros = self.deteccion_anomalias.detectar_perros_sueltos(imagen_bytes)
                mal_estacionamiento, conf_estacionamiento = self.deteccion_anomalias.detectar_mal_estacionamiento(imagen_bytes)
                
                resultado['anomalias'] = {
                    'perros_sueltos': {
                        'detectado': perros_detectados,
                        'confianza': conf_perros
                    },
                    'mal_estacionamiento': {
                        'detectado': mal_estacionamiento,
                        'confianza': conf_estacionamiento
                    }
                }
            
            from django.utils import timezone
            resultado['timestamp'] = timezone.now().isoformat()
            
        except Exception as e:
            logger.error(f"Error procesando imagen con IA básica: {e}")
        
        return resultado