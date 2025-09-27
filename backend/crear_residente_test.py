#!/usr/bin/env python
"""
Script para crear una cuenta de residente de prueba para testing de la app móvil
"""

import os
import sys
import django
from datetime import date

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import CustomUser, Rol
from residentes.models import Residente


def crear_residente_prueba():
    """Crear un residente de prueba para testing de la app móvil"""
    
    try:
        print("🏠 Creando cuenta de residente de prueba...")
        
        # 1. Crear o obtener rol de residente
        rol_residente, created = Rol.objects.get_or_create(
            nombre='residente',
            defaults={
                'descripcion': 'Rol para residentes del condominio',
                'es_administrativo': False,
                'permisos': ['acceder_app_movil', 'ver_notificaciones', 'gestionar_perfil']
            }
        )
        
        if created:
            print("✅ Rol de residente creado")
        else:
            print("✅ Rol de residente ya existe")
        
        # 2. Crear usuario de prueba
        username = 'residente_test'
        email = 'residente.test@condominio.com'
        password = 'test123456'
        
        # Eliminar usuario existente si hay conflicto
        CustomUser.objects.filter(username=username).delete()
        CustomUser.objects.filter(email=email).delete()
        Residente.objects.filter(email=email).delete()
        
        usuario = CustomUser.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name='Juan Carlos',
            last_name='Pérez González',
            telefono='70123456',
            ci='12345678',
            rol=rol_residente,
            is_active=True
        )
        
        print(f"✅ Usuario creado: {usuario.username}")
        
        # 3. Crear perfil de residente
        residente = Residente.objects.create(
            nombre='Juan Carlos',
            apellido='Pérez González',
            ci='12345678',
            email=email,
            telefono='70123456',
            unidad_habitacional='A-15',
            tipo='propietario',
            fecha_ingreso=date.today(),
            estado='activo',
            usuario=usuario
        )
        
        print(f"✅ Residente creado: {residente}")
        
        # 4. Mostrar información de la cuenta creada
        print("\n" + "="*50)
        print("🎉 CUENTA DE RESIDENTE DE PRUEBA CREADA")
        print("="*50)
        print(f"📱 Para usar en la app móvil:")
        print(f"   Username/Email: {email}")
        print(f"   Password: {password}")
        print(f"   Nombre: {residente.get_full_name()}")
        print(f"   Casa: {residente.unidad_habitacional}")
        print(f"   Tipo: {residente.tipo}")
        print(f"   Estado: {residente.estado}")
        print("="*50)
        
        return True
        
    except Exception as e:
        print(f"❌ Error al crear residente de prueba: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Función principal"""
    print("🚀 Iniciando creación de residente de prueba...\n")
    
    if crear_residente_prueba():
        print("\n✅ Proceso completado exitosamente!")
        print("🏠 Ya puedes probar la app móvil con las credenciales mostradas")
    else:
        print("\n❌ Error en el proceso")
        sys.exit(1)


if __name__ == '__main__':
    main()