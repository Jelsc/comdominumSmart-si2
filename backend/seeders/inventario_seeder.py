from django.utils import timezone
from .base_seeder import BaseSeeder
from inventario.models import Inventario
from areas_comunes.models import AreaComun
import random


class InventarioSeeder(BaseSeeder):
    """Seeder para cargar datos de prueba del inventario."""

    @classmethod
    def run(cls):
        """Poblar la base de datos con inventario de prueba."""
        print("📦 Creando datos de prueba para inventario...")
        
        if Inventario.objects.count() > 0:
            print("✅ Ya existen registros de inventario. Saltando...")
            return
        
        # Obtener áreas comunes existentes
        areas_comunes = list(AreaComun.objects.all())
        
        if not areas_comunes:
            print("⚠️ No se encontraron áreas comunes. Creando inventario sin áreas asociadas.")
        
        # Datos de ejemplo para inventario
        datos_inventario = [
            {
                "nombre": "Mesa plegable",
                "categoria": "MOBILIARIO",
                "estado": "ACTIVO",
                "valor_estimado": "1500.00",
                "ubicacion": "Almacén principal",
                "fecha_adquisicion": timezone.now().date() - timezone.timedelta(days=120),
                "descripcion": "Mesa plegable para eventos, color blanco, capacidad para 8 personas."
            },
            {
                "nombre": "Sillas plásticas",
                "categoria": "MOBILIARIO",
                "estado": "ACTIVO",
                "valor_estimado": "800.00",
                "ubicacion": "Salón de eventos",
                "fecha_adquisicion": timezone.now().date() - timezone.timedelta(days=150),
                "descripcion": "Set de 20 sillas plásticas blancas para eventos."
            },
            {
                "nombre": "Proyector Epson",
                "categoria": "EQUIPO_TECNOLOGICO",
                "estado": "ACTIVO",
                "valor_estimado": "3500.00",
                "ubicacion": "Oficina administrativa",
                "fecha_adquisicion": timezone.now().date() - timezone.timedelta(days=200),
                "descripcion": "Proyector Epson PowerLite S39, 3300 lúmenes, resolución SVGA."
            },
            {
                "nombre": "Equipo de sonido",
                "categoria": "EQUIPO_TECNOLOGICO",
                "estado": "EN_REPARACION",
                "valor_estimado": "2800.00",
                "ubicacion": "Sala de mantenimiento",
                "fecha_adquisicion": timezone.now().date() - timezone.timedelta(days=300),
                "descripcion": "Sistema de sonido con 2 altavoces, mezcladora y micrófono."
            },
            {
                "nombre": "Herramientas de jardinería",
                "categoria": "HERRAMIENTA",
                "estado": "ACTIVO",
                "valor_estimado": "950.00",
                "ubicacion": "Bodega de jardín",
                "fecha_adquisicion": timezone.now().date() - timezone.timedelta(days=180),
                "descripcion": "Set completo de herramientas para mantenimiento de áreas verdes."
            },
            {
                "nombre": "Cafetera industrial",
                "categoria": "ELECTRODOMESTICO",
                "estado": "ACTIVO",
                "valor_estimado": "1200.00",
                "ubicacion": "Cocina del salón de eventos",
                "fecha_adquisicion": timezone.now().date() - timezone.timedelta(days=250),
                "descripcion": "Cafetera de 40 tazas marca Hamilton Beach."
            },
            {
                "nombre": "Decoración navideña",
                "categoria": "DECORACION",
                "estado": "INACTIVO",
                "valor_estimado": "3000.00",
                "ubicacion": "Bodega del subsuelo",
                "fecha_adquisicion": timezone.now().date() - timezone.timedelta(days=400),
                "descripcion": "Decoración completa para navidad: árbol, luces, adornos."
            },
            {
                "nombre": "Aspiradora industrial",
                "categoria": "ELECTRODOMESTICO",
                "estado": "ACTIVO",
                "valor_estimado": "1800.00",
                "ubicacion": "Cuarto de limpieza",
                "fecha_adquisicion": timezone.now().date() - timezone.timedelta(days=220),
                "descripcion": "Aspiradora industrial de alto rendimiento marca Karcher."
            },
            {
                "nombre": "Televisor 55 pulgadas",
                "categoria": "EQUIPO_TECNOLOGICO",
                "estado": "DADO_DE_BAJA",
                "valor_estimado": "4500.00",
                "ubicacion": "Depósito",
                "fecha_adquisicion": timezone.now().date() - timezone.timedelta(days=800),
                "descripcion": "TV Samsung Smart TV con problemas en la pantalla."
            },
            {
                "nombre": "Tumbonas de piscina",
                "categoria": "MOBILIARIO",
                "estado": "ACTIVO",
                "valor_estimado": "2200.00",
                "ubicacion": "Área de piscina",
                "fecha_adquisicion": timezone.now().date() - timezone.timedelta(days=160),
                "descripcion": "Set de 6 tumbonas para exterior, material resistente al agua."
            }
        ]

        try:
            for dato in datos_inventario:
                # Asignar área común aleatoriamente (o dejar en None)
                if areas_comunes and random.random() > 0.3:  # 70% de probabilidad de asignar área
                    dato['area_comun'] = random.choice(areas_comunes)
                
                Inventario.objects.create(**dato)
                
            print(f"✅ Se han creado {len(datos_inventario)} registros de inventario con éxito.")
        except Exception as e:
            print(f"❌ Error al crear registros de inventario: {str(e)}")
            
    @classmethod
    def should_run(cls):
        """
        El seeder de inventario debe ejecutarse si no existen registros de inventario.
        """
        try:
            from inventario.models import Inventario
            return Inventario.objects.count() == 0
        except ImportError:
            return False