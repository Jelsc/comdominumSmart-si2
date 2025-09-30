from django.apps import AppConfig


class ReservasConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'reservas'
    verbose_name = 'Reservas de Áreas Comunes'
    
    def ready(self):
        """Se ejecuta cuando la aplicación está lista"""
        import reservas.signals  # Importar señales si las hay