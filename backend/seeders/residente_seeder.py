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
            from unidades.models import UnidadHabitacional
            
            # Verificar si existen unidades habitacionales
            if not UnidadHabitacional.objects.exists():
                print("❌ No hay unidades habitacionales disponibles. Ejecuta primero el UnidadSeeder.")
                return False
                
            # Este código ya no es necesario ya que lo hemos movido más abajo
            # al inicializar el mapeo de códigos de unidad a objetos de unidad
            
            # Obtener todas las unidades habitacionales disponibles
            unidades_disponibles = {unidad.codigo: unidad 
                                  for unidad in UnidadHabitacional.objects.all()}
                
            if not unidades_disponibles:
                print("❌ No se encontraron unidades habitacionales con códigos.")
                return False
                
            print(f"✓ Se encontraron {len(unidades_disponibles)} unidades habitacionales disponibles.")
            
            # Asignación de datos de residentes - con vinculación a códigos de unidades
            residentes_info = [
                # Cada tupla contiene (datos del residente, código de unidad)
                ({
                    "nombre": "María",
                    "apellido": "García",
                    "ci": "12345678",
                    "email": "maria.garcia@example.com",
                    "telefono": "77712345",
                    "tipo": "propietario",
                    "fecha_ingreso": date(2020, 1, 15),
                    "estado": "activo"
                }, "A-101"),
                ({
                    "nombre": "Carlos",
                    "apellido": "Rodríguez",
                    "ci": "23456789",
                    "email": "carlos.rodriguez@example.com",
                    "telefono": "77723456",
                    "tipo": "propietario",
                    "fecha_ingreso": date(2019, 6, 10),
                    "estado": "activo"
                }, "A-102"),
                ({
                    "nombre": "Ana",
                    "apellido": "Martínez",
                    "ci": "34567890",
                    "email": "ana.martinez@example.com",
                    "telefono": "77734567",
                    "tipo": "inquilino",
                    "fecha_ingreso": date(2021, 3, 1),
                    "estado": "activo"
                }, "A-201"),
                ({
                    "nombre": "Luis",
                    "apellido": "Fernández",
                    "ci": "45678901",
                    "email": "luis.fernandez@example.com",
                    "telefono": "77745678",
                    "tipo": "propietario",
                    "fecha_ingreso": date(2018, 9, 20),
                    "estado": "inactivo"
                }, "A-202"),
                ({
                    "nombre": "Laura",
                    "apellido": "Sánchez",
                    "ci": "56789012",
                    "email": "laura.sanchez@example.com",
                    "telefono": "77756789",
                    "tipo": "inquilino",
                    "fecha_ingreso": date(2022, 1, 5),
                    "estado": "en_proceso"
                }, "C-301"),
                ({
                    "nombre": "Roberto",
                    "apellido": "López",
                    "ci": "67890123",
                    "email": "roberto.lopez@example.com",
                    "telefono": "77767890",
                    "tipo": "propietario",
                    "fecha_ingreso": date(2020, 11, 12),
                    "estado": "suspendido"
                }, "C-302"),
                ({
                    "nombre": "Carmen",
                    "apellido": "González",
                    "ci": "78901234",
                    "email": "carmen.gonzalez@example.com",
                    "telefono": "77778901",
                    "tipo": "propietario",
                    "fecha_ingreso": date(2019, 4, 8),
                    "estado": "activo"
                }, "C-401"),
                ({
                    "nombre": "Pedro",
                    "apellido": "Hernández",
                    "ci": "89012345",
                    "email": "pedro.hernandez@example.com",
                    "telefono": "77789012",
                    "tipo": "inquilino",
                    "fecha_ingreso": date(2021, 7, 15),
                    "estado": "activo"
                }, "C-402"),
                ({
                    "nombre": "Isabel",
                    "apellido": "Díaz",
                    "ci": "90123456",
                    "email": "isabel.diaz@example.com",
                    "telefono": "77790123",
                    "tipo": "propietario",
                    "fecha_ingreso": date(2020, 2, 28),
                    "estado": "activo"
                }, "C-501"),
                ({
                    "nombre": "Francisco",
                    "apellido": "Ruiz",
                    "ci": "01234567",
                    "email": "francisco.ruiz@example.com",
                    "telefono": "77701234",
                    "tipo": "inquilino",
                    "fecha_ingreso": date(2022, 5, 10),
                    "estado": "en_proceso"
                }, "C-502")
            ]
            
            creados = 0
            actualizados = 0
            sin_unidad = 0
            
            # Procesar cada residente con su código de unidad
            for residente_data, codigo_unidad in residentes_info:
                # Buscar la unidad correspondiente por su código
                unidad = unidades_disponibles.get(codigo_unidad)
                
                # Si encontramos la unidad, asignamos su código
                if codigo_unidad in unidades_disponibles:
                    # Asignar el código de unidad directamente
                    residente_data["unidad_habitacional"] = codigo_unidad
                else:
                    sin_unidad += 1
                    print(f"⚠️ No se encontró la unidad con código: {codigo_unidad}")
                
                # Crear o actualizar el residente
                residente, created = Residente.objects.get_or_create(
                    ci=residente_data["ci"],
                    defaults=residente_data
                )
                
                # Si ya existía pero no tenía unidad asignada, actualizamos
                if not created and codigo_unidad in unidades_disponibles and not residente.unidad_habitacional:
                    residente.unidad_habitacional = codigo_unidad
                    residente.save(update_fields=['unidad_habitacional'])
                    actualizados += 1
                    print(f"↻ Residente actualizado: {residente.nombre} {residente.apellido} - Unidad {codigo_unidad}")
                elif created:
                    creados += 1
                    unidad_info = codigo_unidad if codigo_unidad in unidades_disponibles else "No asignada"
                    print(f"✓ Residente creado: {residente.nombre} {residente.apellido} - Unidad {unidad_info}")
                else:
                    print(f"- Residente ya existe: {residente.nombre} {residente.apellido}")
            
            print(f"\nResumen: {creados} residentes creados, {actualizados} actualizados, {sin_unidad} sin unidad encontrada")
            return creados > 0 or actualizados > 0
                    
        except ImportError as e:
            print(f"❌ Error de importación: {str(e)}")
            print("❌ Verifica que existen los modelos Residente y UnidadHabitacional.")
            return False
        except Exception as e:
            print(f"❌ Error al crear residentes: {str(e)}")
            return False
    
    @classmethod
    def should_run(cls):
        """
        El seeder de residentes debe ejecutarse si:
        1. No existen registros de residentes
        2. Existen unidades habitacionales disponibles
        """
        try:
            from residentes.models import Residente
            from unidades.models import UnidadHabitacional
            
            hay_residentes = Residente.objects.exists()
            hay_unidades = UnidadHabitacional.objects.exists()
            
            # Solo ejecutar si no hay residentes pero sí hay unidades
            if not hay_residentes and hay_unidades:
                return True
            elif not hay_unidades:
                print("⚠️ No hay unidades habitacionales. Ejecuta primero el UnidadSeeder.")
                return False
            else:
                return False
        except ImportError as e:
            print(f"❌ Error de importación en should_run: {str(e)}")
            return False
