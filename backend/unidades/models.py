from django.db import models
from django.core.validators import MinValueValidator
from django.core.validators import RegexValidator


class UnidadHabitacionalManager(models.Manager):
    """Manager personalizado para UnidadHabitacional"""
    
    def get_by_codigo(self, codigo):
        """
        Obtiene una unidad por su código.
        Retorna None si no existe.
        """
        try:
            return self.get(codigo=codigo)
        except self.model.DoesNotExist:
            return None


class UnidadHabitacional(models.Model):
    """Modelo para unidades habitacionales del condominio - Refactorizado"""
    
    # Manager personalizado
    objects = UnidadHabitacionalManager()
    
    ESTADO_CHOICES = [
        ('OCUPADA', 'Ocupada'),
        ('DESOCUPADA', 'Desocupada'),
        ('MANTENIMIENTO', 'En Mantenimiento'),
    ]
    
    # Código único de la unidad (ej: A-101, B-202)
    codigo = models.CharField(
        max_length=10,
        unique=True,
        validators=[
            RegexValidator(
                regex=r"^[A-Z]-\d{3}$",
                message="El código debe tener el formato A-101, B-202, etc."
            )
        ],
        verbose_name="Código de Unidad"
    )
    
    estado = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES,
        default='DESOCUPADA',
        verbose_name="Estado"
    )
    
    direccion = models.CharField(
        max_length=100,
        verbose_name="Dirección"
    )
    
    cantidad_vehiculos = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name="Cantidad de Vehículos"
    )
    
    # Campos de control
    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Fecha de Creación"
    )
    
    fecha_actualizacion = models.DateTimeField(
        auto_now=True,
        verbose_name="Fecha de Actualización"
    )
    
    class Meta:
        verbose_name = "Unidad Habitacional"
        verbose_name_plural = "Unidades Habitacionales"
        ordering = ['direccion']
        indexes = [
            models.Index(fields=['estado']),
            models.Index(fields=['direccion']),
        ]
    
    def __str__(self):
        return f"{self.direccion} - {self.get_estado_display()}"
    
    @property
    def residentes(self):
        """Retorna los residentes asociados a esta unidad"""
        from residentes.models import Residente
        return Residente.objects.filter(unidad_habitacional=self.codigo)
    
    @property
    def tiene_cupo_disponible(self):
        """Verifica si la unidad tiene cupo para más residentes (máx. 2)"""
        from residentes.models import Residente
        return Residente.objects.filter(unidad_habitacional=self.codigo).count() < 2
    
    def asignar_residentes(self, residente_ids):
        """
        Asigna los residentes a esta unidad y libera cualquier residente
        que ya no esté en la lista
        """
        from residentes.models import Residente
        
        # Obtener residentes actuales con este código de unidad
        residentes_actuales = list(Residente.objects.filter(unidad_habitacional=self.codigo))
        
        # Liberar los residentes que ya no están en la lista
        for residente in residentes_actuales:
            if residente.id not in residente_ids:
                residente.unidad_habitacional = None
                residente.save(update_fields=['unidad_habitacional'])
        
        # Asignar los nuevos residentes
        if residente_ids:
            nuevos_residentes = Residente.objects.filter(id__in=residente_ids)
            for residente in nuevos_residentes:
                residente.unidad_habitacional = self.codigo
                residente.save(update_fields=['unidad_habitacional'])
        
        return True
    
    @classmethod
    def find_by_code(cls, codigo):
        """
        Método de clase para encontrar una unidad por su código.
        Retorna None si no existe.
        
        Uso: unidad = UnidadHabitacional.find_by_code("A-101")
        """
        return cls.objects.get_by_codigo(codigo)