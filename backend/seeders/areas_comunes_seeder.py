from areas_comunes.models import AreaComun
from django.db import transaction
from .base_seeder import BaseSeeder

class AreaComunSeeder(BaseSeeder):
    @classmethod
    def run(cls):
        data = [
            {
                "nombre": "Salón de eventos",
                "monto_hora": 250.00,
                "estado": AreaComun.ESTADO_ACTIVO,
            },
            {
                "nombre": "Piscina",
                "monto_hora": 150.00,
                "estado": AreaComun.ESTADO_MANTENIMIENTO,
            },
            {
                "nombre": "Gimnasio",
                "monto_hora": 100.00,
                "estado": AreaComun.ESTADO_ACTIVO,
            },
            {
                "nombre": "Cancha de tenis",
                "monto_hora": 120.00,
                "estado": AreaComun.ESTADO_INACTIVO,
            },
        ]
        with transaction.atomic():
            for item in data:
                AreaComun.objects.update_or_create(
                    nombre=item["nombre"], defaults=item
                )
        print("Seeders de áreas comunes ejecutados correctamente.")
