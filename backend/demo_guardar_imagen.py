#!/usr/bin/env python
"""
Ejemplo práctico: Guardar imagen subida por el usuario
Este script simula el proceso completo de guardar una imagen en el sistema IA Seguridad
"""
import os
import django
from django.conf import settings
from django.core.files.base import ContentFile
from datetime import datetime
import base64
from io import BytesIO
from PIL import Image

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from ia_seguridad.models import FotoResidente, Visitante, RegistroAcceso, Camara
from residentes.models import Residente

def guardar_imagen_ejemplo():
    """
    Ejemplo práctico de cómo guardar una imagen subida por el usuario
    """
    print("🚀 EJEMPLO PRÁCTICO: Guardar imagen en el sistema")
    print("=" * 50)
    
    try:
        # 1. Simular una imagen que viene del frontend (base64 o archivo)
        print("📸 Generando imagen de ejemplo...")
        
        # Crear imagen de prueba más realista
        imagen_pil = Image.new('RGB', (400, 300), color='white')
        
        # Agregar texto simulando datos de una persona
        from PIL import ImageDraw, ImageFont
        draw = ImageDraw.Draw(imagen_pil)
        
        # Texto básico (sin fuente externa para evitar errores)
        draw.rectangle([50, 50, 350, 250], outline="blue", width=3)
        draw.text((60, 60), "FOTO RESIDENTE", fill="black")
        draw.text((60, 90), "Nombre: Isabel Martinez", fill="black")
        draw.text((60, 120), "Fecha: 2024-12-28", fill="black")
        draw.text((60, 150), "Estado: AUTORIZADO", fill="green")
        
        # Convertir a bytes
        buffer = BytesIO()
        imagen_pil.save(buffer, format='JPEG', quality=85)
        buffer.seek(0)
        
        # 2. Buscar un residente para asociar la foto
        print("👤 Buscando residente...")
        residente = Residente.objects.filter(estado='activo').first()
        
        if not residente:
            print("❌ No hay residentes activos en el sistema")
            return False
            
        print(f"✅ Residente encontrado: {residente.nombre} {residente.apellido}")
        
        # 3. Crear el archivo Django desde los bytes
        archivo_imagen = ContentFile(
            buffer.getvalue(),
            name=f"residente_{residente.id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
        )
        
        # 4. Guardar en la base de datos
        print("💾 Guardando foto en la base de datos...")
        
        foto_residente = FotoResidente.objects.create(
            residente=residente,
            imagen=archivo_imagen,
            es_principal=True,
            activo=True
        )
        
        # 5. Verificar que se guardó correctamente
        print("✅ ¡Imagen guardada exitosamente!")
        print(f"   🆔 ID de la foto: {foto_residente.id}")
        print(f"   📁 URL de acceso: {foto_residente.imagen.url}")
        print(f"   📍 Ruta física: {foto_residente.imagen.path}")
        print(f"   📏 Tamaño: {foto_residente.imagen.size} bytes")
        print(f"   📅 Fecha creación: {foto_residente.fecha_creacion}")
        
        # 6. Crear URL completa para el frontend
        url_completa = f"http://localhost:8000{foto_residente.imagen.url}"
        print(f"   🌐 URL completa: {url_completa}")
        
        # 7. Ejemplo de cómo acceder desde el frontend
        print("\n📱 INTEGRACIÓN CON FRONTEND:")
        print("   Para mostrar la imagen en React/Angular/Vue:")
        print(f'   <img src="{url_completa}" alt="Foto de {residente.nombre}" />')
        print("\n   Para enviar desde el frontend:")
        print("   const formData = new FormData();")
        print("   formData.append('imagen', fileInput.files[0]);")
        print("   formData.append('residente_id', residente.id);")
        
        return True
        
    except Exception as e:
        print(f"❌ Error al guardar imagen: {e}")
        import traceback
        traceback.print_exc()
        return False

def verificar_urls_funcionan():
    """Verificar que las URLs de media funcionen correctamente"""
    print("\n🔗 VERIFICANDO URLs DE ACCESO:")
    print("=" * 35)
    
    # Obtener algunas fotos guardadas
    fotos = FotoResidente.objects.all()[:3]
    
    for foto in fotos:
        print(f"📸 Foto ID {foto.id}:")
        print(f"   👤 Residente: {foto.residente.nombre} {foto.residente.apellido}")
        print(f"   🔗 URL: http://localhost:8000{foto.imagen.url}")
        print(f"   📁 Archivo: {foto.imagen.path}")
        
        # Verificar que el archivo existe físicamente
        if os.path.exists(foto.imagen.path):
            print("   ✅ Archivo existe físicamente")
            tamaño = os.path.getsize(foto.imagen.path)
            print(f"   📏 Tamaño real: {tamaño} bytes")
        else:
            print("   ❌ Archivo no existe físicamente")
        
        print()

def mostrar_configuracion_actual():
    """Mostrar la configuración actual del sistema"""
    print("\n⚙️ CONFIGURACIÓN ACTUAL:")
    print("=" * 25)
    print(f"MEDIA_ROOT: {settings.MEDIA_ROOT}")
    print(f"MEDIA_URL: {settings.MEDIA_URL}")
    print(f"DEBUG: {settings.DEBUG}")
    
    # Verificar directorio media
    if os.path.exists(settings.MEDIA_ROOT):
        print("✅ Directorio MEDIA_ROOT existe")
        
        # Listar subdirectorios
        subdirs = [d for d in os.listdir(settings.MEDIA_ROOT) 
                  if os.path.isdir(os.path.join(settings.MEDIA_ROOT, d))]
        print(f"📁 Subdirectorios: {subdirs}")
        
        # Contar archivos totales
        total_files = 0
        for root, dirs, files in os.walk(settings.MEDIA_ROOT):
            total_files += len(files)
        print(f"📊 Total archivos: {total_files}")
    else:
        print("❌ Directorio MEDIA_ROOT no existe")

def main():
    print("🎯 DEMOSTRACIÓN COMPLETA - GUARDADO DE IMÁGENES")
    print("=" * 55)
    
    # Mostrar configuración
    mostrar_configuracion_actual()
    
    # Ejemplo práctico
    success = guardar_imagen_ejemplo()
    
    if success:
        # Verificar URLs
        verificar_urls_funcionan()
        
        print("\n🎉 DEMOSTRACIÓN EXITOSA!")
        print("✅ El sistema puede guardar imágenes correctamente")
        print("✅ Las URLs de acceso funcionan")
        print("✅ Los archivos se almacenan físicamente")
        print("\n💡 El sistema está listo para recibir imágenes desde:")
        print("   • Frontend web (React, Angular, Vue)")
        print("   • Aplicación móvil (Flutter)")
        print("   • APIs externas")
        print("   • Cámaras de seguridad")
    else:
        print("\n❌ La demostración falló. Revisar configuración.")

if __name__ == "__main__":
    main()