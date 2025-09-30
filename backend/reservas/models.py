from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone
from datetime import datetime, time
from areas_comunes.models import AreaComun
from residentes.models import Residente


class Reserva(models.Model):
    """Modelo para reservas de áreas comunes"""
    
    # Estados de la reserva
    ESTADO_PENDIENTE = "PENDIENTE"
    ESTADO_CONFIRMADA = "CONFIRMADA"
    ESTADO_CANCELADA = "CANCELADA"
    ESTADO_COMPLETADA = "COMPLETADA"
    ESTADO_RECHAZADA = "RECHAZADA"
    
    ESTADO_CHOICES = [
        (ESTADO_PENDIENTE, "Pendiente"),
        (ESTADO_CONFIRMADA, "Confirmada"),
        (ESTADO_CANCELADA, "Cancelada"),
        (ESTADO_COMPLETADA, "Completada"),
        (ESTADO_RECHAZADA, "Rechazada"),
    ]
    
    # Tipos de reserva
    TIPO_PARTICULAR = "PARTICULAR"
    TIPO_EVENTO = "EVENTO"
    TIPO_REUNION = "REUNION"
    TIPO_DEPORTE = "DEPORTE"
    TIPO_OTRO = "OTRO"
    
    TIPO_CHOICES = [
        (TIPO_PARTICULAR, "Uso Particular"),
        (TIPO_EVENTO, "Evento"),
        (TIPO_REUNION, "Reunión"),
        (TIPO_DEPORTE, "Deporte"),
        (TIPO_OTRO, "Otro"),
    ]
    
    # Campos principales
    area_comun = models.ForeignKey(
        AreaComun,
        on_delete=models.CASCADE,
        related_name='reservas',
        verbose_name="Área Común"
    )
    
    residente = models.ForeignKey(
        Residente,
        on_delete=models.CASCADE,
        related_name='reservas',
        verbose_name="Residente"
    )
    
    # Fecha y hora de la reserva
    fecha_reserva = models.DateField(verbose_name="Fecha de Reserva")
    hora_inicio = models.TimeField(verbose_name="Hora de Inicio")
    hora_fin = models.TimeField(verbose_name="Hora de Fin")
    
    # Detalles de la reserva
    tipo_reserva = models.CharField(
        max_length=20,
        choices=TIPO_CHOICES,
        default=TIPO_PARTICULAR,
        verbose_name="Tipo de Reserva"
    )
    
    motivo = models.TextField(
        max_length=500,
        blank=True,
        null=True,
        verbose_name="Motivo de la Reserva"
    )
    
    numero_personas = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        verbose_name="Número de Personas"
    )
    
    # Estado y control
    estado = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES,
        default=ESTADO_PENDIENTE,
        verbose_name="Estado"
    )
    
    # Costo calculado
    costo_total = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0)],
        verbose_name="Costo Total"
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
    
    # Campos de administración
    observaciones_admin = models.TextField(
        max_length=1000,
        blank=True,
        null=True,
        verbose_name="Observaciones del Administrador"
    )
    
    administrador_aprobacion = models.ForeignKey(
        'users.CustomUser',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reservas_aprobadas',
        verbose_name="Administrador que Aprobó"
    )
    
    fecha_aprobacion = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Fecha de Aprobación"
    )
    
    class Meta:
        verbose_name = "Reserva"
        verbose_name_plural = "Reservas"
        ordering = ['-fecha_creacion']
        indexes = [
            models.Index(fields=['fecha_reserva', 'hora_inicio']),
            models.Index(fields=['estado']),
            models.Index(fields=['area_comun', 'fecha_reserva']),
            models.Index(fields=['residente']),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(hora_fin__gt=models.F('hora_inicio')),
                name='reserva_hora_fin_mayor_inicio'
            ),
            models.CheckConstraint(
                check=models.Q(fecha_reserva__gte=timezone.now().date()),
                name='reserva_fecha_futura'
            ),
        ]
    
    def __str__(self):
        return f"{self.residente.nombre_completo} - {self.area_comun.nombre} ({self.fecha_reserva})"
    
    def save(self, *args, **kwargs):
        """Calcula el costo total antes de guardar"""
        if self.area_comun and self.hora_inicio and self.hora_fin:
            self.calcular_costo()
        super().save(*args, **kwargs)
    
    def calcular_costo(self):
        """Calcula el costo total de la reserva basado en las horas"""
        if not self.area_comun or not self.hora_inicio or not self.hora_fin:
            return
        
        # Convertir horas a datetime para calcular diferencia
        inicio_datetime = datetime.combine(self.fecha_reserva, self.hora_inicio)
        fin_datetime = datetime.combine(self.fecha_reserva, self.hora_fin)
        
        # Calcular diferencia en horas
        diferencia = fin_datetime - inicio_datetime
        horas = diferencia.total_seconds() / 3600
        
        # Calcular costo (convertir float a Decimal)
        from decimal import Decimal
        self.costo_total = self.area_comun.monto_hora * Decimal(str(horas))
    
    def duracion_horas(self):
        """Retorna la duración de la reserva en horas"""
        if not self.hora_inicio or not self.hora_fin:
            return 0
        
        inicio_datetime = datetime.combine(self.fecha_reserva, self.hora_inicio)
        fin_datetime = datetime.combine(self.fecha_reserva, self.hora_fin)
        diferencia = fin_datetime - inicio_datetime
        return diferencia.total_seconds() / 3600
    
    def puede_cancelar(self):
        """Verifica si la reserva puede ser cancelada"""
        return self.estado in [self.ESTADO_PENDIENTE, self.ESTADO_CONFIRMADA]
    
    def puede_modificar(self):
        """Verifica si la reserva puede ser modificada"""
        return self.estado in [self.ESTADO_PENDIENTE, self.ESTADO_CONFIRMADA]
    
    def esta_activa(self):
        """Verifica si la reserva está activa (confirmada y en fecha futura)"""
        return (
            self.estado == self.ESTADO_CONFIRMADA and 
            self.fecha_reserva >= timezone.now().date()
        )
    
    def aprobar(self, administrador):
        """Aprueba la reserva"""
        self.estado = self.ESTADO_CONFIRMADA
        self.administrador_aprobacion = administrador
        self.fecha_aprobacion = timezone.now()
        self.save()
    
    def rechazar(self, administrador, motivo=""):
        """Rechaza la reserva"""
        self.estado = self.ESTADO_RECHAZADA
        self.administrador_aprobacion = administrador
        self.fecha_aprobacion = timezone.now()
        if motivo:
            self.observaciones_admin = motivo
        self.save()
    
    def cancelar(self, motivo=""):
        """Cancela la reserva"""
        self.estado = self.ESTADO_CANCELADA
        if motivo:
            self.observaciones_admin = motivo
        self.save()
    
    def completar(self):
        """Marca la reserva como completada"""
        self.estado = self.ESTADO_COMPLETADA
        self.save()