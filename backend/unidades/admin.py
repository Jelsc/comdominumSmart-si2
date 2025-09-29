from django.contrib import admin
from .models import UnidadHabitacional


@admin.register(UnidadHabitacional)
class UnidadHabitacionalAdmin(admin.ModelAdmin):
    list_display = ('direccion', 'estado', 'cantidad_vehiculos', 'residentes_display', 'fecha_actualizacion')
    list_filter = ('estado',)
    search_fields = ('direccion',)
    readonly_fields = ('fecha_creacion', 'fecha_actualizacion')
    
    def residentes_display(self, obj):
        residentes = obj.residentes
        if residentes:
            return ", ".join([str(r.nombre_completo) for r in residentes])
        return "Sin residentes"
    
    residentes_display.short_description = "Residentes"