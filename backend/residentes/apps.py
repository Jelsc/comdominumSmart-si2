from django.apps import AppConfig


class ResidentesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'residentes'
    verbose_name = 'Residentes'
    
    def ready(self):
        """Se ejecuta cuando la aplicación está lista"""
        try:
            import residentes.signals  # Importar señales si las hay
        except ImportError:
            # No hay archivo de señales, no es un error
            pass
