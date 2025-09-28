from django.db import models
from django.contrib.auth import get_user_model
from personal.models import Personal

User = get_user_model()


class CategoriaMantenimiento(models.Model):
    """Categorías de tareas de mantenimiento"""
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    color = models.CharField(max_length=7, default="#007bff", help_text="Color hexadecimal")
    icono = models.CharField(max_length=50, blank=True)
    activo = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Categoría de Mantenimiento"
        verbose_name_plural = "Categorías de Mantenimiento"

    def __str__(self):
        return self.nombre


class TareaMantenimiento(models.Model):
    """Tareas de mantenimiento preventivo y correctivo"""
    PRIORIDAD_CHOICES = [
        ('baja', 'Baja'),
        ('media', 'Media'),
        ('alta', 'Alta'),
        ('urgente', 'Urgente'),
    ]

    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('en_proceso', 'En Proceso'),
        ('completada', 'Completada'),
        ('cancelada', 'Cancelada'),
        ('pausada', 'Pausada'),
    ]

    TIPO_CHOICES = [
        ('preventivo', 'Mantenimiento Preventivo'),
        ('correctivo', 'Mantenimiento Correctivo'),
        ('emergencia', 'Emergencia'),
        ('mejora', 'Mejora/Actualización'),
    ]

    titulo = models.CharField(max_length=200)
    descripcion = models.TextField()
    categoria = models.ForeignKey(CategoriaMantenimiento, on_delete=models.CASCADE)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    prioridad = models.CharField(max_length=20, choices=PRIORIDAD_CHOICES, default='media')
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='pendiente')
    
    # Asignación
    asignado_a = models.ForeignKey(
        Personal, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        help_text="Personal interno asignado"
    )
    proveedor_externo = models.CharField(
        max_length=200, 
        blank=True,
        help_text="Empresa o proveedor externo"
    )
    
    # Fechas
    fecha_programada = models.DateTimeField()
    fecha_inicio = models.DateTimeField(null=True, blank=True)
    fecha_completion = models.DateTimeField(null=True, blank=True)
    fecha_limite = models.DateField(null=True, blank=True)
    
    # Información adicional
    ubicacion = models.CharField(max_length=200)
    materiales_necesarios = models.TextField(blank=True)
    herramientas_necesarias = models.TextField(blank=True)
    tiempo_estimado = models.DecimalField(max_digits=5, decimal_places=2, default=0, help_text="Horas")
    
    # Costos
    costo_estimado = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    costo_real = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Documentación
    fotos_antes = models.JSONField(blank=True, null=True)
    fotos_despues = models.JSONField(blank=True, null=True)
    documentos = models.JSONField(blank=True, null=True)
    
    # Recurrencia para mantenimiento preventivo
    es_recurrente = models.BooleanField(default=False)
    frecuencia_dias = models.IntegerField(null=True, blank=True)
    proxima_fecha = models.DateField(null=True, blank=True)
    
    # Gestión
    creado_por = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Tarea de Mantenimiento"
        verbose_name_plural = "Tareas de Mantenimiento"
        ordering = ['-fecha_programada']

    def __str__(self):
        return f"{self.titulo} - {self.get_prioridad_display()}"


class SeguimientoTarea(models.Model):
    """Seguimiento del progreso de tareas"""
    tarea = models.ForeignKey(TareaMantenimiento, on_delete=models.CASCADE)
    descripcion = models.TextField()
    porcentaje_completado = models.IntegerField(default=0)
    horas_trabajadas = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    costo_parcial = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    fotos = models.JSONField(blank=True, null=True)
    fecha_reporte = models.DateTimeField(auto_now_add=True)
    reportado_por = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    class Meta:
        verbose_name = "Seguimiento de Tarea"
        verbose_name_plural = "Seguimientos de Tareas"
        ordering = ['-fecha_reporte']

    def __str__(self):
        return f"{self.tarea.titulo} - {self.porcentaje_completado}%"


class Material(models.Model):
    """Materiales utilizados en mantenimiento"""
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    unidad_medida = models.CharField(max_length=20, default='unidad')
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    stock_actual = models.IntegerField(default=0)
    stock_minimo = models.IntegerField(default=0)
    proveedor = models.CharField(max_length=200, blank=True)
    activo = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Material"
        verbose_name_plural = "Materiales"

    def __str__(self):
        return self.nombre


class MaterialUtilizado(models.Model):
    """Materiales utilizados en una tarea específica"""
    tarea = models.ForeignKey(TareaMantenimiento, on_delete=models.CASCADE)
    material = models.ForeignKey(Material, on_delete=models.CASCADE)
    cantidad = models.DecimalField(max_digits=10, decimal_places=2)
    costo_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    fecha_uso = models.DateField(auto_now_add=True)

    class Meta:
        verbose_name = "Material Utilizado"
        verbose_name_plural = "Materiales Utilizados"

    def __str__(self):
        return f"{self.material.nombre} - {self.cantidad} {self.material.unidad_medida}"
    
    @property
    def costo_total(self):
        return self.cantidad * self.costo_unitario


class IncidenteMantenimiento(models.Model):
    """Incidentes reportados que requieren mantenimiento"""
    ESTADO_CHOICES = [
        ('reportado', 'Reportado'),
        ('evaluando', 'En Evaluación'),
        ('aprobado', 'Aprobado'),
        ('asignado', 'Asignado'),
        ('resuelto', 'Resuelto'),
        ('cerrado', 'Cerrado'),
    ]

    URGENCIA_CHOICES = [
        ('baja', 'Baja'),
        ('media', 'Media'),
        ('alta', 'Alta'),
        ('critica', 'Crítica'),
    ]

    titulo = models.CharField(max_length=200)
    descripcion = models.TextField()
    ubicacion = models.CharField(max_length=200)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='reportado')
    urgencia = models.CharField(max_length=20, choices=URGENCIA_CHOICES, default='media')
    
    # Reportado por residente o personal
    reportado_por_usuario = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    contacto_reportador = models.CharField(max_length=200, blank=True)
    
    # Imágenes del incidente
    fotos_incidente = models.JSONField(blank=True, null=True)
    
    # Evaluación administrativa
    evaluado_por = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='incidentes_evaluados'
    )
    fecha_evaluacion = models.DateTimeField(null=True, blank=True)
    observaciones_evaluacion = models.TextField(blank=True)
    
    # Tarea generada
    tarea_generada = models.OneToOneField(
        TareaMantenimiento, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    
    fecha_reporte = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Incidente de Mantenimiento"
        verbose_name_plural = "Incidentes de Mantenimiento"
        ordering = ['-fecha_reporte']

    def __str__(self):
        return f"{self.titulo} - {self.get_urgencia_display()}"


class PlanMantenimiento(models.Model):
    """Planes de mantenimiento preventivo"""
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField()
    activo = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Plan de Mantenimiento"
        verbose_name_plural = "Planes de Mantenimiento"

    def __str__(self):
        return self.nombre


class TareaRecurrente(models.Model):
    """Tareas recurrentes de mantenimiento preventivo"""
    FRECUENCIA_CHOICES = [
        ('diaria', 'Diaria'),
        ('semanal', 'Semanal'),
        ('quincenal', 'Quincenal'),
        ('mensual', 'Mensual'),
        ('bimestral', 'Bimestral'),
        ('trimestral', 'Trimestral'),
        ('semestral', 'Semestral'),
        ('anual', 'Anual'),
    ]

    plan = models.ForeignKey(PlanMantenimiento, on_delete=models.CASCADE)
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField()
    categoria = models.ForeignKey(CategoriaMantenimiento, on_delete=models.CASCADE)
    ubicacion = models.CharField(max_length=200)
    frecuencia = models.CharField(max_length=20, choices=FRECUENCIA_CHOICES)
    tiempo_estimado = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    materiales = models.TextField(blank=True)
    instrucciones = models.TextField()
    activo = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Tarea Recurrente"
        verbose_name_plural = "Tareas Recurrentes"

    def __str__(self):
        return f"{self.titulo} - {self.get_frecuencia_display()}"


class EstadisticaMantenimiento(models.Model):
    """Estadísticas de mantenimiento"""
    fecha = models.DateField(unique=True)
    tareas_completadas = models.IntegerField(default=0)
    tareas_pendientes = models.IntegerField(default=0)
    incidentes_reportados = models.IntegerField(default=0)
    costo_total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tiempo_total_trabajado = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    tareas_emergencia = models.IntegerField(default=0)
    eficiencia_promedio = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    class Meta:
        verbose_name = "Estadística de Mantenimiento"
        verbose_name_plural = "Estadísticas de Mantenimiento"
        ordering = ['-fecha']

    def __str__(self):
        return f"Estadísticas {self.fecha}"
