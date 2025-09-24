"""
Seeder para datos de Residentes.
"""
from .base_seeder import BaseSeeder
from datetime import date, timedelta

class ResidenteSeeder(BaseSeeder):
    """
    Crea datos de Residentes para el sistema del condominio.
    """
    
    @classmethod
    def run(cls):
        """
        Crea registros de residentes de prueba.
        """
        try:
            from residentes.models import Residente
            
            # Datos de residentes de prueba
            residentes_data = [
                {
                    "nombre": "María",
                    "apellido": "García",
                    "ci": "12345678",
                    "email": "maria.garcia@example.com",
                    "telefono": "77712345",
                    "unidad_habitacional": "101",
                    "tipo": "propietario",
                    "fecha_ingreso": date(2020, 1, 15),
                    "estado": "activo"
                },
                {
                    "nombre": "Carlos",
                    "apellido": "Rodríguez",
                    "ci": "23456789",
                    "email": "carlos.rodriguez@example.com",
                    "telefono": "77723456",
                    "unidad_habitacional": "102",
                    "tipo": "propietario",
                    "fecha_ingreso": date(2019, 6, 10),
                    "estado": "activo"
                },
                {
                    "nombre": "Ana",
                    "apellido": "Martínez",
                    "ci": "34567890",
                    "email": "ana.martinez@example.com",
                    "telefono": "77734567",
                    "unidad_habitacional": "201",
                    "tipo": "inquilino",
                    "fecha_ingreso": date(2021, 3, 1),
                    "estado": "activo"
                },
                {
                    "nombre": "Luis",
                    "apellido": "Fernández",
                    "ci": "45678901",
                    "email": "luis.fernandez@example.com",
                    "telefono": "77745678",
                    "unidad_habitacional": "202",
                    "tipo": "propietario",
                    "fecha_ingreso": date(2018, 9, 20),
                    "estado": "inactivo"
                },
                {
                    "nombre": "Laura",
                    "apellido": "Sánchez",
                    "ci": "56789012",
                    "email": "laura.sanchez@example.com",
                    "telefono": "77756789",
                    "unidad_habitacional": "301",
                    "tipo": "inquilino",
                    "fecha_ingreso": date(2022, 1, 5),
                    "estado": "en_proceso"
                },
                {
                    "nombre": "Roberto",
                    "apellido": "López",
                    "ci": "67890123",
                    "email": "roberto.lopez@example.com",
                    "telefono": "77767890",
                    "unidad_habitacional": "302",
                    "tipo": "propietario",
                    "fecha_ingreso": date(2020, 11, 12),
                    "estado": "suspendido"
                },
                {
                    "nombre": "Carmen",
                    "apellido": "González",
                    "ci": "78901234",
                    "email": "carmen.gonzalez@example.com",
                    "telefono": "77778901",
                    "unidad_habitacional": "401",
                    "tipo": "propietario",
                    "fecha_ingreso": date(2019, 4, 8),
                    "estado": "activo"
                },
                {
                    "nombre": "Pedro",
                    "apellido": "Hernández",
                    "ci": "89012345",
                    "email": "pedro.hernandez@example.com",
                    "telefono": "77789012",
                    "unidad_habitacional": "402",
                    "tipo": "inquilino",
                    "fecha_ingreso": date(2021, 7, 15),
                    "estado": "activo"
                },
                {
                    "nombre": "Isabel",
                    "apellido": "Díaz",
                    "ci": "90123456",
                    "email": "isabel.diaz@example.com",
                    "telefono": "77790123",
                    "unidad_habitacional": "501",
                    "tipo": "propietario",
                    "fecha_ingreso": date(2020, 2, 28),
                    "estado": "activo"
                },
                {
                    "nombre": "Francisco",
                    "apellido": "Ruiz",
                    "ci": "01234567",
                    "email": "francisco.ruiz@example.com",
                    "telefono": "77701234",
                    "unidad_habitacional": "502",
                    "tipo": "inquilino",
                    "fecha_ingreso": date(2022, 5, 10),
                    "estado": "en_proceso"
                }
            ]
            
            for data in residentes_data:
                residente, created = Residente.objects.get_or_create(
                    ci=data["ci"],
                    defaults=data
                )
                if created:
                    print(f"✓ Residente creado: {residente.nombre} {residente.apellido} - Casa {residente.unidad_habitacional} - {residente.tipo}")
                else:
                    print(f"- Residente ya existe: {residente.nombre} {residente.apellido}")
                    
        except ImportError:
            print("❌ Error: No se pudo importar el modelo Residente. Verifica que existe en residentes.models.")
        except Exception as e:
            print(f"❌ Error al crear residentes: {str(e)}")
    
    @classmethod
    def should_run(cls):
        """
        El seeder de residentes debe ejecutarse si no existen registros de residentes.
        """
        try:
            from residentes.models import Residente
            return Residente.objects.count() == 0
        except ImportError:
            return False
