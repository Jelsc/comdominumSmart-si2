"""
Servicios de Inteligencia Artificial para Smart Condominium
- Reconocimiento facial con OpenCV y face_recognition
- OCR de placas con Tesseract
- Detección de anomalías
"""

# Imports condicionales para evitar errores durante migraciones
try:
    import cv2
    import face_recognition
    import pytesseract
    import numpy as np
    from PIL import Image
    LIBS_DISPONIBLES = True
except ImportError:
    # Durante el desarrollo y migraciones, usar implementación básica
    from .ia_basico import ServicioIABasico
    LIBS_DISPONIBLES = False
    cv2 = None
    face_recognition = None
    pytesseract = None
    np = None
    Image = None

import re
import os
from django.conf import settings
from django.core.files.base import ContentFile
from io import BytesIO
import base64
import logging

logger = logging.getLogger(__name__)


class ReconocimientoFacialService:
    """Servicio para reconocimiento facial de residentes"""
    
    @staticmethod
    def generar_encoding_facial(imagen_path_o_bytes):
        """
        Genera el encoding facial de una imagen
        Args:
            imagen_path_o_bytes: Ruta de la imagen o bytes de la imagen
        Returns:
            list: Encoding facial o None si no se detecta cara
        """
        try:
            # Cargar imagen
            if isinstance(imagen_path_o_bytes, str):
                imagen = face_recognition.load_image_file(imagen_path_o_bytes)
            else:
                # Si son bytes, convertir a array numpy
                imagen = np.array(Image.open(BytesIO(imagen_path_o_bytes)))
            
            # Detectar caras
            caras_locations = face_recognition.face_locations(imagen)
            
            if len(caras_locations) == 0:
                logger.warning("No se detectaron caras en la imagen")
                return None
                
            # Generar encoding de la primera cara detectada
            encodings = face_recognition.face_encodings(imagen, caras_locations)
            
            if len(encodings) > 0:
                return encodings[0].tolist()  # Convertir a lista para JSON
            
            return None
            
        except Exception as e:
            logger.error(f"Error generando encoding facial: {e}")
            return None
    
    @staticmethod
    def comparar_caras(encoding1, encoding2, tolerancia=0.6):
        """
        Compara dos encodings faciales
        Args:
            encoding1: Lista del primer encoding
            encoding2: Lista del segundo encoding  
            tolerancia: Umbral de similitud (0.0-1.0)
        Returns:
            tuple: (es_coincidencia, distancia)
        """
        try:
            # Convertir listas a numpy arrays
            enc1 = np.array(encoding1)
            enc2 = np.array(encoding2)
            
            # Calcular distancia
            distancia = face_recognition.face_distance([enc1], enc2)[0]
            
            # Determinar si es coincidencia
            es_coincidencia = distancia <= tolerancia
            
            # Convertir distancia a porcentaje de confianza
            confianza = max(0, (1 - distancia) * 100)
            
            return es_coincidencia, confianza
            
        except Exception as e:
            logger.error(f"Error comparando caras: {e}")
            return False, 0


class OCRPlacasService:
    """Servicio para reconocimiento de placas vehiculares"""
    
    @staticmethod
    def configurar_tesseract():
        """Configurar Tesseract para lectura óptima de placas"""
        # Configuración específica para placas vehiculares
        config_placa = (
            '--oem 3 --psm 8 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        )
        return config_placa
    
    @staticmethod
    def preprocesar_imagen_placa(imagen):
        """
        Preprocesa imagen para mejorar OCR de placas
        Args:
            imagen: Imagen OpenCV
        Returns:
            imagen procesada
        """
        try:
            # Convertir a escala de grises
            if len(imagen.shape) == 3:
                gray = cv2.cvtColor(imagen, cv2.COLOR_BGR2GRAY)
            else:
                gray = imagen
            
            # Aplicar filtro gaussiano
            blur = cv2.GaussianBlur(gray, (5, 5), 0)
            
            # Threshold adaptativo
            thresh = cv2.adaptiveThreshold(
                blur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
            )
            
            # Operaciones morfológicas para limpiar
            kernel = np.ones((2, 2), np.uint8)
            processed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
            
            return processed
            
        except Exception as e:
            logger.error(f"Error preprocesando imagen: {e}")
            return imagen
    
    @staticmethod
    def extraer_texto_placa(imagen_path_o_bytes):
        """
        Extrae texto de placa vehicular
        Args:
            imagen_path_o_bytes: Ruta o bytes de imagen
        Returns:
            tuple: (texto_extraido, confianza)
        """
        try:
            # Cargar imagen
            if isinstance(imagen_path_o_bytes, str):
                imagen = cv2.imread(imagen_path_o_bytes)
            else:
                # Convertir bytes a imagen OpenCV
                nparr = np.frombuffer(imagen_path_o_bytes, np.uint8)
                imagen = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if imagen is None:
                return None, 0
            
            # Preprocesar imagen
            imagen_procesada = OCRPlacasService.preprocesar_imagen_placa(imagen)
            
            # Configurar Tesseract
            config = OCRPlacasService.configurar_tesseract()
            
            # Extraer texto
            texto_raw = pytesseract.image_to_string(
                imagen_procesada, 
                config=config,
                lang='eng'
            ).strip()
            
            # Limpiar texto extraído
            texto_limpio = OCRPlacasService.limpiar_texto_placa(texto_raw)
            
            # Obtener confianza del OCR
            try:
                datos_ocr = pytesseract.image_to_data(
                    imagen_procesada, 
                    output_type=pytesseract.Output.DICT,
                    config=config
                )
                confidencias = [int(conf) for conf in datos_ocr['conf'] if int(conf) > 0]
                confianza_promedio = np.mean(confidencias) if confidencias else 0
            except:
                confianza_promedio = 50  # Valor por defecto
            
            return texto_limpio, confianza_promedio
            
        except Exception as e:
            logger.error(f"Error extrayendo texto de placa: {e}")
            return None, 0
    
    @staticmethod
    def limpiar_texto_placa(texto):
        """
        Limpia y valida texto de placa
        Args:
            texto: Texto extraído por OCR
        Returns:
            str: Texto limpio o None si no es válido
        """
        if not texto:
            return None
            
        # Remover espacios y caracteres especiales
        texto_limpio = re.sub(r'[^A-Z0-9]', '', texto.upper())
        
        # Validar formato típico de placas (ejemplo: ABC123, 123ABC, etc.)
        patrones_placa = [
            r'^[A-Z]{3}[0-9]{3}$',  # ABC123
            r'^[0-9]{3}[A-Z]{3}$',  # 123ABC
            r'^[A-Z]{2}[0-9]{4}$',  # AB1234
            r'^[A-Z]{1}[0-9]{5}$',  # A12345
        ]
        
        for patron in patrones_placa:
            if re.match(patron, texto_limpio):
                return texto_limpio
        
        # Si no coincide con patrones pero tiene longitud adecuada
        if 4 <= len(texto_limpio) <= 8:
            return texto_limpio
            
        return None


class DeteccionAnomaliaService:
    """Servicio para detección de comportamientos anómalos"""
    
    @staticmethod
    def detectar_perros_sueltos(imagen_path_o_bytes):
        """
        Detecta perros en la imagen usando OpenCV
        Args:
            imagen_path_o_bytes: Imagen a analizar
        Returns:
            tuple: (perros_detectados, confianza)
        """
        try:
            # Cargar imagen
            if isinstance(imagen_path_o_bytes, str):
                imagen = cv2.imread(imagen_path_o_bytes)
            else:
                nparr = np.frombuffer(imagen_path_o_bytes, np.uint8)
                imagen = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            # Usar cascade classifier para detección de perros (simplificado)
            # En un entorno real, usarías YOLO o un modelo más avanzado
            
            # Por simplicidad, usaremos detección de contornos y análisis básico
            gray = cv2.cvtColor(imagen, cv2.COLOR_BGR2GRAY)
            
            # Detectar contornos
            contornos, _ = cv2.findContours(
                cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)[1],
                cv2.RETR_EXTERNAL, 
                cv2.CHAIN_APPROX_SIMPLE
            )
            
            # Análisis básico de formas (esto es muy simplificado)
            perros_posibles = 0
            for contorno in contornos:
                area = cv2.contourArea(contorno)
                if 1000 < area < 50000:  # Rango de área típico para perros
                    perros_posibles += 1
            
            confianza = min(perros_posibles * 30, 90)  # Confianza básica
            
            return perros_posibles > 0, confianza
            
        except Exception as e:
            logger.error(f"Error detectando perros: {e}")
            return False, 0
    
    @staticmethod
    def detectar_mal_estacionamiento(imagen_path_o_bytes, zonas_permitidas=None):
        """
        Detecta vehículos mal estacionados
        Args:
            imagen_path_o_bytes: Imagen del estacionamiento
            zonas_permitidas: Lista de coordenadas de zonas permitidas
        Returns:
            tuple: (mal_estacionado, confianza)
        """
        try:
            # Cargar imagen
            if isinstance(imagen_path_o_bytes, str):
                imagen = cv2.imread(imagen_path_o_bytes)
            else:
                nparr = np.frombuffer(imagen_path_o_bytes, np.uint8)
                imagen = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            # Detección simplificada de vehículos usando contornos
            gray = cv2.cvtColor(imagen, cv2.COLOR_BGR2GRAY)
            
            # Aplicar filtros para detectar formas rectangulares (vehículos)
            edges = cv2.Canny(gray, 50, 150)
            contornos, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            vehiculos_detectados = 0
            for contorno in contornos:
                area = cv2.contourArea(contorno)
                if area > 5000:  # Área mínima para considerar un vehículo
                    # Aproximar contorno a polígono
                    epsilon = 0.02 * cv2.arcLength(contorno, True)
                    approx = cv2.approxPolyDP(contorno, epsilon, True)
                    
                    # Si tiene aproximadamente 4 esquinas, podría ser un vehículo
                    if len(approx) >= 4:
                        vehiculos_detectados += 1
            
            # Lógica simplificada: si hay vehículos y no hay zonas definidas, asumir mal estacionamiento
            mal_estacionado = vehiculos_detectados > 0 and not zonas_permitidas
            confianza = 60 if mal_estacionado else 20
            
            return mal_estacionado, confianza
            
        except Exception as e:
            logger.error(f"Error detectando mal estacionamiento: {e}")
            return False, 0


class ServicioIAIntegrado:
    """Servicio principal que integra todas las funcionalidades de IA"""
    
    def __init__(self):
        if not LIBS_DISPONIBLES:
            # Usar implementación básica/simulada
            self.servicio_basico = ServicioIABasico()
            self.reconocimiento_facial = self.servicio_basico.reconocimiento_facial
            self.ocr_placas = self.servicio_basico.ocr_placas
            self.deteccion_anomalias = self.servicio_basico.deteccion_anomalias
        else:
            # Usar implementación completa con librerías reales
            self.reconocimiento_facial = ReconocimientoFacialService()
            self.ocr_placas = OCRPlacasService()
            self.deteccion_anomalias = DeteccionAnomaliaService()
    
    def procesar_imagen_entrada(self, imagen_bytes, tipo_analisis='completo'):
        """
        Procesa imagen de entrada con IA
        """
        if not LIBS_DISPONIBLES:
            # Usar servicio básico
            return self.servicio_basico.procesar_imagen_entrada(imagen_bytes, tipo_analisis)
        
        # Usar implementación completa (código original)
        resultado = {
            'facial': None,
            'placa': None,
            'anomalias': None,
            'timestamp': None
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
            logger.error(f"Error procesando imagen: {e}")
        
        return resultado