from rest_framework import serializers
from django.utils import timezone
from datetime import datetime, time
from .models import Reserva
from areas_comunes.models import AreaComun
from areas_comunes.serializers import AreaComunSerializer
from residentes.models import Residente
from residentes.serializers import ResidenteSerializer
from users.models import CustomUser


class ReservaSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Reserva"""
    
    # Campos relacionados
    area_comun_info = AreaComunSerializer(source='area_comun', read_only=True)
    residente_info = ResidenteSerializer(source='residente', read_only=True)
    administrador_nombre = serializers.CharField(
        source='administrador_aprobacion.get_full_name', 
        read_only=True
    )
    
    # Campos calculados
    duracion_horas = serializers.SerializerMethodField()
    puede_cancelar = serializers.SerializerMethodField()
    puede_modificar = serializers.SerializerMethodField()
    esta_activa = serializers.SerializerMethodField()
    
    class Meta:
        model = Reserva
        fields = [
            'id',
            'area_comun',
            'area_comun_info',
            'residente',
            'residente_info',
            'fecha_reserva',
            'hora_inicio',
            'hora_fin',
            'tipo_reserva',
            'motivo',
            'numero_personas',
            'estado',
            'costo_total',
            'fecha_creacion',
            'fecha_actualizacion',
            'observaciones_admin',
            'administrador_aprobacion',
            'administrador_nombre',
            'fecha_aprobacion',
            'duracion_horas',
            'puede_cancelar',
            'puede_modificar',
            'esta_activa',
        ]
        read_only_fields = [
            'id',
            'costo_total',
            'fecha_creacion',
            'fecha_actualizacion',
            'administrador_aprobacion',
            'fecha_aprobacion',
        ]
    
    def get_duracion_horas(self, obj):
        """Retorna la duración en horas"""
        return obj.duracion_horas()
    
    def get_puede_cancelar(self, obj):
        """Verifica si puede ser cancelada"""
        return obj.puede_cancelar()
    
    def get_puede_modificar(self, obj):
        """Verifica si puede ser modificada"""
        return obj.puede_modificar()
    
    def get_esta_activa(self, obj):
        """Verifica si está activa"""
        return obj.esta_activa()
    
    def validate_fecha_reserva(self, value):
        """Valida que la fecha sea futura"""
        if value < timezone.now().date():
            raise serializers.ValidationError(
                "La fecha de reserva debe ser futura."
            )
        return value
    
    def validate_hora_fin(self, value):
        """Valida que la hora de fin sea mayor que la de inicio"""
        hora_inicio = self.initial_data.get('hora_inicio')
        if hora_inicio and value <= time(hour=int(hora_inicio.split(':')[0]), 
                                        minute=int(hora_inicio.split(':')[1])):
            raise serializers.ValidationError(
                "La hora de fin debe ser mayor que la hora de inicio."
            )
        return value
    
    def validate(self, data):
        """Validaciones generales"""
        # Validar que no haya conflictos de horarios
        if 'area_comun' in data and 'fecha_reserva' in data and 'hora_inicio' in data and 'hora_fin' in data:
            self._validar_conflicto_horario(data)
        
        return data
    
    def _validar_conflicto_horario(self, data):
        """Valida que no haya conflictos de horarios para la misma área"""
        area = data['area_comun']
        fecha = data['fecha_reserva']
        hora_inicio = data['hora_inicio']
        hora_fin = data['hora_fin']
        
        # Buscar reservas existentes que se solapen
        reservas_existentes = Reserva.objects.filter(
            area_comun=area,
            fecha_reserva=fecha,
            estado__in=[Reserva.ESTADO_PENDIENTE, Reserva.ESTADO_CONFIRMADA]
        ).exclude(
            id=self.instance.id if self.instance else None
        )
        
        for reserva in reservas_existentes:
            # Verificar si hay solapamiento
            if (hora_inicio < reserva.hora_fin and hora_fin > reserva.hora_inicio):
                raise serializers.ValidationError(
                    f"Ya existe una reserva para este horario. "
                    f"Conflicto con reserva de {reserva.hora_inicio} a {reserva.hora_fin}."
                )


class ReservaCreateSerializer(ReservaSerializer):
    """Serializer para crear reservas (con validaciones adicionales)"""
    
    # Hacer el campo residente opcional en la creación
    residente = serializers.PrimaryKeyRelatedField(
        queryset=Residente.objects.all(),
        required=False,
        allow_null=True
    )
    
    class Meta(ReservaSerializer.Meta):
        fields = ReservaSerializer.Meta.fields
        read_only_fields = ReservaSerializer.Meta.read_only_fields + ['estado']
    
    def validate(self, data):
        """Validaciones adicionales para creación"""
        # Verificar que el área esté activa
        if data.get('area_comun'):
            if data['area_comun'].estado != AreaComun.ESTADO_ACTIVO:
                raise serializers.ValidationError(
                    "El área común seleccionada no está disponible para reservas."
                )
        
        return super().validate(data)


class ReservaUpdateSerializer(ReservaSerializer):
    """Serializer para actualizar reservas"""
    
    def validate_estado(self, value):
        """Valida cambios de estado"""
        if self.instance:
            estado_actual = self.instance.estado
            
            # Solo permitir ciertos cambios de estado
            cambios_permitidos = {
                Reserva.ESTADO_PENDIENTE: [Reserva.ESTADO_CONFIRMADA, Reserva.ESTADO_RECHAZADA, Reserva.ESTADO_CANCELADA],
                Reserva.ESTADO_CONFIRMADA: [Reserva.ESTADO_CANCELADA, Reserva.ESTADO_COMPLETADA],
                Reserva.ESTADO_CANCELADA: [],
                Reserva.ESTADO_COMPLETADA: [],
                Reserva.ESTADO_RECHAZADA: [],
            }
            
            if value not in cambios_permitidos.get(estado_actual, []):
                raise serializers.ValidationError(
                    f"No se puede cambiar el estado de {estado_actual} a {value}."
                )
        
        return value


class ReservaListSerializer(ReservaSerializer):
    """Serializer simplificado para listados"""
    
    class Meta(ReservaSerializer.Meta):
        fields = [
            'id',
            'area_comun_info',
            'residente_info',
            'fecha_reserva',
            'hora_inicio',
            'hora_fin',
            'tipo_reserva',
            'estado',
            'costo_total',
            'duracion_horas',
            'puede_cancelar',
            'puede_modificar',
            'esta_activa',
        ]


class ReservaAprobacionSerializer(serializers.Serializer):
    """Serializer para aprobar/rechazar reservas"""
    
    accion = serializers.ChoiceField(choices=['aprobar', 'rechazar'])
    observaciones = serializers.CharField(
        max_length=1000,
        required=False,
        allow_blank=True
    )
    
    def validate_observaciones(self, value):
        """Valida observaciones según la acción"""
        accion = self.initial_data.get('accion')
        if accion == 'rechazar' and not value:
            raise serializers.ValidationError(
                "Las observaciones son obligatorias al rechazar una reserva."
            )
        return value


class ReservaEstadisticasSerializer(serializers.Serializer):
    """Serializer para estadísticas de reservas"""
    
    total_reservas = serializers.IntegerField()
    reservas_pendientes = serializers.IntegerField()
    reservas_confirmadas = serializers.IntegerField()
    reservas_canceladas = serializers.IntegerField()
    reservas_completadas = serializers.IntegerField()
    reservas_rechazadas = serializers.IntegerField()
    ingresos_totales = serializers.DecimalField(max_digits=10, decimal_places=2)
    reservas_por_mes = serializers.ListField()
    areas_mas_populares = serializers.ListField()
