from rest_framework import serializers
from .models import (
    PersonaAutorizada,
    VehiculoAutorizado,
    RegistroAcceso,
    RegistroVehiculo,
    ConfiguracionSeguridad,
    AlertaSeguridad,
)


class PersonaAutorizadaSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonaAutorizada
        fields = [
            "id",
            "nombre",
            "ci",
            "telefono",
            "email",
            "tipo_acceso",
            "activo",
            "fecha_registro",
            "fecha_actualizacion",
        ]
        read_only_fields = ["fecha_registro", "fecha_actualizacion"]


class PersonaAutorizadaCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonaAutorizada
        fields = ["nombre", "ci", "telefono", "email", "tipo_acceso", "activo"]


class VehiculoAutorizadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehiculoAutorizado
        fields = [
            "id",
            "placa",
            "propietario",
            "tipo_vehiculo",
            "marca",
            "modelo",
            "color",
            "activo",
            "fecha_registro",
            "fecha_actualizacion",
        ]
        read_only_fields = ["fecha_registro", "fecha_actualizacion"]


class VehiculoAutorizadoCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehiculoAutorizado
        fields = [
            "placa",
            "propietario",
            "tipo_vehiculo",
            "marca",
            "modelo",
            "color",
            "activo",
        ]


class RegistroAccesoSerializer(serializers.ModelSerializer):
    persona_nombre = serializers.CharField(source="persona.nombre", read_only=True)
    persona_ci = serializers.CharField(source="persona.ci", read_only=True)

    class Meta:
        model = RegistroAcceso
        fields = [
            "id",
            "persona",
            "persona_nombre",
            "persona_ci",
            "tipo_acceso",
            "resultado",
            "confianza",
            "foto_capturada",
            "fecha_hora",
            "observaciones",
            "coordenadas_rostro",
            "calidad_imagen",
        ]
        read_only_fields = ["fecha_hora"]


class RegistroVehiculoSerializer(serializers.ModelSerializer):
    vehiculo_propietario = serializers.CharField(
        source="vehiculo.propietario", read_only=True
    )

    class Meta:
        model = RegistroVehiculo
        fields = [
            "id",
            "placa",
            "vehiculo",
            "vehiculo_propietario",
            "tipo_vehiculo",
            "resultado",
            "confianza",
            "foto_capturada",
            "fecha_hora",
            "observaciones",
            "coordenadas_placa",
            "texto_detectado",
        ]
        read_only_fields = ["fecha_hora"]


class ConfiguracionSeguridadSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConfiguracionSeguridad
        fields = [
            "id",
            "nombre",
            "descripcion",
            "configuracion",
            "activo",
            "fecha_actualizacion",
        ]
        read_only_fields = ["fecha_actualizacion"]


class AlertaSeguridadSerializer(serializers.ModelSerializer):
    resuelta_por_nombre = serializers.CharField(
        source="resuelta_por.get_full_name", read_only=True
    )

    class Meta:
        model = AlertaSeguridad
        fields = [
            "id",
            "tipo",
            "severidad",
            "titulo",
            "descripcion",
            "fecha_hora",
            "resuelta",
            "fecha_resolucion",
            "resuelta_por",
            "resuelta_por_nombre",
            "registro_acceso",
            "registro_vehiculo",
        ]
        read_only_fields = ["fecha_hora", "fecha_resolucion"]


class ReconocimientoFacialSerializer(serializers.Serializer):
    """Serializer para procesar reconocimiento facial"""

    imagen = serializers.ImageField()
    tipo_acceso = serializers.ChoiceField(choices=RegistroAcceso.TIPOS_ACCESO)
    observaciones = serializers.CharField(required=False, allow_blank=True)


class ReconocimientoPlacaSerializer(serializers.Serializer):
    """Serializer para procesar reconocimiento de placas"""

    imagen = serializers.ImageField()
    observaciones = serializers.CharField(required=False, allow_blank=True)


class RespuestaReconocimientoSerializer(serializers.Serializer):
    """Serializer para respuestas de reconocimiento"""

    exito = serializers.BooleanField()
    mensaje = serializers.CharField()
    confianza = serializers.FloatField(required=False)
    persona_detectada = PersonaAutorizadaSerializer(required=False)
    vehiculo_detectado = VehiculoAutorizadoSerializer(required=False)
    registro_id = serializers.IntegerField(required=False)
    alerta_generada = serializers.BooleanField(default=False)
