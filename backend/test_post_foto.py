#!/usr/bin/env python
"""
Script para probar el POST a fotos-residentes
"""
import requests
import os
from io import BytesIO
from PIL import Image

def crear_imagen_prueba():
    """Crear una imagen de prueba simple"""
    # Crear imagen RGB simple
    img = Image.new('RGB', (100, 100), color='blue')
    
    # Guardar en BytesIO
    buffer = BytesIO()
    img.save(buffer, format='JPEG')
    buffer.seek(0)
    
    return buffer.getvalue()

def test_login():
    """Hacer login y obtener token"""
    login_data = {
        'username': 'usuario1',
        'password': 'password123'
    }
    
    response = requests.post('http://localhost:8000/api/auth/login/', json=login_data)
    
    if response.status_code == 200:
        data = response.json()
        return data.get('access_token') or data.get('access') or data.get('key')
    else:
        print(f"Error en login: {response.status_code}")
        print(response.text)
        return None

def test_post_foto():
    """Probar POST de foto de residente"""
    # Obtener token
    token = test_login()
    if not token:
        print("❌ No se pudo obtener token")
        return
    
    print(f"✅ Token obtenido: {token[:20]}...")
    
    # Crear imagen de prueba
    imagen_bytes = crear_imagen_prueba()
    print(f"✅ Imagen creada: {len(imagen_bytes)} bytes")
    
    # Preparar datos
    files = {
        'imagen': ('test.jpg', imagen_bytes, 'image/jpeg')
    }
    data = {
        'residente': 10,  # ID de Isabel Díaz
        'es_principal': True,
        'activo': True
    }
    
    headers = {
        'Authorization': f'Bearer {token}'
    }
    
    # Hacer POST
    print("📤 Enviando POST...")
    response = requests.post(
        'http://localhost:8000/api/ia-seguridad/fotos-residentes/',
        files=files,
        data=data,
        headers=headers
    )
    
    print(f"📨 Respuesta: {response.status_code}")
    print(f"📝 Contenido: {response.text}")
    
    if response.status_code in [200, 201]:
        print("✅ ¡Foto guardada exitosamente!")
    else:
        print("❌ Error al guardar foto")

if __name__ == "__main__":
    print("🧪 PRUEBA DE POST - FOTO RESIDENTE")
    print("=" * 40)
    test_post_foto()