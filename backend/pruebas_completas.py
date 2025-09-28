#!/usr/bin/env python
"""
Script completo de pruebas para Smart Condominium
Crea datos de prueba y verifica todas las funcionalidades
"""
import os
import sys
import django
from datetime import datetime, timedelta, date
from decimal import Decimal

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

# Imports de modelos
from residentes.models import Residente
from users.models import CustomUser, Rol
from personal.models import Personal

# Nuevas funcionalidades
from ia_seguridad.models import (
    Vehiculo, FotoResidente, AlertaSeguridad, ConfiguracionIA,
    RegistroAcceso, Visitante
)
from finanzas.models import (
    TipoCuota, Cuota, Pago, ConfiguracionFinanzas, EstadisticaFinanciera
)
from reservas.models import (
    AreaComun, Reserva, PagoReserva, EstadisticaReservas
)
from mantenimiento.models import (
    CategoriaMantenimiento, TareaMantenimiento, Material,
    IncidenteMantenimiento, EstadisticaMantenimiento
)

def crear_datos_finanzas():
    """Crear datos de prueba para módulo de finanzas"""
    print("\n🏦 === CREANDO DATOS DE FINANZAS ===")
    
    # Configuración de finanzas
    config_finanzas, created = ConfiguracionFinanzas.objects.get_or_create(
        defaults={
            'aplica_multas_automaticas': True,
            'dias_gracia': 5,
            'porcentaje_multa': Decimal('5.00'),
            'dias_antes_vencimiento': 7,
            'descuento_pago_anticipado': Decimal('2.00')
        }
    )
    print(f"✅ Configuración finanzas: {'creada' if created else 'existía'}")
    
    # Tipos de cuotas
    tipos_cuota = [
        ('Cuota Mensual', 'Cuota mensual básica del condominio', Decimal('150.00')),
        ('Cuota Extraordinaria', 'Para gastos especiales o emergencias', Decimal('200.00')),
        ('Gastos Comunes', 'Gastos de mantenimiento común', Decimal('100.00')),
        ('Seguridad', 'Servicio de seguridad 24/7', Decimal('80.00')),
    ]
    
    for nombre, descripcion, monto in tipos_cuota:
        tipo, created = TipoCuota.objects.get_or_create(
            nombre=nombre,
            defaults={
                'descripcion': descripcion,
                'monto_base': monto,
                'es_fija': True
            }
        )
        if created:
            print(f"✅ Tipo cuota creado: {nombre}")
    
    # Crear cuotas para residentes
    residentes = Residente.objects.all()[:3]  # Primeros 3 residentes
    tipo_cuota_mensual = TipoCuota.objects.first()
    
    if tipo_cuota_mensual:
        for residente in residentes:
            # Cuota del mes actual
            cuota, created = Cuota.objects.get_or_create(
                residente=residente,
                tipo_cuota=tipo_cuota_mensual,
                mes_periodo=date.today().replace(day=1),
                defaults={
                    'monto': tipo_cuota_mensual.monto_base,
                    'fecha_vencimiento': date.today() + timedelta(days=15),
                    'estado': 'pendiente'
                }
            )
            if created:
                print(f"✅ Cuota creada para: {residente.nombre}")
    
    print(f"Total tipos de cuota: {TipoCuota.objects.count()}")
    print(f"Total cuotas: {Cuota.objects.count()}")

def crear_datos_reservas():
    """Crear datos de prueba para módulo de reservas"""
    print("\n📅 === CREANDO DATOS DE RESERVAS ===")
    
    # Áreas comunes
    areas_comunes = [
        {
            'nombre': 'Salón de Eventos',
            'descripcion': 'Salón principal para fiestas y reuniones',
            'capacidad_maxima': 50,
            'precio_por_hora': Decimal('25.00'),
            'requiere_pago': True,
            'tiempo_minimo_reserva': 2,
            'tiempo_maximo_reserva': 8,
        },
        {
            'nombre': 'Piscina',
            'descripcion': 'Piscina comunitaria con área recreativa',
            'capacidad_maxima': 20,
            'precio_por_hora': Decimal('15.00'),
            'requiere_pago': True,
            'hora_apertura': '09:00',
            'hora_cierre': '20:00',
        },
        {
            'nombre': 'Cancha de Tenis',
            'descripcion': 'Cancha profesional de tenis',
            'capacidad_maxima': 4,
            'precio_por_hora': Decimal('20.00'),
            'requiere_pago': True,
        },
        {
            'nombre': 'Sala de Reuniones',
            'descripcion': 'Para reuniones de propietarios o trabajo',
            'capacidad_maxima': 15,
            'precio_por_hora': Decimal('10.00'),
            'requiere_pago': False,
        }
    ]
    
    for data in areas_comunes:
        area, created = AreaComun.objects.get_or_create(
            nombre=data['nombre'],
            defaults=data
        )
        if created:
            print(f"✅ Área común creada: {data['nombre']}")
    
    # Crear algunas reservas de prueba
    area_salon = AreaComun.objects.filter(nombre='Salón de Eventos').first()
    residente = Residente.objects.first()
    
    if area_salon and residente:
        fecha_reserva = date.today() + timedelta(days=7)
        reserva, created = Reserva.objects.get_or_create(
            area_comun=area_salon,
            residente=residente,
            fecha_reserva=fecha_reserva,
            defaults={
                'hora_inicio': '18:00',
                'hora_fin': '22:00',
                'numero_personas': 25,
                'motivo': 'Cumpleaños familiar',
                'estado': 'confirmada',
                'costo_total': Decimal('100.00')
            }
        )
        if created:
            print(f"✅ Reserva de prueba creada para: {residente.nombre}")
    
    print(f"Total áreas comunes: {AreaComun.objects.count()}")
    print(f"Total reservas: {Reserva.objects.count()}")

def crear_datos_mantenimiento():
    """Crear datos de prueba para módulo de mantenimiento"""
    print("\n🔧 === CREANDO DATOS DE MANTENIMIENTO ===")
    
    # Categorías de mantenimiento
    categorias = [
        ('Plomería', 'Mantenimiento de sistemas de agua y desagüe', '#3498db'),
        ('Electricidad', 'Mantenimiento eléctrico y sistemas', '#f39c12'),
        ('Jardinería', 'Cuidado de áreas verdes', '#27ae60'),
        ('Limpieza', 'Servicios de limpieza general', '#9b59b6'),
        ('Seguridad', 'Mantenimiento de sistemas de seguridad', '#e74c3c'),
    ]
    
    for nombre, descripcion, color in categorias:
        categoria, created = CategoriaMantenimiento.objects.get_or_create(
            nombre=nombre,
            defaults={
                'descripcion': descripcion,
                'color': color
            }
        )
        if created:
            print(f"✅ Categoría mantenimiento creada: {nombre}")
    
    # Materiales básicos
    materiales = [
        ('Tornillo Phillips #8', 'Tornillos para uso general', 'unidad', Decimal('0.50')),
        ('Cable eléctrico 12 AWG', 'Cable para instalaciones eléctricas', 'metro', Decimal('2.50')),
        ('Pintura blanca mate', 'Pintura para paredes interiores', 'galón', Decimal('35.00')),
        ('Tubo PVC 4"', 'Tubería para desagües', 'metro', Decimal('8.00')),
    ]
    
    for nombre, descripcion, unidad, precio in materiales:
        material, created = Material.objects.get_or_create(
            nombre=nombre,
            defaults={
                'descripcion': descripcion,
                'unidad_medida': unidad,
                'precio_unitario': precio,
                'stock_actual': 100,
                'stock_minimo': 10
            }
        )
        if created:
            print(f"✅ Material creado: {nombre}")
    
    # Crear tarea de mantenimiento
    categoria_plomeria = CategoriaMantenimiento.objects.filter(nombre='Plomería').first()
    personal = Personal.objects.first()
    
    if categoria_plomeria:
        tarea, created = TareaMantenimiento.objects.get_or_create(
            titulo='Revisión de grifos en área común',
            defaults={
                'descripcion': 'Revisar y reparar grifos con fugas en el área de piscina',
                'categoria': categoria_plomeria,
                'tipo': 'correctivo',
                'prioridad': 'media',
                'ubicacion': 'Área de piscina',
                'fecha_programada': datetime.now() + timedelta(days=2),
                'tiempo_estimado': Decimal('2.5'),
                'costo_estimado': Decimal('50.00'),
                'asignado_a': personal
            }
        )
        if created:
            print(f"✅ Tarea de mantenimiento creada: Revisión de grifos")
    
    print(f"Total categorías: {CategoriaMantenimiento.objects.count()}")
    print(f"Total materiales: {Material.objects.count()}")
    print(f"Total tareas: {TareaMantenimiento.objects.count()}")

def crear_datos_ia_adicionales():
    """Crear más datos de IA y seguridad"""
    print("\n🤖 === CREANDO DATOS ADICIONALES DE IA ===")
    
    # Crear alertas de seguridad simuladas
    alertas = [
        {
            'tipo_alerta': 'acceso_no_autorizado',
            'nivel': 'alto',
            'descripcion': 'Intento de acceso con credenciales incorrectas',
            'camara_id': 'cam_entrada_01'
        },
        {
            'tipo_alerta': 'vehiculo_no_autorizado',
            'nivel': 'medio',
            'descripcion': 'Vehículo con placa no registrada detectado',
            'camara_id': 'cam_parking_01'
        },
        {
            'tipo_alerta': 'perro_suelto',
            'nivel': 'bajo',
            'descripcion': 'Perro suelto detectado en área común',
            'camara_id': 'cam_jardin_01'
        }
    ]
    
    for alerta_data in alertas:
        alerta, created = AlertaSeguridad.objects.get_or_create(
            tipo_alerta=alerta_data['tipo_alerta'],
            camara_id=alerta_data['camara_id'],
            defaults=alerta_data
        )
        if created:
            print(f"✅ Alerta creada: {alerta_data['tipo_alerta']}")
    
    # Crear registros de acceso
    residente = Residente.objects.first()
    if residente:
        registro, created = RegistroAcceso.objects.get_or_create(
            residente=residente,
            fecha_hora__date=date.today(),
            defaults={
                'tipo_acceso': 'entrada',
                'tipo_persona': 'residente',
                'confianza_reconocimiento': 95.5,
                'camara_id': 'cam_entrada_01'
            }
        )
        if created:
            print(f"✅ Registro de acceso creado para: {residente.nombre}")
    
    print(f"Total alertas: {AlertaSeguridad.objects.count()}")
    print(f"Total registros acceso: {RegistroAcceso.objects.count()}")

def verificar_datos_creados():
    """Verificar que todos los datos se crearon correctamente"""
    print("\n📊 === RESUMEN DE DATOS CREADOS ===")
    
    # Datos base
    print(f"👥 Residentes: {Residente.objects.count()}")
    print(f"👨‍💼 Personal: {Personal.objects.count()}")
    print(f"🔐 Usuarios: {CustomUser.objects.count()}")
    
    # IA y Seguridad
    print(f"🚗 Vehículos: {Vehiculo.objects.count()}")
    print(f"🚨 Alertas seguridad: {AlertaSeguridad.objects.count()}")
    print(f"📝 Registros acceso: {RegistroAcceso.objects.count()}")
    
    # Finanzas
    print(f"💰 Tipos de cuota: {TipoCuota.objects.count()}")
    print(f"🧾 Cuotas: {Cuota.objects.count()}")
    print(f"💳 Pagos: {Pago.objects.count()}")
    
    # Reservas
    print(f"🏢 Áreas comunes: {AreaComun.objects.count()}")
    print(f"📅 Reservas: {Reserva.objects.count()}")
    
    # Mantenimiento
    print(f"🔧 Categorías mantenimiento: {CategoriaMantenimiento.objects.count()}")
    print(f"📦 Materiales: {Material.objects.count()}")
    print(f"⚙️ Tareas mantenimiento: {TareaMantenimiento.objects.count()}")

def main():
    """Función principal de pruebas"""
    print("🚀 === INICIANDO PRUEBAS COMPLETAS SMART CONDOMINIUM ===")
    
    try:
        # Verificar datos existentes
        if Residente.objects.count() == 0:
            print("❌ No hay residentes. Ejecutar seeders primero.")
            return
        
        # Crear datos de prueba para cada módulo
        crear_datos_finanzas()
        crear_datos_reservas()
        crear_datos_mantenimiento()
        crear_datos_ia_adicionales()
        
        # Verificar datos creados
        verificar_datos_creados()
        
        print("\n🎉 === PRUEBAS COMPLETADAS EXITOSAMENTE ===")
        print("✅ Sistema Smart Condominium listo para demostración")
        
    except Exception as e:
        print(f"❌ Error durante las pruebas: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()