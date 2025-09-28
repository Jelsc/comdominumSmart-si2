from django.contrib import admin
from .models import (
    Camara, FotoResidente, Vehiculo, Visitante, RegistroAcceso,
    AlertaSeguridad, ConfiguracionIA, EstadisticaSeguridad
)


@admin.register(Camara)
class CamaraAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'ubicacion', 'tipo', 'estado', 'ip', 'activa']
    list_filter = ['tipo', 'estado', 'activa']
    search_fields = ['nombre', 'ubicacion', 'ip']
    readonly_fields = ['fecha_instalacion', 'ultima_verificacion']


@admin.register(FotoResidente)
class FotoResidenteAdmin(admin.ModelAdmin):
    list_display = ['residente', 'es_principal', 'activo', 'fecha_creacion']
    list_filter = ['es_principal', 'activo', 'fecha_creacion']
    search_fields = ['residente__nombre', 'residente__apellido', 'residente__ci']
    readonly_fields = ['encoding_facial', 'fecha_creacion']


@admin.register(Vehiculo)
class VehiculoAdmin(admin.ModelAdmin):
    list_display = ['placa', 'residente', 'marca', 'modelo', 'tipo', 'activo']
    list_filter = ['tipo', 'activo', 'marca']
    search_fields = ['placa', 'residente__nombre', 'marca', 'modelo']


@admin.register(Visitante)
class VisitanteAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'ci', 'residente_visitado', 'fecha_entrada', 'fecha_salida']
    list_filter = ['fecha_entrada', 'fecha_salida']
    search_fields = ['nombre', 'ci', 'residente_visitado__nombre']
    readonly_fields = ['encoding_facial']


@admin.register(RegistroAcceso)
class RegistroAccesoAdmin(admin.ModelAdmin):
    list_display = ['fecha_hora', 'tipo_acceso', 'tipo_persona', 'residente', 'confianza_reconocimiento', 'camara_id']
    list_filter = ['tipo_acceso', 'tipo_persona', 'fecha_hora', 'camara_id']
    search_fields = ['residente__nombre', 'visitante__nombre', 'placa_vehiculo']
    readonly_fields = ['fecha_hora']


@admin.register(AlertaSeguridad)
class AlertaSeguridadAdmin(admin.ModelAdmin):
    list_display = ['fecha_hora', 'tipo_alerta', 'nivel', 'resuelto', 'camara_id']
    list_filter = ['tipo_alerta', 'nivel', 'resuelto', 'fecha_hora']
    search_fields = ['descripcion']
    readonly_fields = ['fecha_hora']
    actions = ['marcar_resuelto']
    
    def marcar_resuelto(self, request, queryset):
        queryset.update(resuelto=True)
    marcar_resuelto.short_description = "Marcar alertas como resueltas"


@admin.register(ConfiguracionIA)
class ConfiguracionIAAdmin(admin.ModelAdmin):
    list_display = ['id', 'umbral_confianza_facial', 'umbral_confianza_ocr', 'activo_deteccion_anomalias']
    
    def has_add_permission(self, request):
        # Solo permitir una configuración
        return not ConfiguracionIA.objects.exists()


@admin.register(EstadisticaSeguridad)
class EstadisticaSeguridadAdmin(admin.ModelAdmin):
    list_display = ['fecha', 'total_accesos', 'accesos_residentes', 'accesos_visitantes', 'alertas_generadas']
    list_filter = ['fecha']
    readonly_fields = ['fecha']
