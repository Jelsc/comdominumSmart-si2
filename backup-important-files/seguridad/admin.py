from django.contrib import admin
from .models import (
    RegistroAcceso,
    RegistroVehiculo,
    ConfiguracionSeguridad,
    AlertaSeguridad,
    PersonaAutorizada,
    VehiculoAutorizado,
)


@admin.register(RegistroAcceso)
class RegistroAccesoAdmin(admin.ModelAdmin):
    list_display = ["persona", "tipo_acceso", "fecha_hora", "resultado", "confianza"]
    list_filter = ["tipo_acceso", "resultado", "fecha_hora"]
    search_fields = ["persona__nombre", "persona__ci"]
    readonly_fields = ["fecha_hora"]


@admin.register(RegistroVehiculo)
class RegistroVehiculoAdmin(admin.ModelAdmin):
    list_display = ["placa", "tipo_vehiculo", "fecha_hora", "resultado", "confianza"]
    list_filter = ["tipo_vehiculo", "resultado", "fecha_hora"]
    search_fields = ["placa"]
    readonly_fields = ["fecha_hora"]


@admin.register(ConfiguracionSeguridad)
class ConfiguracionSeguridadAdmin(admin.ModelAdmin):
    list_display = ["nombre", "activo", "fecha_actualizacion"]
    list_filter = ["activo"]


@admin.register(AlertaSeguridad)
class AlertaSeguridadAdmin(admin.ModelAdmin):
    list_display = ["tipo", "severidad", "fecha_hora", "resuelta"]
    list_filter = ["tipo", "severidad", "resuelta", "fecha_hora"]
    readonly_fields = ["fecha_hora"]


@admin.register(PersonaAutorizada)
class PersonaAutorizadaAdmin(admin.ModelAdmin):
    list_display = ["nombre", "ci", "tipo_acceso", "activo"]
    list_filter = ["tipo_acceso", "activo"]
    search_fields = ["nombre", "ci"]


@admin.register(VehiculoAutorizado)
class VehiculoAutorizadoAdmin(admin.ModelAdmin):
    list_display = ["placa", "propietario", "tipo_vehiculo", "activo"]
    list_filter = ["tipo_vehiculo", "activo"]
    search_fields = ["placa", "propietario"]
