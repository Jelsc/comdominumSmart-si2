from django.contrib import admin
from .models import Inventario

@admin.register(Inventario)
class InventarioAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'categoria', 'estado', 'area_comun', 'valor_estimado', 'ubicacion', 'fecha_adquisicion')
    search_fields = ('nombre', 'categoria', 'ubicacion')
    list_filter = ('estado', 'categoria', 'area_comun')
    date_hierarchy = 'fecha_adquisicion'