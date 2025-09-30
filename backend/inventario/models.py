from django.db import models
from areas_comunes.models import AreaComun


class Inventario(models.Model):
    ESTADO_CHOICES = [
        ('ACTIVO', 'Activo'),
        ('INACTIVO', 'Inactivo'),
        ('EN_REPARACION', 'En reparación'),
        ('DADO_DE_BAJA', 'Dado de baja'),
    ]
    
    CATEGORIA_CHOICES = [
        ('MOBILIARIO', 'Mobiliario'),
        ('ELECTRODOMESTICO', 'Electrodoméstico'),
        ('EQUIPO_TECNOLOGICO', 'Equipo Tecnológico'),
        ('HERRAMIENTA', 'Herramienta'),
        ('DECORACION', 'Decoración'),
        ('OTRO', 'Otro'),
    ]
    
    nombre = models.CharField(max_length=100, verbose_name="Nombre")
    categoria = models.CharField(max_length=50, choices=CATEGORIA_CHOICES, verbose_name="Categoría")
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='ACTIVO', verbose_name="Estado")
    area_comun = models.ForeignKey(
        AreaComun,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="inventarios",
        verbose_name="Área Común"
    )
    valor_estimado = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Valor Estimado (Bs)")
    ubicacion = models.CharField(max_length=200, verbose_name="Ubicación")
    fecha_adquisicion = models.DateField(verbose_name="Fecha de Adquisición")
    descripcion = models.TextField(blank=True, null=True, verbose_name="Descripción")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Última Actualización")

    class Meta:
        verbose_name = "Inventario"
        verbose_name_plural = "Inventarios"
        ordering = ['-created_at']

    def __str__(self):
        return self.nombre