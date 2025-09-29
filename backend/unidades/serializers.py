from rest_framework import serializers
from django.db import transaction
from residentes.models import Residente
from .models import UnidadHabitacional


class ResidenteSimpleSerializer(serializers.ModelSerializer):
    """Serializer simplificado para mostrar residentes"""
    
    class Meta:
        model = Residente
        fields = ['id', 'nombre', 'apellido']
        read_only_fields = fields


class UnidadHabitacionalSerializer(serializers.ModelSerializer):
    """Serializer principal para el modelo UnidadHabitacional - Refactorizado"""
    
    # Campo para enviar/recibir IDs de residentes (0 a 2 residentes)
    residente_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        write_only=True,
        allow_empty=True,
        allow_null=True,
    )
    
    # Campo para mostrar información de los residentes (solo lectura)
    residentes = ResidenteSimpleSerializer(many=True, read_only=True)
    
    class Meta:
        model = UnidadHabitacional
        fields = [
            'id',
            'codigo',
            'estado',
            'direccion',
            'cantidad_vehiculos',
            'residente_ids',
            'residentes',
            'fecha_creacion',
            'fecha_actualizacion',
        ]
        read_only_fields = [
            'id',
            'fecha_creacion',
            'fecha_actualizacion',
        ]
    
    def validate_codigo(self, value):
        """Valida que el código de unidad tenga el formato correcto y sea único"""
        if self.instance and self.instance.codigo == value:
            return value

        if UnidadHabitacional.objects.filter(codigo=value).exists():
            raise serializers.ValidationError("Ya existe una unidad con este código.")
        return value
        
    def validate_cantidad_vehiculos(self, value):
        """Validar que la cantidad de vehículos no sea negativa"""
        if value < 0:
            raise serializers.ValidationError("La cantidad de vehículos no puede ser negativa.")
        return value
    
    def validate_residente_ids(self, value):
        """
        Normalizar residente_ids:
        - Si es None o no se proporciona, se establece como lista vacía
        - Validar que no tenga más de 2 elementos
        """
        # Normalizar a lista vacía si es None
        if value is None:
            return []
        
        # Validar máximo 2 residentes
        if len(value) > 2:
            raise serializers.ValidationError("Una unidad habitacional no puede tener más de 2 residentes.")
        
        # Verificar que los residentes existan
        residentes_count = Residente.objects.filter(id__in=value).count()
        if residentes_count != len(value):
            raise serializers.ValidationError("Uno o más residentes no existen.")
        
        # Verificar que no estén asignados a otra unidad (excepto si es una actualización)
        if self.instance:
            # En caso de actualización, excluir la unidad actual
            residentes_en_otra_unidad = Residente.objects.filter(
                id__in=value, 
                unidad_habitacional__isnull=False
            ).exclude(
                unidad_habitacional=self.instance.codigo
            )
        else:
            # En caso de creación
            residentes_en_otra_unidad = Residente.objects.filter(
                id__in=value, 
                unidad_habitacional__isnull=False
            )
        
        if residentes_en_otra_unidad.exists():
            residentes_ocupados = ", ".join([str(r) for r in residentes_en_otra_unidad])
            raise serializers.ValidationError(
                f"Los siguientes residentes ya están asignados a otra unidad: {residentes_ocupados}"
            )
        
        return value
    
    @transaction.atomic
    def create(self, validated_data):
        """
        Crear una unidad habitacional y asignar residentes si se especifican
        """
        # Extraer residente_ids del validated_data (lista vacía por defecto)
        residente_ids = validated_data.pop('residente_ids', [])
        
        # Crear la unidad
        unidad = super().create(validated_data)
        
        # Asignar residentes
        unidad.asignar_residentes(residente_ids)
        
        return unidad
    
    @transaction.atomic
    def update(self, instance, validated_data):
        """
        Actualizar una unidad habitacional y reasignar residentes si se especifican
        """
        # Extraer residente_ids del validated_data
        residente_ids = validated_data.pop('residente_ids', None)
        
        # Actualizar la unidad
        unidad = super().update(instance, validated_data)
        
        # Reasignar residentes solo si se especificó el campo
        if residente_ids is not None:
            unidad.asignar_residentes(residente_ids)
        
        return unidad


class UnidadHabitacionalCreateSerializer(UnidadHabitacionalSerializer):
    """Serializer específico para la creación de unidades habitacionales"""
    
    class Meta(UnidadHabitacionalSerializer.Meta):
        # Heredamos todo de la clase padre y podemos sobrescribir o añadir
        pass


class UnidadHabitacionalUpdateSerializer(UnidadHabitacionalSerializer):
    """Serializer específico para la actualización de unidades habitacionales"""
    
    class Meta(UnidadHabitacionalSerializer.Meta):
        # Heredamos todo de la clase padre y podemos sobrescribir o añadir
        pass


class UnidadHabitacionalEstadoSerializer(serializers.ModelSerializer):
    """Serializer para actualizar solo el estado de una unidad habitacional"""
    
    class Meta:
        model = UnidadHabitacional
        fields = ['estado']