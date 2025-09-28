from django.db import models
from django.contrib.auth import get_user_model
from residentes.models import Residente
from decimal import Decimal

User = get_user_model()


class TipoCuota(models.Model):
    """Tipos de cuotas del condominio"""
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    monto_base = models.DecimalField(max_digits=10, decimal_places=2)
    es_fija = models.BooleanField(default=True, help_text="Si es fija, el monto no cambia")
    activo = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Tipo de Cuota"
        verbose_name_plural = "Tipos de Cuotas"

    def __str__(self):
        return self.nombre


class Cuota(models.Model):
    """Cuotas mensuales de residentes"""
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('pagada', 'Pagada'),
        ('vencida', 'Vencida'),
        ('parcial', 'Pago Parcial'),
    ]

    residente = models.ForeignKey(Residente, on_delete=models.CASCADE)
    tipo_cuota = models.ForeignKey(TipoCuota, on_delete=models.CASCADE)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    fecha_vencimiento = models.DateField()
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='pendiente')
    mes_periodo = models.DateField(help_text="Mes al que corresponde la cuota")
    descuento = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    multa = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Cuota"
        verbose_name_plural = "Cuotas"
        unique_together = ['residente', 'tipo_cuota', 'mes_periodo']

    def __str__(self):
        return f"{self.residente.nombre} - {self.tipo_cuota.nombre} - {self.mes_periodo.strftime('%m/%Y')}"
    
    @property
    def monto_total(self):
        return self.monto - self.descuento + self.multa


class Pago(models.Model):
    """Registros de pagos de cuotas"""
    METODO_PAGO_CHOICES = [
        ('efectivo', 'Efectivo'),
        ('transferencia', 'Transferencia Bancaria'),
        ('tarjeta', 'Tarjeta de Crédito/Débito'),
        ('cheque', 'Cheque'),
        ('online', 'Pago en Línea'),
    ]

    cuota = models.ForeignKey(Cuota, on_delete=models.CASCADE)
    monto_pagado = models.DecimalField(max_digits=10, decimal_places=2)
    metodo_pago = models.CharField(max_length=20, choices=METODO_PAGO_CHOICES)
    fecha_pago = models.DateTimeField(auto_now_add=True)
    referencia = models.CharField(max_length=100, blank=True, help_text="Número de transacción, cheque, etc.")
    comprobante = models.FileField(upload_to='comprobantes/', blank=True)
    procesado_por = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    observaciones = models.TextField(blank=True)

    class Meta:
        verbose_name = "Pago"
        verbose_name_plural = "Pagos"

    def __str__(self):
        return f"Pago {self.cuota} - ${self.monto_pagado}"


class RecordatorioPago(models.Model):
    """Recordatorios automáticos de pago"""
    TIPO_RECORDATORIO_CHOICES = [
        ('email', 'Email'),
        ('sms', 'SMS'),
        ('push', 'Notificación Push'),
        ('whatsapp', 'WhatsApp'),
    ]

    cuota = models.ForeignKey(Cuota, on_delete=models.CASCADE)
    tipo_recordatorio = models.CharField(max_length=20, choices=TIPO_RECORDATORIO_CHOICES)
    fecha_envio = models.DateTimeField(auto_now_add=True)
    enviado = models.BooleanField(default=False)
    fecha_programada = models.DateTimeField()
    mensaje_personalizado = models.TextField(blank=True)

    class Meta:
        verbose_name = "Recordatorio de Pago"
        verbose_name_plural = "Recordatorios de Pago"

    def __str__(self):
        return f"Recordatorio {self.cuota} - {self.tipo_recordatorio}"


class ConfiguracionFinanzas(models.Model):
    """Configuración del módulo financiero"""
    # Multas
    aplica_multas_automaticas = models.BooleanField(default=True)
    dias_gracia = models.IntegerField(default=5, help_text="Días de gracia antes de aplicar multa")
    porcentaje_multa = models.DecimalField(max_digits=5, decimal_places=2, default=5.00)
    monto_multa_fija = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Recordatorios
    enviar_recordatorios = models.BooleanField(default=True)
    dias_antes_vencimiento = models.IntegerField(default=7)
    dias_despues_vencimiento = models.IntegerField(default=3)
    
    # Descuentos
    descuento_pago_anticipado = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    dias_pago_anticipado = models.IntegerField(default=10)
    
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Configuración de Finanzas"
        verbose_name_plural = "Configuraciones de Finanzas"

    def __str__(self):
        return f"Configuración Finanzas - {self.fecha_actualizacion}"


class ReporteFinanciero(models.Model):
    """Reportes financieros generados"""
    TIPO_REPORTE_CHOICES = [
        ('mensual', 'Reporte Mensual'),
        ('anual', 'Reporte Anual'),
        ('morosidad', 'Reporte de Morosidad'),
        ('ingresos', 'Reporte de Ingresos'),
        ('custom', 'Reporte Personalizado'),
    ]

    nombre = models.CharField(max_length=200)
    tipo_reporte = models.CharField(max_length=20, choices=TIPO_REPORTE_CHOICES)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    archivo_reporte = models.FileField(upload_to='reportes_financieros/')
    generado_por = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    fecha_generacion = models.DateTimeField(auto_now_add=True)
    parametros = models.JSONField(blank=True, null=True)

    class Meta:
        verbose_name = "Reporte Financiero"
        verbose_name_plural = "Reportes Financieros"

    def __str__(self):
        return f"{self.nombre} - {self.fecha_generacion.strftime('%d/%m/%Y')}"


class EstadisticaFinanciera(models.Model):
    """Estadísticas financieras diarias/mensuales"""
    fecha = models.DateField(unique=True)
    total_ingresos = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_cuotas_pendientes = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_multas = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    residentes_morosos = models.IntegerField(default=0)
    porcentaje_cobro = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    cuotas_pagadas = models.IntegerField(default=0)
    cuotas_pendientes = models.IntegerField(default=0)

    class Meta:
        verbose_name = "Estadística Financiera"
        verbose_name_plural = "Estadísticas Financieras"
        ordering = ['-fecha']

    def __str__(self):
        return f"Estadísticas {self.fecha}"
