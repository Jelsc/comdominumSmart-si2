from rest_framework import serializers
from .models import Notificacion
from users.models import Rol, CustomUser


class NotificacionSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Notificacion
    """
    roles_destinatarios_info = serializers.SerializerMethodField()
    total_destinatarios = serializers.ReadOnlyField()
    estado_display = serializers.ReadOnlyField()
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    prioridad_display = serializers.CharField(source='get_prioridad_display', read_only=True)
    creado_por_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Notificacion
        fields = [
            'id',
            'nombre',
            'descripcion',
            'tipo',
            'tipo_display',
            'estado',
            'estado_display',
            'roles_destinatarios',
            'roles_destinatarios_info',
            'es_individual',
            'fecha_programada',
            'fecha_expiracion',
            'prioridad',
            'prioridad_display',
            'requiere_confirmacion',
            'activa',
            'creado_por',
            'creado_por_info',
            'fecha_creacion',
            'fecha_actualizacion',
            'total_destinatarios',
        ]
        read_only_fields = [
            'fecha_creacion',
            'fecha_actualizacion',
            'total_destinatarios',
        ]
    
    def get_roles_destinatarios_info(self, obj):
        """Devuelve información detallada de los roles destinatarios"""
        return [
            {
                'id': rol.id,
                'nombre': rol.nombre,
                'descripcion': rol.descripcion,
                'total_usuarios': rol.customuser_set.filter(is_active=True).count()
            }
            for rol in obj.roles_destinatarios.all()
        ]
    
    def get_creado_por_info(self, obj):
        """Devuelve información del usuario que creó la notificación"""
        if obj.creado_por:
            return {
                'id': obj.creado_por.id,
                'username': obj.creado_por.username,
                'email': obj.creado_por.email,
                'nombre_completo': f"{obj.creado_por.first_name} {obj.creado_por.last_name}".strip()
            }
        return None


class NotificacionCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer para crear y actualizar notificaciones
    """
    class Meta:
        model = Notificacion
        fields = [
            'nombre',
            'descripcion',
            'tipo',
            'estado',
            'roles_destinatarios',
            'es_individual',
            'fecha_programada',
            'fecha_expiracion',
            'prioridad',
            'requiere_confirmacion',
            'activa',
        ]
    
    def validate(self, data):
        """Validaciones personalizadas"""
        # Si es individual, debe tener al menos un rol destinatario
        if data.get('es_individual', False):
            if not data.get('roles_destinatarios'):
                raise serializers.ValidationError(
                    "Las notificaciones individuales deben tener al menos un rol destinatario."
                )
        
        # Validar fechas
        fecha_programada = data.get('fecha_programada')
        fecha_expiracion = data.get('fecha_expiracion')
        
        if fecha_programada and fecha_expiracion:
            if fecha_programada >= fecha_expiracion:
                raise serializers.ValidationError(
                    "La fecha programada debe ser anterior a la fecha de expiración."
                )
        
        return data


class RolSerializer(serializers.ModelSerializer):
    """
    Serializer simple para los roles (para usar en selects)
    """
    total_usuarios = serializers.SerializerMethodField()
    
    class Meta:
        model = Rol
        fields = ['id', 'nombre', 'descripcion', 'total_usuarios']
    
    def get_total_usuarios(self, obj):
        return obj.customuser_set.filter(is_active=True).count()