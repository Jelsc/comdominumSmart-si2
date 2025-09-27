from django.contrib import admin
from .models import Notificacion


@admin.register(Notificacion)
class NotificacionAdmin(admin.ModelAdmin):
    list_display = [
        'nombre', 
        'tipo', 
        'estado', 
        'prioridad', 
        'es_individual',
        'activa',
        'fecha_programada', 
        'creado_por',
        'fecha_creacion'
    ]
    list_filter = [
        'tipo', 
        'estado', 
        'prioridad', 
        'es_individual',
        'activa',
        'fecha_creacion'
    ]
    search_fields = ['nombre', 'descripcion']
    readonly_fields = ['fecha_creacion', 'fecha_actualizacion', 'total_destinatarios']
    filter_horizontal = ['roles_destinatarios']
    
    fieldsets = (
        ('Información Principal', {
            'fields': ('nombre', 'descripcion', 'tipo', 'estado', 'prioridad')
        }),
        ('Destinatarios', {
            'fields': ('roles_destinatarios', 'es_individual', 'total_destinatarios')
        }),
        ('Programación', {
            'fields': ('fecha_programada', 'fecha_expiracion', 'requiere_confirmacion')
        }),
        ('Estado', {
            'fields': ('activa', 'creado_por')
        }),
        ('Fechas', {
            'fields': ('fecha_creacion', 'fecha_actualizacion'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        if not change:  # Si es un nuevo objeto
            obj.creado_por = request.user
        super().save_model(request, obj, form, change)