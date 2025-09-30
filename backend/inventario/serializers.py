from rest_framework import serializers
from .models import Inventario
from areas_comunes.serializers import AreaComunSerializer


class InventarioSerializer(serializers.ModelSerializer):
    area_comun_nombre = serializers.SerializerMethodField()
    
    class Meta:
        model = Inventario
        fields = '__all__'
        
    def get_area_comun_nombre(self, obj):
        if obj.area_comun:
            return obj.area_comun.nombre
        return None


class InventarioDetailSerializer(serializers.ModelSerializer):
    area_comun = AreaComunSerializer(read_only=True)
    
    class Meta:
        model = Inventario
        fields = '__all__'