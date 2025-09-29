"""
Seeder para datos de Unidades Habitacionales.
"""
from .base_seeder import BaseSeeder


class UnidadSeeder(BaseSeeder):
    """
    Crea datos de Unidades Habitacionales para el sistema del condominio.
    """
    
    @classmethod
    def run(cls):
        """
        Crea registros de unidades habitacionales de prueba.
        """
        try:
            from unidades.models import UnidadHabitacional
            
            # Verificar si ya existen unidades para evitar duplicación
            if UnidadHabitacional.objects.exists():
                print("Ya existen unidades habitacionales en la base de datos.")
                return False
            
            # Datos de unidades habitacionales de prueba
            unidades_data = [
                # Zona A - Casas
                {
                    "codigo": "A-101",
                    "direccion": "Calle Los Olivos, Casa 101",
                    "estado": "OCUPADA",
                    "cantidad_vehiculos": 1,
                },
                {
                    "codigo": "A-102",
                    "direccion": "Calle Los Olivos, Casa 102",
                    "estado": "OCUPADA",
                    "cantidad_vehiculos": 1,
                },
                {
                    "codigo": "A-103",
                    "direccion": "Calle Los Olivos, Casa 103",
                    "estado": "DESOCUPADA",
                    "cantidad_vehiculos": 0,
                },
                {
                    "codigo": "A-104",
                    "direccion": "Calle Los Olivos, Casa 104",
                    "estado": "DESOCUPADA",
                    "cantidad_vehiculos": 0,
                },
                
                # Zona A - Casas (continuación)
                {
                    "codigo": "A-201",
                    "direccion": "Calle Los Olivos, Casa 201",
                    "estado": "OCUPADA",
                    "cantidad_vehiculos": 1,
                },
                {
                    "codigo": "A-202",
                    "direccion": "Calle Los Olivos, Casa 202",
                    "estado": "OCUPADA",
                    "cantidad_vehiculos": 1,
                },
                {
                    "codigo": "A-203",
                    "direccion": "Calle Los Olivos, Casa 203",
                    "estado": "DESOCUPADA",
                    "cantidad_vehiculos": 0,
                },
                {
                    "codigo": "A-204",
                    "direccion": "Calle Los Olivos, Casa 204",
                    "estado": "MANTENIMIENTO",
                    "cantidad_vehiculos": 0,
                },
                
                # Zona B - Casas
                {
                    "codigo": "B-101",
                    "direccion": "Calle Los Pinos, Casa 101",
                    "estado": "OCUPADA",
                    "cantidad_vehiculos": 2,
                },
                {
                    "codigo": "B-102",
                    "direccion": "Calle Los Pinos, Casa 102",
                    "estado": "OCUPADA",
                    "cantidad_vehiculos": 1,
                },
                {
                    "codigo": "B-103",
                    "direccion": "Calle Los Pinos, Casa 103",
                    "estado": "DESOCUPADA",
                    "cantidad_vehiculos": 0,
                },
                {
                    "codigo": "B-104",
                    "direccion": "Calle Los Pinos, Casa 104",
                    "estado": "MANTENIMIENTO",
                    "cantidad_vehiculos": 0,
                },
                
                # Zona B - Casas (continuación)
                {
                    "codigo": "B-201",
                    "direccion": "Calle Los Pinos, Casa 201",
                    "estado": "OCUPADA",
                    "cantidad_vehiculos": 1,
                },
                {
                    "codigo": "B-202",
                    "direccion": "Calle Los Pinos, Casa 202",
                    "estado": "OCUPADA",
                    "cantidad_vehiculos": 1,
                },
                {
                    "codigo": "B-203",
                    "direccion": "Calle Los Pinos, Casa 203",
                    "estado": "DESOCUPADA",
                    "cantidad_vehiculos": 0,
                },
                {
                    "codigo": "B-204",
                    "direccion": "Calle Los Pinos, Casa 204",
                    "estado": "OCUPADA",
                    "cantidad_vehiculos": 2,
                },
                
                # Zona C - Casas
                {
                    "codigo": "C-301",
                    "direccion": "Avenida Principal, Casa 301",
                    "estado": "OCUPADA",
                    "cantidad_vehiculos": 1,
                },
                {
                    "codigo": "C-302",
                    "direccion": "Avenida Principal, Casa 302",
                    "estado": "OCUPADA",
                    "cantidad_vehiculos": 1,
                },
                {
                    "codigo": "C-401",
                    "direccion": "Avenida Principal, Casa 401",
                    "estado": "OCUPADA",
                    "cantidad_vehiculos": 1,
                },
                {
                    "codigo": "C-402",
                    "direccion": "Avenida Principal, Casa 402",
                    "estado": "OCUPADA",
                    "cantidad_vehiculos": 2,
                },
                {
                    "codigo": "C-501",
                    "direccion": "Avenida Principal, Casa 501",
                    "estado": "OCUPADA",
                    "cantidad_vehiculos": 1,
                },
                {
                    "codigo": "C-502",
                    "direccion": "Avenida Principal, Casa 502",
                    "estado": "OCUPADA",
                    "cantidad_vehiculos": 2,
                },
            ]
            
            # Crear las unidades habitacionales
            for unidad_data in unidades_data:
                unidad = UnidadHabitacional.objects.create(**unidad_data)
                print(f"✓ Unidad habitacional creada: {unidad.codigo} - {unidad.direccion} - {unidad.get_estado_display()}")
            
            return True
                
        except Exception as e:
            print(f"❌ Error al crear unidades habitacionales: {str(e)}")
            raise
    
    @classmethod
    def should_run(cls):
        """
        Verifica si el seeder debe ejecutarse.
        Se ejecutará si no hay unidades habitacionales en la base de datos.
        """
        try:
            from unidades.models import UnidadHabitacional
            return not UnidadHabitacional.objects.exists()
        except Exception:
            return True