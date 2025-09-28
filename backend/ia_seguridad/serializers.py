from rest_framework import serializers
from .models import (
    Camara, FotoResidente, Vehiculo, Visitante, RegistroAcceso, 
    AlertaSeguridad, ConfiguracionIA, EstadisticaSeguridad
)
from residentes.serializers import ResidenteSerializer


class CamaraSerializer(serializers.ModelSerializer):
    class Meta:
        model = Camara
        fields = [
            'id', 'nombre', 'ubicacion', 'tipo', 'estado', 'ip', 'puerto',
            'usuario', 'url_rtsp', 'configuracion', 'fecha_instalacion', 
            'ultima_verificacion', 'activa'
        ]
        extra_kwargs = {
            'password': {'write_only': True}
        }


class FotoResidenteSerializer(serializers.ModelSerializer):
    residente_nombre = serializers.CharField(source='residente.nombre', read_only=True)
    residente_apellido = serializers.CharField(source='residente.apellido', read_only=True)
    
    class Meta:
        model = FotoResidente
        fields = [
            'id', 'residente', 'residente_nombre', 'residente_apellido',
            'imagen', 'es_principal', 'fecha_creacion', 'activo'
        ]
        read_only_fields = ['encoding_facial']


class VehiculoSerializer(serializers.ModelSerializer):
    residente_nombre = serializers.CharField(source='residente.nombre', read_only=True)
    
    class Meta:
        model = Vehiculo
        fields = [
            'id', 'residente', 'residente_nombre', 'placa', 'marca', 
            'modelo', 'color', 'tipo', 'activo', 'fecha_registro'
        ]


class VisitanteSerializer(serializers.ModelSerializer):
    residente_visitado_nombre = serializers.CharField(
        source='residente_visitado.nombre', read_only=True
    )
    tiempo_visita = serializers.SerializerMethodField()
    
    class Meta:
        model = Visitante
        fields = [
            'id', 'nombre', 'ci', 'foto_entrada', 'residente_visitado',
            'residente_visitado_nombre', 'fecha_entrada', 'fecha_salida',
            'autorizado_por', 'observaciones', 'tiempo_visita'
        ]
        read_only_fields = ['encoding_facial']
    
    def get_tiempo_visita(self, obj):
        if obj.fecha_salida:
            delta = obj.fecha_salida - obj.fecha_entrada
            return str(delta)
        return None


class RegistroAccesoSerializer(serializers.ModelSerializer):
    residente_nombre = serializers.CharField(source='residente.nombre', read_only=True)
    visitante_nombre = serializers.CharField(source='visitante.nombre', read_only=True)
    
    class Meta:
        model = RegistroAcceso
        fields = [
            'id', 'tipo_acceso', 'tipo_persona', 'residente', 'residente_nombre',
            'visitante', 'visitante_nombre', 'foto_acceso', 'confianza_reconocimiento',
            'placa_vehiculo', 'fecha_hora', 'camara_id'
        ]


class AlertaSeguridadSerializer(serializers.ModelSerializer):
    resuelto_por_nombre = serializers.CharField(source='resuelto_por.username', read_only=True)
    tiempo_resolucion = serializers.SerializerMethodField()
    
    class Meta:
        model = AlertaSeguridad
        fields = [
            'id', 'tipo_alerta', 'nivel', 'descripcion', 'foto_evidencia',
            'camara_id', 'fecha_hora', 'resuelto', 'resuelto_por',
            'resuelto_por_nombre', 'fecha_resolucion', 'tiempo_resolucion'
        ]
    
    def get_tiempo_resolucion(self, obj):
        if obj.fecha_resolucion:
            delta = obj.fecha_resolucion - obj.fecha_hora
            return str(delta)
        return None


class ConfiguracionIASerializer(serializers.ModelSerializer):
    class Meta:
        model = ConfiguracionIA
        fields = [
            'id', 'umbral_confianza_facial', 'umbral_confianza_ocr',
            'activo_deteccion_anomalias', 'sensibilidad_anomalias',
            'horario_inicio', 'horario_fin', 'enviar_notificaciones_push',
            'email_alertas', 'fecha_actualizacion'
        ]


class EstadisticaSeguridadSerializer(serializers.ModelSerializer):
    porcentaje_exito = serializers.SerializerMethodField()
    
    class Meta:
        model = EstadisticaSeguridad
        fields = [
            'id', 'fecha', 'total_accesos', 'accesos_residentes',
            'accesos_visitantes', 'accesos_denegados', 'alertas_generadas',
            'vehiculos_detectados', 'porcentaje_exito'
        ]
    
    def get_porcentaje_exito(self, obj):
        if obj.total_accesos > 0:
            exitos = obj.total_accesos - obj.accesos_denegados
            return round((exitos / obj.total_accesos) * 100, 2)
        return 0


# Serializers específicos para APIs de IA
class AnalisisImagenSerializer(serializers.Serializer):
    """Serializer para solicitar análisis de imagen con IA"""
    imagen = serializers.ImageField()
    tipo_analisis = serializers.ChoiceField(
        choices=['facial', 'placa', 'anomalias', 'completo'],
        default='completo'
    )
    camara_id = serializers.CharField(max_length=50, required=False, default='cam_01')


class ResultadoAnalisisSerializer(serializers.Serializer):
    """Serializer para respuesta de análisis de imagen"""
    facial = serializers.DictField(required=False)
    placa = serializers.DictField(required=False)
    anomalias = serializers.DictField(required=False)
    timestamp = serializers.DateTimeField(required=False)


class ComparacionFacialSerializer(serializers.Serializer):
    """Serializer para comparación facial"""
    residente_id = serializers.IntegerField()
    imagen_nueva = serializers.ImageField()
    tolerancia = serializers.FloatField(default=0.6, min_value=0.0, max_value=1.0)


class RegistroAccesoAutomaticoSerializer(serializers.Serializer):
    """Serializer para registro automático de acceso"""
    imagen = serializers.ImageField()
    tipo_acceso = serializers.ChoiceField(choices=['entrada', 'salida'])
    camara_id = serializers.CharField(max_length=50, default='cam_01')
    forzar_registro = serializers.BooleanField(default=False)