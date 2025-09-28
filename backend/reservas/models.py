from django.db import models
from django.contrib.auth import get_user_model
from residentes.models import Residente
from decimal import Decimal

User = get_user_model()


class AreaComun(models.Model):
    """Áreas comunes disponibles para reserva"""
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    capacidad_maxima = models.IntegerField()
    precio_por_hora = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    imagen = models.ImageField(upload_to='areas_comunes/', blank=True)
    activo = models.BooleanField(default=True)
    requiere_pago = models.BooleanField(default=False)
    requiere_autorizacion = models.BooleanField(default=False)
    
    # Horarios de operación
    hora_apertura = models.TimeField(default="08:00")
    hora_cierre = models.TimeField(default="22:00")
    
    # Días disponibles (JSON con días de la semana)
    dias_disponibles = models.JSONField(
        default=list, 
        help_text="Lista de días disponibles: 0=Lunes, 6=Domingo"
    )
    
    # Reglas y restricciones
    tiempo_minimo_reserva = models.IntegerField(default=1, help_text="Horas mínimas de reserva")
    tiempo_maximo_reserva = models.IntegerField(default=4, help_text="Horas máximas de reserva")
    anticipacion_minima = models.IntegerField(default=24, help_text="Horas de anticipación mínima")
    anticipacion_maxima = models.IntegerField(default=720, help_text="Horas de anticipación máxima (30 días)")
    
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Área Común"
        verbose_name_plural = "Áreas Comunes"

    def __str__(self):
        return self.nombre


class Reserva(models.Model):
    """Reservas de áreas comunes"""
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente de Aprobación'),
        ('confirmada', 'Confirmada'),
        ('cancelada', 'Cancelada'),
        ('completada', 'Completada'),
        ('no_show', 'No se presentó'),
    ]

    area_comun = models.ForeignKey(AreaComun, on_delete=models.CASCADE)
    residente = models.ForeignKey(Residente, on_delete=models.CASCADE)
    fecha_reserva = models.DateField()
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='pendiente')
    
    # Detalles de la reserva
    numero_personas = models.IntegerField()
    motivo = models.CharField(max_length=200)
    observaciones = models.TextField(blank=True)
    
    # Información financiera
    costo_total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    pagado = models.BooleanField(default=False)
    
    # Gestión administrativa
    aprobado_por = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    fecha_aprobacion = models.DateTimeField(null=True, blank=True)
    motivo_cancelacion = models.TextField(blank=True)
    
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Reserva"
        verbose_name_plural = "Reservas"
        unique_together = ['area_comun', 'fecha_reserva', 'hora_inicio']

    def __str__(self):
        return f"{self.area_comun.nombre} - {self.residente.nombre} - {self.fecha_reserva}"
    
    def calcular_duracion_horas(self):
        """Calcular duración en horas"""
        from datetime import datetime, timedelta
        inicio = datetime.combine(self.fecha_reserva, self.hora_inicio)
        fin = datetime.combine(self.fecha_reserva, self.hora_fin)
        if fin < inicio:
            fin += timedelta(days=1)
        return (fin - inicio).seconds / 3600


class PagoReserva(models.Model):
    """Pagos de reservas"""
    METODO_PAGO_CHOICES = [
        ('efectivo', 'Efectivo'),
        ('transferencia', 'Transferencia'),
        ('tarjeta', 'Tarjeta'),
        ('descuento_cuota', 'Descuento de Cuota'),
    ]

    reserva = models.ForeignKey(Reserva, on_delete=models.CASCADE)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    metodo_pago = models.CharField(max_length=20, choices=METODO_PAGO_CHOICES)
    referencia = models.CharField(max_length=100, blank=True)
    comprobante = models.FileField(upload_to='comprobantes_reservas/', blank=True)
    fecha_pago = models.DateTimeField(auto_now_add=True)
    procesado_por = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    class Meta:
        verbose_name = "Pago de Reserva"
        verbose_name_plural = "Pagos de Reservas"

    def __str__(self):
        return f"Pago {self.reserva} - ${self.monto}"


class DisponibilidadEspecial(models.Model):
    """Disponibilidad especial de áreas (bloqueos, eventos especiales)"""
    TIPO_CHOICES = [
        ('bloqueo', 'Bloqueo/Mantenimiento'),
        ('evento', 'Evento Especial'),
        ('reservado', 'Reservado por Administración'),
    ]

    area_comun = models.ForeignKey(AreaComun, on_delete=models.CASCADE)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    fecha_inicio = models.DateTimeField()
    fecha_fin = models.DateTimeField()
    motivo = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    creado_por = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Disponibilidad Especial"
        verbose_name_plural = "Disponibilidades Especiales"

    def __str__(self):
        return f"{self.area_comun.nombre} - {self.tipo} - {self.fecha_inicio.strftime('%d/%m/%Y')}"


class ReglamentoReservas(models.Model):
    """Reglamento y políticas de reservas"""
    titulo = models.CharField(max_length=200)
    contenido = models.TextField()
    area_comun = models.ForeignKey(
        AreaComun, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        help_text="Si no se especifica, aplica para todas las áreas"
    )
    activo = models.BooleanField(default=True)
    orden = models.IntegerField(default=0)
    fecha_vigencia = models.DateField()
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Reglamento de Reservas"
        verbose_name_plural = "Reglamentos de Reservas"
        ordering = ['orden', 'titulo']

    def __str__(self):
        return self.titulo


class EstadisticaReservas(models.Model):
    """Estadísticas de uso de áreas comunes"""
    fecha = models.DateField()
    area_comun = models.ForeignKey(AreaComun, on_delete=models.CASCADE)
    total_reservas = models.IntegerField(default=0)
    reservas_confirmadas = models.IntegerField(default=0)
    reservas_canceladas = models.IntegerField(default=0)
    no_shows = models.IntegerField(default=0)
    ingresos_generados = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    horas_ocupadas = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    tasa_ocupacion = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    class Meta:
        verbose_name = "Estadística de Reservas"
        verbose_name_plural = "Estadísticas de Reservas"
        unique_together = ['fecha', 'area_comun']

    def __str__(self):
        return f"{self.area_comun.nombre} - {self.fecha}"


class NotificacionReserva(models.Model):
    """Notificaciones relacionadas con reservas"""
    TIPO_CHOICES = [
        ('confirmacion', 'Confirmación de Reserva'),
        ('recordatorio', 'Recordatorio'),
        ('cancelacion', 'Cancelación'),
        ('cambio', 'Cambio de Estado'),
    ]

    reserva = models.ForeignKey(Reserva, on_delete=models.CASCADE)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    mensaje = models.TextField()
    enviado = models.BooleanField(default=False)
    fecha_programada = models.DateTimeField()
    fecha_envio = models.DateTimeField(null=True, blank=True)
    canal = models.CharField(max_length=20, default='email')  # email, sms, push

    class Meta:
        verbose_name = "Notificación de Reserva"
        verbose_name_plural = "Notificaciones de Reservas"

    def __str__(self):
        return f"{self.tipo} - {self.reserva}"
