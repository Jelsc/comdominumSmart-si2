from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone
from .models import Reserva


@admin.register(Reserva)
class ReservaAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'residente_nombre',
        'area_comun_nombre',
        'fecha_reserva',
        'hora_inicio',
        'hora_fin',
        'tipo_reserva',
        'estado',
        'costo_total',
        'fecha_creacion',
    ]
    
    list_filter = [
        'estado',
        'tipo_reserva',
        'fecha_reserva',
        'area_comun',
        'fecha_creacion',
    ]
    
    search_fields = [
        'residente__nombre',
        'residente__apellido',
        'area_comun__nombre',
        'motivo',
    ]
    
    readonly_fields = [
        'fecha_creacion',
        'fecha_actualizacion',
        'costo_total',
        'duracion_horas',
        'puede_cancelar',
        'puede_modificar',
        'esta_activa',
    ]
    
    fieldsets = [
        ('Información de la Reserva', {
            'fields': (
                'area_comun',
                'residente',
                'fecha_reserva',
                'hora_inicio',
                'hora_fin',
                'tipo_reserva',
                'motivo',
                'numero_personas',
            )
        }),
        ('Estado y Control', {
            'fields': (
                'estado',
                'costo_total',
                'duracion_horas',
                'puede_cancelar',
                'puede_modificar',
                'esta_activa',
            )
        }),
        ('Administración', {
            'fields': (
                'administrador_aprobacion',
                'fecha_aprobacion',
                'observaciones_admin',
            ),
            'classes': ('collapse',)
        }),
        ('Control de Tiempo', {
            'fields': (
                'fecha_creacion',
                'fecha_actualizacion',
            ),
            'classes': ('collapse',)
        }),
    ]
    
    ordering = ['-fecha_creacion']
    
    def residente_nombre(self, obj):
        """Muestra el nombre completo del residente"""
        return obj.residente.nombre_completo
    residente_nombre.short_description = "Residente"
    residente_nombre.admin_order_field = 'residente__nombre'
    
    def area_comun_nombre(self, obj):
        """Muestra el nombre del área común"""
        return obj.area_comun.nombre
    area_comun_nombre.short_description = "Área Común"
    area_comun_nombre.admin_order_field = 'area_comun__nombre'
    
    def duracion_horas(self, obj):
        """Muestra la duración en horas"""
        return f"{obj.duracion_horas():.2f} horas"
    duracion_horas.short_description = "Duración"
    
    def puede_cancelar(self, obj):
        """Muestra si puede ser cancelada"""
        return obj.puede_cancelar()
    puede_cancelar.short_description = "Puede Cancelar"
    puede_cancelar.boolean = True
    
    def puede_modificar(self, obj):
        """Muestra si puede ser modificada"""
        return obj.puede_modificar()
    puede_modificar.short_description = "Puede Modificar"
    puede_modificar.boolean = True
    
    def esta_activa(self, obj):
        """Muestra si está activa"""
        return obj.esta_activa()
    esta_activa.short_description = "Está Activa"
    esta_activa.boolean = True
    
    def get_queryset(self, request):
        """Optimiza las consultas"""
        return super().get_queryset(request).select_related(
            'area_comun', 'residente', 'administrador_aprobacion'
        )
    
    actions = ['aprobar_reservas', 'rechazar_reservas', 'cancelar_reservas', 'completar_reservas']
    
    def aprobar_reservas(self, request, queryset):
        """Aprueba las reservas seleccionadas"""
        reservas_aprobadas = 0
        for reserva in queryset.filter(estado=Reserva.ESTADO_PENDIENTE):
            reserva.aprobar(request.user)
            reservas_aprobadas += 1
        
        self.message_user(
            request,
            f'{reservas_aprobadas} reserva(s) aprobada(s) exitosamente.'
        )
    aprobar_reservas.short_description = "Aprobar reservas seleccionadas"
    
    def rechazar_reservas(self, request, queryset):
        """Rechaza las reservas seleccionadas"""
        reservas_rechazadas = 0
        for reserva in queryset.filter(estado=Reserva.ESTADO_PENDIENTE):
            reserva.rechazar(request.user, "Rechazada desde admin")
            reservas_rechazadas += 1
        
        self.message_user(
            request,
            f'{reservas_rechazadas} reserva(s) rechazada(s) exitosamente.'
        )
    rechazar_reservas.short_description = "Rechazar reservas seleccionadas"
    
    def cancelar_reservas(self, request, queryset):
        """Cancela las reservas seleccionadas"""
        reservas_canceladas = 0
        for reserva in queryset.filter(estado__in=[Reserva.ESTADO_PENDIENTE, Reserva.ESTADO_CONFIRMADA]):
            reserva.cancelar("Cancelada desde admin")
            reservas_canceladas += 1
        
        self.message_user(
            request,
            f'{reservas_canceladas} reserva(s) cancelada(s) exitosamente.'
        )
    cancelar_reservas.short_description = "Cancelar reservas seleccionadas"
    
    def completar_reservas(self, request, queryset):
        """Marca como completadas las reservas seleccionadas"""
        reservas_completadas = 0
        for reserva in queryset.filter(estado=Reserva.ESTADO_CONFIRMADA):
            reserva.completar()
            reservas_completadas += 1
        
        self.message_user(
            request,
            f'{reservas_completadas} reserva(s) completada(s) exitosamente.'
        )
    completar_reservas.short_description = "Completar reservas seleccionadas"