from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import Residente

User = get_user_model()


class ResidenteSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Residente"""
    
    # Campos del usuario relacionado
    username = serializers.CharField(source='usuario.username', read_only=True, allow_null=True)
    
    # Campos calculados
    nombre_completo = serializers.CharField(read_only=True)
    puede_acceder = serializers.BooleanField(read_only=True)
    estado_usuario = serializers.CharField(read_only=True)
    
    class Meta:
        model = Residente
        fields = [
            'id',
            'usuario',
            'username',
            'nombre',
            'apellido',
            'ci',
            'email',
            'telefono',
            'unidad_habitacional',
            'tipo',
            'fecha_ingreso',
            'estado',
            'nombre_completo',
            'puede_acceder',
            'estado_usuario',
            'fecha_creacion',
            'fecha_actualizacion'
        ]
        read_only_fields = [
            'id',
            'fecha_creacion',
            'fecha_actualizacion'
        ]
    
    def validate_email(self, value):
        """Valida que el email sea único"""
        if self.instance and self.instance.email == value:
            return value
        
        if Residente.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "Ya existe un residente con este email."
            )
        return value
    
    def validate_ci(self, value):
        """Valida que la CI sea único"""
        if self.instance and self.instance.ci == value:
            return value
        
        if Residente.objects.filter(ci=value).exists():
            raise serializers.ValidationError(
                "Ya existe un residente con esta cédula de identidad."
            )
        return value
    
    def validate_fecha_ingreso(self, value):
        """Valida que la fecha de ingreso sea válida"""
        if value > timezone.now().date():
            raise serializers.ValidationError(
                "La fecha de ingreso no puede ser futura."
            )
        return value


class ResidenteCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear residentes"""
    
    class Meta:
        model = Residente
        fields = [
            'nombre',
            'apellido',
            'ci',
            'email',
            'telefono',
            'unidad_habitacional',
            'tipo',
            'fecha_ingreso',
            'estado'
        ]
    
    def validate_email(self, value):
        """Valida que el email sea único"""
        if Residente.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "Ya existe un residente con este email."
            )
        return value
    
    def validate_ci(self, value):
        """Valida que la CI sea único"""
        if Residente.objects.filter(ci=value).exists():
            raise serializers.ValidationError(
                "Ya existe un residente con esta cédula de identidad."
            )
        return value
    
    def validate_fecha_ingreso(self, value):
        """Valida que la fecha de ingreso sea válida"""
        if value > timezone.now().date():
            raise serializers.ValidationError(
                "La fecha de ingreso no puede ser futura."
            )
        return value


class ResidenteUpdateSerializer(serializers.ModelSerializer):
    """Serializer para actualizar residentes"""
    
    class Meta:
        model = Residente
        fields = [
            'nombre',
            'apellido',
            'ci',
            'email',
            'telefono',
            'unidad_habitacional',
            'tipo',
            'fecha_ingreso',
            'estado'
        ]
    
    def validate_email(self, value):
        """Valida que el email sea único"""
        if self.instance and self.instance.email == value:
            return value
        
        if Residente.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "Ya existe un residente con este email."
            )
        return value
    
    def validate_ci(self, value):
        """Valida que la CI sea único"""
        if self.instance and self.instance.ci == value:
            return value
        
        if Residente.objects.filter(ci=value).exists():
            raise serializers.ValidationError(
                "Ya existe un residente con esta cédula de identidad."
            )
        return value
    
    def validate_fecha_ingreso(self, value):
        """Valida que la fecha de ingreso sea válida"""
        if value > timezone.now().date():
            raise serializers.ValidationError(
                "La fecha de ingreso no puede ser futura."
            )
        return value