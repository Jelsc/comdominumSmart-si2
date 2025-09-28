from django.apps import AppConfig


class IaSeguridadConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'ia_seguridad'
    verbose_name = 'IA y Seguridad'
    
    def ready(self):
        """Configuración al iniciar la app"""
        try:
            from .models import ConfiguracionIA
            # Crear configuración por defecto si no existe
            if not ConfiguracionIA.objects.exists():
                ConfiguracionIA.objects.create()
        except:
            # Durante migraciones pueden ocurrir errores
            pass
