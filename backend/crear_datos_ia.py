#!/usr/bin/env python
"""
Script para crear datos de prueba de IA
"""
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from ia_seguridad.models import Vehiculo, ConfiguracionIA
from residentes.models import Residente

def crear_datos_prueba():
    print("=== Creando datos de prueba para IA ===")
    
    # Crear configuración IA por defecto
    config, created = ConfiguracionIA.objects.get_or_create(
        defaults={
            'umbral_confianza_facial': 0.7,
            'umbral_confianza_ocr': 0.8,
            'activo_deteccion_anomalias': True
        }
    )
    print(f'✅ Configuración IA: {"creada" if created else "ya existía"}')
    
    # Obtener un residente de prueba
    residente = Residente.objects.first()
    if residente:
        # Crear vehículo de prueba
        vehiculo, created = Vehiculo.objects.get_or_create(
            placa='ABC123',
            defaults={
                'residente': residente,
                'marca': 'Toyota',
                'modelo': 'Corolla',
                'color': 'Blanco',
                'tipo': 'auto'
            }
        )
        print(f'✅ Vehículo de prueba: {"creado" if created else "ya existía"} - {vehiculo.placa}')
        
        # Crear más vehículos de prueba
        vehiculos_adicionales = [
            ('XYZ789', 'Honda', 'Civic', 'Azul', 'auto'),
            ('DEF456', 'Yamaha', 'FZ', 'Negro', 'moto'),
        ]
        
        for placa, marca, modelo, color, tipo in vehiculos_adicionales:
            v, created = Vehiculo.objects.get_or_create(
                placa=placa,
                defaults={
                    'residente': residente,
                    'marca': marca,
                    'modelo': modelo,
                    'color': color,
                    'tipo': tipo
                }
            )
            if created:
                print(f'✅ Vehículo adicional creado: {placa}')
    else:
        print('❌ No hay residentes disponibles para crear vehículos')
    
    print("\n=== Datos de prueba creados correctamente ===")
    print(f"Total vehículos: {Vehiculo.objects.count()}")
    print(f"Total configuraciones IA: {ConfiguracionIA.objects.count()}")

if __name__ == '__main__':
    crear_datos_prueba()