from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class PersonaAutorizada(models.Model):
    """Personas autorizadas para acceso al condominio"""

    TIPOS_ACCESO = [
        ("residente", "Residente"),
        ("personal", "Personal"),
        ("visitante", "Visitante"),
        ("proveedor", "Proveedor"),
    ]

    nombre = models.CharField(max_length=100)
    ci = models.CharField(
        max_length=20, unique=True, verbose_name="Cédula de Identidad"
    )
    telefono = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    tipo_acceso = models.CharField(
        max_length=20, choices=TIPOS_ACCESO, default="visitante"
    )
    activo = models.BooleanField(default=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    # Datos biométricos (referencias a archivos de imagen)
    foto_rostro = models.ImageField(
        upload_to="seguridad/rostros/", blank=True, null=True
    )
    foto_rostro_aws_id = models.CharField(
        max_length=255, blank=True, null=True
    )  # ID en AWS Rekognition

    class Meta:
        verbose_name = "Persona Autorizada"
        verbose_name_plural = "Personas Autorizadas"
        ordering = ["nombre"]

    def __str__(self):
        return f"{self.nombre} ({self.ci})"


class VehiculoAutorizado(models.Model):
    """Vehículos autorizados para acceso al condominio"""

    TIPOS_VEHICULO = [
        ("auto", "Automóvil"),
        ("moto", "Motocicleta"),
        ("camion", "Camión"),
        ("bus", "Bus"),
        ("otro", "Otro"),
    ]

    placa = models.CharField(max_length=10, unique=True)
    propietario = models.CharField(max_length=100)
    tipo_vehiculo = models.CharField(
        max_length=20, choices=TIPOS_VEHICULO, default="auto"
    )
    marca = models.CharField(max_length=50, blank=True, null=True)
    modelo = models.CharField(max_length=50, blank=True, null=True)
    color = models.CharField(max_length=30, blank=True, null=True)
    activo = models.BooleanField(default=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Vehículo Autorizado"
        verbose_name_plural = "Vehículos Autorizados"
        ordering = ["placa"]

    def __str__(self):
        return f"{self.placa} - {self.propietario}"


class RegistroAcceso(models.Model):
    """Registro de intentos de acceso por reconocimiento facial"""

    TIPOS_ACCESO = [
        ("entrada", "Entrada"),
        ("salida", "Salida"),
    ]

    RESULTADOS = [
        ("exitoso", "Exitoso"),
        ("fallido", "Fallido"),
        ("no_autorizado", "No Autorizado"),
        ("error", "Error"),
    ]

    persona = models.ForeignKey(
        PersonaAutorizada, on_delete=models.CASCADE, null=True, blank=True
    )
    tipo_acceso = models.CharField(max_length=20, choices=TIPOS_ACCESO)
    resultado = models.CharField(max_length=20, choices=RESULTADOS)
    confianza = models.FloatField(
        help_text="Nivel de confianza del reconocimiento (0-100)"
    )
    foto_capturada = models.ImageField(
        upload_to="seguridad/accesos/", blank=True, null=True
    )
    fecha_hora = models.DateTimeField(default=timezone.now)
    observaciones = models.TextField(blank=True, null=True)

    # Metadatos del reconocimiento
    coordenadas_rostro = models.JSONField(
        blank=True, null=True
    )  # Coordenadas del rostro detectado
    calidad_imagen = models.FloatField(
        blank=True, null=True
    )  # Calidad de la imagen capturada

    class Meta:
        verbose_name = "Registro de Acceso"
        verbose_name_plural = "Registros de Acceso"
        ordering = ["-fecha_hora"]

    def __str__(self):
        return f"{self.persona.nombre if self.persona else 'Desconocido'} - {self.tipo_acceso} - {self.resultado}"


class RegistroVehiculo(models.Model):
    """Registro de vehículos detectados por OCR de placas"""

    TIPOS_VEHICULO = [
        ("auto", "Automóvil"),
        ("moto", "Motocicleta"),
        ("camion", "Camión"),
        ("bus", "Bus"),
        ("otro", "Otro"),
    ]

    RESULTADOS = [
        ("exitoso", "Exitoso"),
        ("fallido", "Fallido"),
        ("no_autorizado", "No Autorizado"),
        ("error", "Error"),
    ]

    placa = models.CharField(max_length=10)
    vehiculo = models.ForeignKey(
        VehiculoAutorizado, on_delete=models.SET_NULL, null=True, blank=True
    )
    tipo_vehiculo = models.CharField(
        max_length=20, choices=TIPOS_VEHICULO, blank=True, null=True
    )
    resultado = models.CharField(max_length=20, choices=RESULTADOS)
    confianza = models.FloatField(help_text="Nivel de confianza del OCR (0-100)")
    foto_capturada = models.ImageField(
        upload_to="seguridad/vehiculos/", blank=True, null=True
    )
    fecha_hora = models.DateTimeField(default=timezone.now)
    observaciones = models.TextField(blank=True, null=True)

    # Metadatos del OCR
    coordenadas_placa = models.JSONField(
        blank=True, null=True
    )  # Coordenadas de la placa detectada
    texto_detectado = models.CharField(
        max_length=50, blank=True, null=True
    )  # Texto detectado por OCR

    class Meta:
        verbose_name = "Registro de Vehículo"
        verbose_name_plural = "Registros de Vehículos"
        ordering = ["-fecha_hora"]

    def __str__(self):
        return (
            f"{self.placa} - {self.tipo_vehiculo or 'Desconocido'} - {self.resultado}"
        )


class ConfiguracionSeguridad(models.Model):
    """Configuración del sistema de seguridad"""

    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)
    configuracion = models.JSONField(default=dict)
    activo = models.BooleanField(default=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Configuración de Seguridad"
        verbose_name_plural = "Configuraciones de Seguridad"

    def __str__(self):
        return self.nombre


class AlertaSeguridad(models.Model):
    """Alertas generadas por el sistema de seguridad"""

    TIPOS_ALERTA = [
        ("acceso_no_autorizado", "Acceso No Autorizado"),
        ("vehiculo_no_autorizado", "Vehículo No Autorizado"),
        ("comportamiento_sospechoso", "Comportamiento Sospechoso"),
        ("sistema_error", "Error del Sistema"),
        ("mantenimiento", "Mantenimiento Requerido"),
    ]

    SEVERIDADES = [
        ("baja", "Baja"),
        ("media", "Media"),
        ("alta", "Alta"),
        ("critica", "Crítica"),
    ]

    tipo = models.CharField(max_length=30, choices=TIPOS_ALERTA)
    severidad = models.CharField(max_length=10, choices=SEVERIDADES, default="media")
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField()
    fecha_hora = models.DateTimeField(default=timezone.now)
    resuelta = models.BooleanField(default=False)
    fecha_resolucion = models.DateTimeField(blank=True, null=True)
    resuelta_por = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True
    )

    # Referencias a registros relacionados
    registro_acceso = models.ForeignKey(
        RegistroAcceso, on_delete=models.CASCADE, null=True, blank=True
    )
    registro_vehiculo = models.ForeignKey(
        RegistroVehiculo, on_delete=models.CASCADE, null=True, blank=True
    )

    class Meta:
        verbose_name = "Alerta de Seguridad"
        verbose_name_plural = "Alertas de Seguridad"
        ordering = ["-fecha_hora"]

    def __str__(self):
        return f"{self.titulo} - {self.severidad}"
