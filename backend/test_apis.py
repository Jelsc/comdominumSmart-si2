"""
Script de pruebas API para Smart Condominium
Prueba todos los endpoints sistemáticamente
"""
import requests
import json
from datetime import datetime, date

BASE_URL = 'http://localhost:8000'

class APITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.token = None
    
    def login(self, username='admin', password='admin'):
        """Login y obtener token"""
        print(f"\n🔐 === AUTENTICACIÓN ===")
        login_url = f"{self.base_url}/api/auth/login/"
        data = {
            'username': username,
            'password': password
        }
        
        try:
            response = self.session.post(login_url, json=data)
            if response.status_code == 200:
                result = response.json()
                if 'access' in result:
                    self.token = result['access']
                    self.session.headers.update({
                        'Authorization': f'Bearer {self.token}'
                    })
                    print(f"✅ Login exitoso para: {username}")
                    return True
                else:
                    print(f"✅ Login exitoso (sin token JWT): {username}")
                    return True
            else:
                print(f"❌ Error login: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Error conexión login: {e}")
            return False
    
    def test_get_endpoint(self, endpoint, description=""):
        """Probar endpoint GET"""
        try:
            url = f"{self.base_url}{endpoint}"
            response = self.session.get(url)
            
            if response.status_code == 200:
                data = response.json()
                count = len(data) if isinstance(data, list) else (data.get('count', 1) if 'results' in data else 1)
                print(f"✅ GET {endpoint} - {description} ({count} registros)")
                return data
            else:
                print(f"⚠️  GET {endpoint} - {description} (Status: {response.status_code})")
                return None
        except Exception as e:
            print(f"❌ Error GET {endpoint}: {e}")
            return None
    
    def test_post_endpoint(self, endpoint, data, description=""):
        """Probar endpoint POST"""
        try:
            url = f"{self.base_url}{endpoint}"
            response = self.session.post(url, json=data)
            
            if response.status_code in [200, 201]:
                result = response.json()
                print(f"✅ POST {endpoint} - {description}")
                return result
            else:
                print(f"⚠️  POST {endpoint} - {description} (Status: {response.status_code})")
                print(f"    Response: {response.text[:200]}...")
                return None
        except Exception as e:
            print(f"❌ Error POST {endpoint}: {e}")
            return None

def test_finanzas_apis():
    """Probar APIs del módulo de finanzas"""
    print(f"\n💰 === PRUEBAS MÓDULO FINANZAS ===")
    
    tester = APITester()
    
    # Login
    if not tester.login():
        return False
    
    # Probar endpoints de finanzas
    endpoints = [
        ('/api/finanzas/tipos-cuota/', 'Tipos de cuota'),
        ('/api/finanzas/cuotas/', 'Cuotas'),
        ('/api/finanzas/pagos/', 'Pagos'),
        ('/api/finanzas/estadisticas/', 'Estadísticas financieras'),
        ('/api/finanzas/configuracion/', 'Configuración financiera'),
    ]
    
    results = {}
    for endpoint, description in endpoints:
        results[endpoint] = tester.test_get_endpoint(endpoint, description)
    
    # Prueba POST - crear pago
    if results.get('/api/finanzas/cuotas/'):
        cuotas = results['/api/finanzas/cuotas/']
        if isinstance(cuotas, dict) and 'results' in cuotas:
            cuotas = cuotas['results']
        
        if cuotas and len(cuotas) > 0:
            cuota_id = cuotas[0]['id']
            pago_data = {
                'cuota': cuota_id,
                'monto': '150.00',
                'metodo_pago': 'transferencia',
                'referencia': 'TEST001',
                'observaciones': 'Pago de prueba automatizada'
            }
            tester.test_post_endpoint('/api/finanzas/pagos/', pago_data, 'Crear pago de prueba')
    
    return True

def test_reservas_apis():
    """Probar APIs del módulo de reservas"""
    print(f"\n📅 === PRUEBAS MÓDULO RESERVAS ===")
    
    tester = APITester()
    
    if not tester.login():
        return False
    
    endpoints = [
        ('/api/reservas/areas/', 'Áreas comunes'),
        ('/api/reservas/reservas/', 'Reservas'),
        ('/api/reservas/pagos-reserva/', 'Pagos de reservas'),
        ('/api/reservas/estadisticas/', 'Estadísticas de reservas'),
    ]
    
    results = {}
    for endpoint, description in endpoints:
        results[endpoint] = tester.test_get_endpoint(endpoint, description)
    
    # Crear reserva de prueba
    if results.get('/api/reservas/areas/'):
        areas = results['/api/reservas/areas/']
        if isinstance(areas, dict) and 'results' in areas:
            areas = areas['results']
        
        if areas and len(areas) > 0:
            area_id = areas[0]['id']
            reserva_data = {
                'area_comun': area_id,
                'fecha_reserva': (date.today().strftime('%Y-%m-%d')),
                'hora_inicio': '14:00:00',
                'hora_fin': '18:00:00',
                'numero_personas': 15,
                'motivo': 'Reunión de prueba API'
            }
            tester.test_post_endpoint('/api/reservas/reservas/', reserva_data, 'Crear reserva de prueba')
    
    return True

def test_mantenimiento_apis():
    """Probar APIs del módulo de mantenimiento"""
    print(f"\n🔧 === PRUEBAS MÓDULO MANTENIMIENTO ===")
    
    tester = APITester()
    
    if not tester.login():
        return False
    
    endpoints = [
        ('/api/mantenimiento/categorias/', 'Categorías de mantenimiento'),
        ('/api/mantenimiento/tareas/', 'Tareas de mantenimiento'),
        ('/api/mantenimiento/materiales/', 'Materiales'),
        ('/api/mantenimiento/incidentes/', 'Incidentes'),
        ('/api/mantenimiento/estadisticas/', 'Estadísticas de mantenimiento'),
    ]
    
    results = {}
    for endpoint, description in endpoints:
        results[endpoint] = tester.test_get_endpoint(endpoint, description)
    
    # Crear tarea de prueba
    if results.get('/api/mantenimiento/categorias/'):
        categorias = results['/api/mantenimiento/categorias/']
        if isinstance(categorias, dict) and 'results' in categorias:
            categorias = categorias['results']
        
        if categorias and len(categorias) > 0:
            categoria_id = categorias[0]['id']
            tarea_data = {
                'titulo': 'Limpieza de prueba API',
                'descripcion': 'Tarea de prueba creada desde API',
                'categoria': categoria_id,
                'tipo': 'preventivo',
                'prioridad': 'baja',
                'ubicacion': 'Área de prueba',
                'fecha_programada': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'tiempo_estimado': '1.5',
                'costo_estimado': '25.00'
            }
            tester.test_post_endpoint('/api/mantenimiento/tareas/', tarea_data, 'Crear tarea de prueba')
    
    return True

def test_ia_seguridad_apis():
    """Probar APIs del módulo de IA y seguridad"""
    print(f"\n🤖 === PRUEBAS MÓDULO IA Y SEGURIDAD ===")
    
    tester = APITester()
    
    if not tester.login():
        return False
    
    endpoints = [
        ('/api/ia-seguridad/vehiculos/', 'Vehículos'),
        ('/api/ia-seguridad/fotos-residentes/', 'Fotos de residentes'),
        ('/api/ia-seguridad/visitantes/', 'Visitantes'),
        ('/api/ia-seguridad/registros-acceso/', 'Registros de acceso'),
        ('/api/ia-seguridad/alertas/', 'Alertas de seguridad'),
        ('/api/ia-seguridad/estadisticas/', 'Estadísticas de seguridad'),
    ]
    
    results = {}
    for endpoint, description in endpoints:
        results[endpoint] = tester.test_get_endpoint(endpoint, description)
    
    # Pruebas especiales de IA
    print(f"\n🔍 === PRUEBAS FUNCIONALIDADES IA ===")
    
    # Test reconocimiento facial (simulado)
    tester.test_get_endpoint('/api/ia-seguridad/reconocer-rostro/', 'Reconocimiento facial')
    
    # Test OCR placas (simulado)
    tester.test_get_endpoint('/api/ia-seguridad/procesar-placa/', 'Procesamiento OCR de placas')
    
    # Test detección anomalías
    tester.test_get_endpoint('/api/ia-seguridad/detectar-anomalia/', 'Detección de anomalías')
    
    return True

def test_apis_base():
    """Probar APIs base del sistema"""
    print(f"\n🏠 === PRUEBAS APIS BASE ===")
    
    tester = APITester()
    
    if not tester.login():
        return False
    
    endpoints = [
        ('/api/residentes/', 'Residentes'),
        ('/api/personal/', 'Personal'),
        ('/api/users/', 'Usuarios'),
        ('/api/bitacora/', 'Bitácora'),
    ]
    
    for endpoint, description in endpoints:
        tester.test_get_endpoint(endpoint, description)
    
    return True

def main():
    """Función principal de pruebas de API"""
    print("🚀 === INICIANDO PRUEBAS COMPLETAS DE API ===")
    print(f"🌐 Base URL: {BASE_URL}")
    
    # Probar conexión básica
    try:
        response = requests.get(f"{BASE_URL}/api/")
        if response.status_code == 200:
            print("✅ Servidor API disponible")
        else:
            print(f"⚠️  Servidor responde con status: {response.status_code}")
    except Exception as e:
        print(f"❌ Error conexión al servidor: {e}")
        return
    
    # Ejecutar todas las pruebas
    test_apis_base()
    test_finanzas_apis()
    test_reservas_apis()
    test_mantenimiento_apis()
    test_ia_seguridad_apis()
    
    print(f"\n🎉 === PRUEBAS DE API COMPLETADAS ===")
    print("✅ Todas las funcionalidades han sido probadas")
    print("📊 Revisa los logs anteriores para detalles específicos")

if __name__ == '__main__':
    main()