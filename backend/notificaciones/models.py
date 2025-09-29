from django.db import models
from users.models import Rol


class Notificacion(models.Model):
    """
    Modelo para gestionar notificaciones del sistema de condominio
    """
    TIPO_CHOICES = [
        ('general', 'General'),
        ('mantenimiento', 'Mantenimiento'),
        ('reunion', 'Reunión'),
        ('aviso', 'Aviso'),
        ('emergencia', 'Emergencia'),
        ('pagos', 'Pagos'),
        ('evento', 'Evento'),
    ]
    
    ESTADO_CHOICES = [
        ('borrador', 'Borrador'),
        ('programada', 'Programada'),
        ('enviada', 'Enviada'),
        ('cancelada', 'Cancelada'),
        ('leida', 'Leída'),
    ]

    # Campos principales
    nombre = models.CharField(
        max_length=200,
        verbose_name="Nombre de la Notificación",
        help_text="Título o nombre de la notificación"
    )
    
    descripcion = models.TextField(
        verbose_name="Descripción",
        help_text="Contenido detallado de la notificación"
    )
    
    tipo = models.CharField(
        max_length=20,
        choices=TIPO_CHOICES,
        default='general',
        verbose_name="Tipo de Notificación"
    )
    
    estado = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES,
        default='borrador',
        verbose_name="Estado"
    )
    
    # Destinatarios
    roles_destinatarios = models.ManyToManyField(
        Rol,
        blank=True,
        verbose_name="Roles Destinatarios",
        help_text="Roles que recibirán esta notificación"
    )
    
    es_individual = models.BooleanField(
        default=False,
        verbose_name="¿Es notificación individual?",
        help_text="Si es True, se puede asignar a usuarios específicos"
    )
    
    # Fechas y programación
    fecha_programada = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Fecha Programada",
        help_text="Fecha y hora para enviar la notificación"
    )
    
    fecha_expiracion = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Fecha de Expiración",
        help_text="Fecha hasta cuando la notificación es válida"
    )
    
    # Configuraciones adicionales
    prioridad = models.CharField(
        max_length=10,
        choices=[
            ('baja', 'Baja'),
            ('normal', 'Normal'),
            ('alta', 'Alta'),
            ('urgente', 'Urgente'),
        ],
        default='normal',
        verbose_name="Prioridad"
    )
    
    requiere_confirmacion = models.BooleanField(
        default=False,
        verbose_name="Requiere Confirmación",
        help_text="Si requiere que el destinatario confirme la lectura"
    )
    
    activa = models.BooleanField(
        default=True,
        verbose_name="Activa"
    )
    
    # Campos de auditoría
    creado_por = models.ForeignKey(
        'users.CustomUser',
        on_delete=models.SET_NULL,
        null=True,
        related_name='notificaciones_creadas',
        verbose_name="Creado por"
    )
    
    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Fecha de Creación"
    )
    
    fecha_actualizacion = models.DateTimeField(
        auto_now=True,
        verbose_name="Fecha de Actualización"
    )

    class Meta:
        verbose_name = "Notificación"
        verbose_name_plural = "Notificaciones"
        ordering = ['-fecha_creacion']
        
    def __str__(self):
        return f"{self.nombre} ({self.get_tipo_display()})"
    
    @property
    def total_destinatarios(self):
        """Calcula el número total de destinatarios basado en los roles"""
        if self.roles_destinatarios.exists():
            return sum(rol.usuarios.filter(is_active=True).count() for rol in self.roles_destinatarios.all())
        return 0
    
    @property
    def estado_display(self):
        """Devuelve el estado con color para la UI"""
        colors = {
            'borrador': 'gray',
            'programada': 'blue',
            'enviada': 'green',
            'cancelada': 'red',
        }
        return {
            'estado': self.get_estado_display(),
            'color': colors.get(self.estado, 'gray')
        }