from django.core.validators import MinValueValidator
from django.db import models
from django.db.models.functions import Lower


class AreaComun(models.Model):
    ESTADO_ACTIVO = "ACTIVO"
    ESTADO_INACTIVO = "INACTIVO"
    ESTADO_MANTENIMIENTO = "MANTENIMIENTO"

    ESTADO_CHOICES = [
        (ESTADO_ACTIVO, "ACTIVO"),
        (ESTADO_INACTIVO, "INACTIVO"),
        (ESTADO_MANTENIMIENTO, "MANTENIMIENTO"),
    ]

    nombre = models.CharField(max_length=120, unique=True)
    monto_hora = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    estado = models.CharField(
        max_length=14,
        choices=ESTADO_CHOICES,
        default=ESTADO_ACTIVO,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["nombre"]
        indexes = [
            models.Index(fields=["estado"], name="areas_comunes_estado_idx"),
            models.Index(Lower("nombre"), name="areas_comunes_nombre_ci_idx"),
        ]
        verbose_name = "Área Común"
        verbose_name_plural = "Áreas Comunes"

    def __str__(self) -> str:
        return self.nombre
