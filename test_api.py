import requests
import json

# URL del endpoint
url = "http://localhost:8000/api/notificaciones/notificaciones/"

# Datos para crear una notificación de prueba
data = {
    "nombre": "Notificación de Prueba",
    "descripcion": "Esta es una descripción de prueba",
    "tipo": "general",
    "estado": "borrador",
    "prioridad": "normal",
    "roles_destinatarios": [1],  # Asumiendo que existe un rol con ID 1
    "es_individual": False,
    "requiere_confirmacion": False,
    "activa": True
}

# Headers con autenticación (necesitarás el token)
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_TOKEN_HERE"  # Reemplazar con token real
}

try:
    response = requests.post(url, json=data, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code != 201:
        print("Error en la creación:")
        try:
            error_data = response.json()
            print(json.dumps(error_data, indent=2))
        except:
            print("No se pudo parsear la respuesta como JSON")
            
except Exception as e:
    print(f"Error en la petición: {e}")