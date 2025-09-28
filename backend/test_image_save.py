#!/usr/bin/env python
"""
Script para probar el guardado de imágenes en el sistema IA Seguridad
"""
import os
import django
from django.conf import settings
from django.core.files.base import ContentFile
from datetime import datetime
from PIL import Image
from io import BytesIO
import base64

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from ia_seguridad.models import FotoResidente, Visitante, RegistroAcceso, Camara
from users.models import CustomUser
from residentes.models import Residente

def create_test_image(text="TEST", size=(200, 150)):
    """Crear una imagen de prueba simple"""
    img = Image.new('RGB', size, color='lightblue')
    
    # Convertir a bytes
    buffer = BytesIO()
    img.save(buffer, format='JPEG')
    buffer.seek(0)
    
    return ContentFile(buffer.getvalue(), name=f'test_image_{datetime.now().strftime("%Y%m%d_%H%M%S")}.jpg')

def test_save_foto_residente():
    """Probar guardado de foto de residente"""
    print("📸 Probando guardado de foto de residente...")
    try:
        # Buscar un residente existente
        residente = Residente.objects.filter(estado='activo').first()
        if not residente:
            print("❌ No se encontró ningún residente activo")
            return False
            
        # Crear imagen de prueba
        imagen = create_test_image(f"RESIDENTE {residente.nombre}")
        
        # Crear o actualizar foto
        foto, created = FotoResidente.objects.get_or_create(
            residente=residente,
            es_principal=True,
            defaults={
                'imagen': imagen,
                'activo': True
            }
        )
        
        if not created:
            # Si ya existe, actualizar la imagen
            foto.imagen = imagen
            foto.save()
            
        print(f"✅ Foto guardada: {foto.imagen.url}")
        print(f"   📁 Ruta física: {foto.imagen.path}")
        print(f"   📏 Tamaño archivo: {foto.imagen.size} bytes")
        
        return True
        
    except Exception as e:
        print(f"❌ Error al guardar foto: {e}")
        return False

def test_save_visitante():
    """Probar guardado de imagen de visitante"""
    print("\n👤 Probando guardado de imagen de visitante...")
    try:
        # Buscar un residente para asignar
        residente = Residente.objects.filter(estado='activo').first()
        
        # Crear imagen de prueba
        imagen = create_test_image("VISITANTE TEST")
        
        # Crear visitante
        visitante = Visitante.objects.create(
            nombre='Visitante Prueba',
            ci='12345678',
            foto_entrada=imagen,
            residente_visitado=residente,
            observaciones='Prueba de guardado de imagen'
        )
        
        print(f"✅ Visitante guardado: {visitante.nombre}")
        print(f"   📁 Ruta foto: {visitante.foto_entrada.url}")
        print(f"   📏 Tamaño archivo: {visitante.foto_entrada.size} bytes")
        
        return True
        
    except Exception as e:
        print(f"❌ Error al guardar visitante: {e}")
        return False

def test_save_registro_acceso():
    """Probar guardado de imagen en registro de acceso"""
    print("\n🔐 Probando guardado de imagen en registro de acceso...")
    try:
        # Buscar un residente
        residente = Residente.objects.filter(estado='activo').first()
        
        if not residente:
            print("❌ Faltan datos necesarios (residente)")
            return False
            
        # Crear imagen de prueba
        imagen = create_test_image(f"ACCESO {residente.nombre}")
        
        # Crear registro de acceso
        registro = RegistroAcceso.objects.create(
            tipo_acceso='entrada',
            tipo_persona='residente',
            residente=residente,
            foto_acceso=imagen,
            confianza_reconocimiento=88.5,
            camara_id='cam_principal',
        )
        
        print(f"✅ Registro guardado: {registro.tipo_acceso} - {registro.residente.nombre}")
        print(f"   📁 Ruta imagen: {registro.foto_acceso.url}")
        print(f"   📏 Tamaño archivo: {registro.foto_acceso.size} bytes")
        
        return True
        
    except Exception as e:
        print(f"❌ Error al guardar registro: {e}")
        return False

def test_media_directory():
    """Verificar que el directorio de media esté configurado correctamente"""
    print("\n📁 Verificando configuración de archivos media...")
    
    print(f"   MEDIA_URL: {settings.MEDIA_URL}")
    print(f"   MEDIA_ROOT: {settings.MEDIA_ROOT}")
    
    # Verificar si el directorio existe
    if os.path.exists(settings.MEDIA_ROOT):
        print("✅ Directorio MEDIA_ROOT existe")
        
        # Verificar permisos de escritura
        test_file = os.path.join(settings.MEDIA_ROOT, 'test_write.txt')
        try:
            with open(test_file, 'w') as f:
                f.write('test')
            os.remove(test_file)
            print("✅ Permisos de escritura OK")
            return True
        except Exception as e:
            print(f"❌ Sin permisos de escritura: {e}")
            return False
    else:
        print("❌ Directorio MEDIA_ROOT no existe")
        return False

def main():
    print("🧪 PRUEBA DE GUARDADO DE IMÁGENES - IA SEGURIDAD")
    print("=" * 50)
    
    # Verificar configuración
    media_ok = test_media_directory()
    
    if not media_ok:
        print("\n❌ Configuración de media incorrecta. Abortando pruebas.")
        return
    
    # Ejecutar pruebas
    tests = [
        test_save_foto_residente,
        test_save_visitante,
        test_save_registro_acceso
    ]
    
    results = []
    for test in tests:
        result = test()
        results.append(result)
    
    # Resumen
    print("\n📊 RESUMEN DE PRUEBAS:")
    print("=" * 30)
    passed = sum(results)
    total = len(results)
    
    print(f"✅ Exitosas: {passed}")
    print(f"❌ Fallidas: {total - passed}")
    print(f"📈 Porcentaje éxito: {(passed/total)*100:.1f}%")
    
    if passed == total:
        print("\n🎉 ¡Todas las pruebas pasaron! El sistema de guardado de imágenes funciona correctamente.")
    else:
        print(f"\n⚠️  {total - passed} pruebas fallaron. Revisar configuración.")

if __name__ == "__main__":
    main()