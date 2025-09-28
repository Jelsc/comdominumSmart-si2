#!/usr/bin/env python
"""
Script para crear datos de prueba del módulo IA Seguridad
Ejecutar dentro del contenedor de Django o con Django configurado
"""

import os
import sys
import django
from datetime import datetime, timedelta
from django.utils import timezone

# Configurar Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from django.contrib.auth import get_user_model
from residentes.models import Residente
from ia_seguridad.models import (
    Camara, FotoResidente, Vehiculo, Visitante, 
    RegistroAcceso, AlertaSeguridad, ConfiguracionIA
)

User = get_user_model()

def crear_datos_ia_seguridad():
    print("🚀 Creando datos de prueba para IA Seguridad...")
    
    # 1. Crear cámaras de prueba
    print("📹 Creando cámaras...")
    camaras = [
        {
            'nombre': 'Cámara Principal Entrada',
            'ubicacion': 'Entrada Principal',
            'tipo': 'entrada',
            'estado': 'activa',
            'ip': '192.168.1.100',
            'puerto': 554,
            'configuracion': {
                'resolution': '1920x1080',
                'fps': 30,
                'encoding': 'h264'
            }
        },
        {
            'nombre': 'Cámara Estacionamiento',
            'ubicacion': 'Estacionamiento Nivel 1',
            'tipo': 'estacionamiento',
            'estado': 'activa',
            'ip': '192.168.1.101',
            'puerto': 554,
            'configuracion': {
                'resolution': '1920x1080',
                'fps': 25,
                'encoding': 'h264'
            }
        },
        {
            'nombre': 'Cámara Entrada Peatonal',
            'ubicacion': 'Entrada Peatonal Lateral',
            'tipo': 'entrada',
            'estado': 'activa',
            'ip': '192.168.1.102',
            'puerto': 554,
            'configuracion': {
                'resolution': '1280x720',
                'fps': 30,
                'encoding': 'h264'
            }
        }
    ]
    
    for cam_data in camaras:
        camara, created = Camara.objects.get_or_create(
            nombre=cam_data['nombre'],
            defaults=cam_data
        )
        if created:
            print(f"✅ Cámara creada: {camara.nombre}")
        else:
            print(f"ℹ️  Cámara ya existe: {camara.nombre}")
    
    # 2. Crear vehículos de prueba (necesito residentes primero)
    print("🚗 Creando vehículos...")
    residentes = list(Residente.objects.all()[:3])  # Primeros 3 residentes
    
    if not residentes:
        print("⚠️  No hay residentes disponibles, saltando creación de vehículos")
    else:
        vehiculos = [
            {
                'residente': residentes[0],
                'placa': '1852PHD',
                'marca': 'Toyota',
                'modelo': 'Corolla',
                'color': 'azul',
                'tipo': 'auto',
                'activo': True,
            },
            {
                'residente': residentes[1] if len(residentes) > 1 else residentes[0],
                'placa': 'ABC123X',
                'marca': 'Honda',
                'modelo': 'CRV',
                'color': 'blanco',
                'tipo': 'camioneta',
                'activo': True,
            },
            {
                'residente': residentes[2] if len(residentes) > 2 else residentes[0],
                'placa': '5679DEF',
                'marca': 'Nissan',
                'modelo': 'Frontier',
                'color': 'negro',
                'tipo': 'camioneta',
                'activo': False,
            }
        ]
        
        for veh_data in vehiculos:
            vehiculo, created = Vehiculo.objects.get_or_create(
                placa=veh_data['placa'],
                defaults=veh_data
            )
            if created:
                print(f"✅ Vehículo creado: {vehiculo.placa} ({vehiculo.marca} {vehiculo.modelo})")
            else:
                print(f"ℹ️  Vehículo ya existe: {vehiculo.placa}")
                
        # Crear algunos datos adicionales en tabla separada para vehículos no autorizados
        # (esto podría ser un modelo separado en el futuro)
        print("📝 Nota: Para vehículos no autorizados, considerar crear modelo VehiculoDetectado separado")
    
    # 3. Crear fotos de residentes (simuladas)
    print("📸 Creando fotos de residentes...")
    
    for i, residente in enumerate(residentes):
        foto, created = FotoResidente.objects.get_or_create(
            residente=residente,
            defaults={
                'imagen': f'fotos_residentes/foto_{residente.id}_profile.jpg',
                'es_principal': True,
                'encoding_facial': f'fake_encoding_{residente.id}_' + ('x' * 100),  # Encoding simulado
                'activo': True,
            }
        )
        if created:
            print(f"✅ Foto creada para: {residente.nombre}")
        else:
            print(f"ℹ️  Foto ya existe para: {residente.nombre}")
    
    # 4. Crear visitantes detectados
    print("👥 Creando visitantes detectados...")
    camaras_list = list(Camara.objects.all())
    visitantes = [
        {
            'nombre': 'Juan Carlos Mendez',
            'ci': '1234567',
            'foto_entrada': 'visitantes/visitante_001.jpg',
            'fecha_entrada': timezone.now() - timedelta(hours=2),
            'encoding_facial': 'fake_encoding_vis_001_' + ('x' * 100),
            'residente_visitado': residentes[0] if residentes else None,
            'observaciones': 'Visitante identificado por reconocimiento facial',
        },
        {
            'nombre': 'María Elena Vargas',
            'ci': '2345678',
            'foto_entrada': 'visitantes/visitante_002.jpg', 
            'fecha_entrada': timezone.now() - timedelta(hours=4),
            'encoding_facial': 'fake_encoding_vis_002_' + ('x' * 100),
            'residente_visitado': residentes[1] if len(residentes) > 1 else None,
            'observaciones': 'Visitante autorizado previamente',
        },
        {
            'nombre': '',  # Visitante no identificado
            'ci': '',
            'foto_entrada': 'visitantes/visitante_003.jpg',
            'fecha_entrada': timezone.now() - timedelta(hours=6),
            'encoding_facial': 'fake_encoding_vis_003_' + ('x' * 100),
            'observaciones': 'Persona no identificada - requiere procesamiento',
        }
    ]
    
    for vis_data in visitantes:
        visitante = Visitante.objects.create(**vis_data)
        nombre = visitante.nombre or 'Sin identificar'
        print(f"✅ Visitante creado: {nombre} - {visitante.fecha_entrada.strftime('%H:%M')}")
    
    # 5. Crear registros de acceso
    print("🔐 Creando registros de acceso...")
    registros = [
        {
            'tipo_acceso': 'entrada',
            'tipo_persona': 'residente',
            'residente': residentes[0] if residentes else None,
            'foto_acceso': 'accesos/acceso_001.jpg',
            'confianza_reconocimiento': 95.0,
            'camara_id': 'cam_001',
            'placa_vehiculo': '1852PHD',
        },
        {
            'tipo_acceso': 'salida',
            'tipo_persona': 'residente',
            'residente': residentes[1] if len(residentes) > 1 else residentes[0] if residentes else None,
            'foto_acceso': 'accesos/acceso_002.jpg',
            'confianza_reconocimiento': 98.0,
            'camara_id': 'cam_001',
            'placa_vehiculo': 'ABC123X',
        },
        {
            'tipo_acceso': 'entrada',
            'tipo_persona': 'desconocido',
            'foto_acceso': 'accesos/acceso_003.jpg',
            'confianza_reconocimiento': 45.0,
            'camara_id': 'cam_002',
            'placa_vehiculo': '',
        }
    ]
    
    for reg_data in registros:
        registro = RegistroAcceso.objects.create(**reg_data)
        confianza_ok = registro.confianza_reconocimiento >= 70
        resultado = '✅' if confianza_ok else '❌'
        tipo_persona = registro.tipo_persona
        print(f"{resultado} Registro creado: {registro.tipo_acceso} - {tipo_persona} ({registro.confianza_reconocimiento}%)")
    
    # 6. Crear alertas de seguridad
    print("🚨 Creando alertas de seguridad...")
    alertas = [
        {
            'tipo_alerta': 'acceso_no_autorizado',
            'descripcion': 'Intento de acceso de persona no autorizada',
            'nivel': 'alto',
            'foto_evidencia': 'alertas/alerta_001.jpg',
            'camara_id': 'cam_001',
            'fecha_hora': timezone.now() - timedelta(minutes=15),
            'resuelto': False,
        },
        {
            'tipo_alerta': 'comportamiento_sospechoso',
            'descripcion': 'Persona merodeando en área de estacionamiento',
            'nivel': 'medio',
            'foto_evidencia': 'alertas/alerta_002.jpg',
            'camara_id': 'cam_002',
            'fecha_hora': timezone.now() - timedelta(hours=2),
            'resuelto': True,
            'fecha_resolucion': timezone.now() - timedelta(hours=1),
        },
        {
            'tipo_alerta': 'vehiculo_no_autorizado',
            'descripcion': 'Vehículo con placa no autorizada detectado',
            'nivel': 'medio',
            'foto_evidencia': 'alertas/alerta_003.jpg',
            'camara_id': 'cam_003',
            'fecha_hora': timezone.now() - timedelta(hours=4),
            'resuelto': True,
            'fecha_resolucion': timezone.now() - timedelta(hours=3),
        }
    ]
    
    for alert_data in alertas:
        alerta = AlertaSeguridad.objects.create(**alert_data)
        nivel_emoji = {'bajo': '🟢', 'medio': '🟡', 'alto': '🔴', 'critico': '🟣'}[alerta.nivel]
        estado = '✅ Resuelto' if alerta.resuelto else '⏳ Pendiente'
        print(f"{nivel_emoji} Alerta creada: {alerta.tipo_alerta} - {estado}")
    
    # 7. Crear configuración de IA
    print("⚙️  Creando configuración de IA...")
    config, created = ConfiguracionIA.objects.get_or_create(
        id=1,  # Solo una configuración principal
        defaults={
            'umbral_confianza_facial': 0.85,
            'umbral_confianza_ocr': 0.80,
            'activo_deteccion_anomalias': True,
            'sensibilidad_anomalias': 7,
            'horario_inicio': '06:00',
            'horario_fin': '22:00',
            'enviar_notificaciones_push': True,
            'email_alertas': 'admin@condominium.com'
        }
    )
    if created:
        print("✅ Configuración de IA creada")
    else:
        print("ℹ️  Configuración de IA ya existe")
    
    print("\n🎉 ¡Datos de IA Seguridad creados exitosamente!")
    print("\n📊 Resumen:")
    print(f"   • Cámaras: {Camara.objects.count()}")
    print(f"   • Vehículos: {Vehiculo.objects.count()}")
    print(f"   • Fotos de residentes: {FotoResidente.objects.count()}")
    print(f"   • Visitantes: {Visitante.objects.count()}")
    print(f"   • Registros de acceso: {RegistroAcceso.objects.count()}")
    print(f"   • Alertas: {AlertaSeguridad.objects.count()}")
    
    print("\n🌐 URLs para probar:")
    print("   • http://localhost:8000/api/ia-seguridad/camaras/")
    print("   • http://localhost:8000/api/ia-seguridad/vehiculos/")
    print("   • http://localhost:8000/api/ia-seguridad/fotos-residentes/")
    print("   • http://localhost:8000/api/ia-seguridad/visitantes/")
    print("   • http://localhost:8000/api/ia-seguridad/registros-acceso/")
    print("   • http://localhost:8000/api/ia-seguridad/alertas/")

if __name__ == '__main__':
    try:
        crear_datos_ia_seguridad()
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)