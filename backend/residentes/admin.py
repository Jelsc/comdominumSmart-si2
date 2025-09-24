from django.contrib import admin
from .models import Residente


@admin.register(Residente)
class ResidenteAdmin(admin.ModelAdmin):
    list_display = [
        'nombre_completo',
        'unidad_habitacional',
        'tipo',
        'estado',
        'fecha_ingreso',
        'email',
        'telefono'
    ]
    
    list_filter = [
        'estado',
        'tipo',
        'fecha_ingreso',
        'fecha_creacion'
    ]
    
    search_fields = [
        'nombre',
        'apellido',
        'email',
        'telefono',
        'ci',
        'unidad_habitacional'
    ]
    
    readonly_fields = [
        'fecha_creacion',
        'fecha_actualizacion'
    ]
    
    fieldsets = [
        ('Información Personal', {
            'fields': (
                'nombre', 
                'apellido', 
                'ci', 
                'email', 
                'telefono'
            )
        }),
        ('Información de Residencia', {
            'fields': (
                'unidad_habitacional', 
                'tipo', 
                'fecha_ingreso', 
                'estado'
            )
        }),
        ('Usuario', {
            'fields': ('usuario',),
            'classes': ('collapse',)
        }),
        ('Control', {
            'fields': (
                'fecha_creacion', 
                'fecha_actualizacion'
            ),
            'classes': ('collapse',)
        }),
    ]
    
    ordering = ['-fecha_creacion']
    
    def nombre_completo(self, obj):
        """Muestra el nombre completo del residente"""
        return obj.nombre_completo
    nombre_completo.short_description = "Nombre Completo"
    nombre_completo.admin_order_field = 'nombre'
    
    def get_queryset(self, request):
        """Optimiza las consultas"""
        return super().get_queryset(request).select_related('usuario')
    
    actions = ['activar_residentes', 'desactivar_residentes', 'marcar_como_propietarios']
    
    def activar_residentes(self, request, queryset):
        """Acción para activar residentes seleccionados"""
        updated = queryset.update(estado='activo')
        self.message_user(
            request,
            f'{updated} residente(s) activado(s) exitosamente.'
        )
    activar_residentes.short_description = "Activar residentes seleccionados"
    
    def desactivar_residentes(self, request, queryset):
        """Acción para desactivar residentes seleccionados"""
        updated = queryset.update(estado='inactivo')
        self.message_user(
            request,
            f'{updated} residente(s) desactivado(s) exitosamente.'
        )
    desactivar_residentes.short_description = "Desactivar residentes seleccionados"
    
    def marcar_como_propietarios(self, request, queryset):
        """Acción para marcar residentes como propietarios"""
        updated = queryset.update(tipo='propietario')
        self.message_user(
            request,
            f'{updated} residente(s) marcado(s) como propietario(s) exitosamente.'
        )
    marcar_como_propietarios.short_description = "Marcar como propietarios"