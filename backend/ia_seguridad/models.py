from django.db import models
from django.contrib.auth import get_user_model
from residentes.models import Residente
import uuid

User = get_user_model()


class Camara(models.Model):
    """Cámaras de seguridad del condominio"""
    ESTADO_CHOICES = [
        ('activa', 'Activa'),
        ('inactiva', 'Inactiva'),
        ('mantenimiento', 'Mantenimiento'),
        ('error', 'Error'),
    ]
    
    TIPO_CHOICES = [
        ('fija', 'Cámara Fija'),
        ('ptz', 'Cámara PTZ'),
        ('domo', 'Domo'),
        ('bullet', 'Bullet'),
    ]
    
    nombre = models.CharField(max_length=100)
    ubicacion = models.CharField(max_length=200)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default='fija')
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='activa')
    ip = models.GenericIPAddressField()
    puerto = models.IntegerField(default=554)
    usuario = models.CharField(max_length=50, blank=True)
    password = models.CharField(max_length=100, blank=True)
    url_rtsp = models.URLField(blank=True)
    configuracion = models.JSONField(default=dict, blank=True)
    fecha_instalacion = models.DateTimeField(auto_now_add=True)
    ultima_verificacion = models.DateTimeField(null=True, blank=True)
    activa = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = "Cámara"
        verbose_name_plural = "Cámaras"
        
    def __str__(self):
        return f"{self.nombre} - {self.ubicacion}"


class FotoResidente(models.Model):
    """Fotos de referencia para reconocimiento facial de residentes"""
    residente = models.ForeignKey(
        Residente, 
        on_delete=models.CASCADE, 
        related_name='fotos_referencia'
    )
    imagen = models.ImageField(upload_to='fotos_residentes/')
    encoding_facial = models.TextField(
        help_text="Encoding facial generado por face_recognition",
        blank=True
    )
    es_principal = models.BooleanField(default=False)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    activo = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Foto de Residente"
        verbose_name_plural = "Fotos de Residentes"

    def __str__(self):
        return f"Foto de {self.residente.nombre} {self.residente.apellido}"


class Vehiculo(models.Model):
    """Vehículos autorizados en el condominio"""
    TIPO_CHOICES = [
        ('auto', 'Automóvil'),
        ('moto', 'Motocicleta'),
        ('camioneta', 'Camioneta'),
        ('bicicleta', 'Bicicleta'),
    ]
    
    residente = models.ForeignKey(
        Residente, 
        on_delete=models.CASCADE, 
        related_name='vehiculos'
    )
    placa = models.CharField(max_length=10, unique=True)
    marca = models.CharField(max_length=50)
    modelo = models.CharField(max_length=50)
    color = models.CharField(max_length=30)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    activo = models.BooleanField(default=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Vehículo"
        verbose_name_plural = "Vehículos"

    def __str__(self):
        return f"{self.placa} - {self.residente.nombre}"


class Visitante(models.Model):
    """Registro automático de visitantes con foto"""
    nombre = models.CharField(max_length=100, blank=True)
    ci = models.CharField(max_length=20, blank=True)
    foto_entrada = models.ImageField(upload_to='visitantes/')
    encoding_facial = models.TextField(blank=True)
    residente_visitado = models.ForeignKey(
        Residente, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    fecha_entrada = models.DateTimeField(auto_now_add=True)
    fecha_salida = models.DateTimeField(null=True, blank=True)
    autorizado_por = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True
    )
    observaciones = models.TextField(blank=True)

    class Meta:
        verbose_name = "Visitante"
        verbose_name_plural = "Visitantes"

    def __str__(self):
        return f"Visitante {self.nombre or 'Sin nombre'} - {self.fecha_entrada}"


class RegistroAcceso(models.Model):
    """Registro de todos los accesos al condominio"""
    TIPO_ACCESO_CHOICES = [
        ('entrada', 'Entrada'),
        ('salida', 'Salida'),
    ]
    
    TIPO_PERSONA_CHOICES = [
        ('residente', 'Residente'),
        ('visitante', 'Visitante'),
        ('personal', 'Personal'),
        ('desconocido', 'Desconocido'),
    ]
    
    tipo_acceso = models.CharField(max_length=10, choices=TIPO_ACCESO_CHOICES)
    tipo_persona = models.CharField(max_length=20, choices=TIPO_PERSONA_CHOICES)
    residente = models.ForeignKey(Residente, null=True, blank=True, on_delete=models.SET_NULL)
    visitante = models.ForeignKey(Visitante, null=True, blank=True, on_delete=models.SET_NULL)
    foto_acceso = models.ImageField(upload_to='accesos/')
    confianza_reconocimiento = models.FloatField(
        help_text="Nivel de confianza del reconocimiento facial (0-100)",
        default=0
    )
    placa_vehiculo = models.CharField(max_length=10, blank=True)
    fecha_hora = models.DateTimeField(auto_now_add=True)
    camara_id = models.CharField(max_length=50, default="cam_01")
    
    class Meta:
        verbose_name = "Registro de Acceso"
        verbose_name_plural = "Registros de Acceso"
        ordering = ['-fecha_hora']

    def __str__(self):
        return f"{self.get_tipo_acceso_display()} - {self.fecha_hora}"


class AlertaSeguridad(models.Model):
    """Alertas automáticas generadas por IA"""
    TIPO_ALERTA_CHOICES = [
        ('acceso_no_autorizado', 'Acceso No Autorizado'),
        ('persona_desconocida', 'Persona Desconocida'),
        ('vehiculo_no_autorizado', 'Vehículo No Autorizado'),
        ('comportamiento_sospechoso', 'Comportamiento Sospechoso'),
        ('perro_suelto', 'Perro Suelto'),
        ('mal_estacionamiento', 'Mal Estacionamiento'),
        ('zona_restringida', 'Acceso a Zona Restringida'),
    ]
    
    NIVEL_CHOICES = [
        ('bajo', 'Bajo'),
        ('medio', 'Medio'),
        ('alto', 'Alto'),
        ('critico', 'Crítico'),
    ]
    
    tipo_alerta = models.CharField(max_length=30, choices=TIPO_ALERTA_CHOICES)
    nivel = models.CharField(max_length=10, choices=NIVEL_CHOICES, default='medio')
    descripcion = models.TextField()
    foto_evidencia = models.ImageField(upload_to='alertas/', null=True, blank=True)
    camara_id = models.CharField(max_length=50)
    fecha_hora = models.DateTimeField(auto_now_add=True)
    resuelto = models.BooleanField(default=False)
    resuelto_por = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    fecha_resolucion = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = "Alerta de Seguridad"
        verbose_name_plural = "Alertas de Seguridad"
        ordering = ['-fecha_hora']

    def __str__(self):
        return f"{self.get_tipo_alerta_display()} - {self.nivel} - {self.fecha_hora}"


class ConfiguracionIA(models.Model):
    """Configuración de parámetros de IA"""
    # Reconocimiento Facial
    umbral_confianza_facial = models.FloatField(
        default=0.6,
        help_text="Umbral de confianza para reconocimiento facial (0.0-1.0)"
    )
    
    # OCR de Placas
    umbral_confianza_ocr = models.FloatField(
        default=0.8,
        help_text="Umbral de confianza para OCR de placas (0.0-1.0)"
    )
    
    # Detección de Anomalías
    activo_deteccion_anomalias = models.BooleanField(default=True)
    sensibilidad_anomalias = models.IntegerField(
        default=5,
        help_text="Sensibilidad de detección (1-10, donde 10 es más sensible)"
    )
    
    # Horarios de operación
    horario_inicio = models.TimeField(default="06:00")
    horario_fin = models.TimeField(default="22:00")
    
    # Notificaciones
    enviar_notificaciones_push = models.BooleanField(default=True)
    email_alertas = models.EmailField(blank=True)
    
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Configuración de IA"
        verbose_name_plural = "Configuraciones de IA"

    def __str__(self):
        return f"Configuración IA - {self.fecha_actualizacion}"


class EstadisticaSeguridad(models.Model):
    """Estadísticas diarias de seguridad para reportes"""
    fecha = models.DateField(unique=True)
    total_accesos = models.IntegerField(default=0)
    accesos_residentes = models.IntegerField(default=0)
    accesos_visitantes = models.IntegerField(default=0)
    accesos_denegados = models.IntegerField(default=0)
    alertas_generadas = models.IntegerField(default=0)
    vehiculos_detectados = models.IntegerField(default=0)
    
    class Meta:
        verbose_name = "Estadística de Seguridad"
        verbose_name_plural = "Estadísticas de Seguridad"
        ordering = ['-fecha']

    def __str__(self):
        return f"Estadísticas {self.fecha}"
