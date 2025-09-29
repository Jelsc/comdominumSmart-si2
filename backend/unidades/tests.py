from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from residentes.models import Residente
from .models import UnidadHabitacional
from datetime import date

User = get_user_model()

class UnidadHabitacionalTests(TestCase):
    """Pruebas para el modelo UnidadHabitacional y sus endpoints"""
    
    def setUp(self):
        """Configurar datos de prueba"""
        # Crear un usuario staff para pruebas de permisos
        self.staff_user = User.objects.create_user(
            username="admin",
            email="admin@test.com",
            password="password123",
            is_staff=True
        )
        
        # Crear un usuario normal
        self.regular_user = User.objects.create_user(
            username="usuario",
            email="usuario@test.com",
            password="password123",
            is_staff=False
        )
        
        # Cliente API para usuario staff
        self.staff_client = APIClient()
        self.staff_client.force_authenticate(user=self.staff_user)
        
        # Cliente API para usuario normal
        self.client = APIClient()
        self.client.force_authenticate(user=self.regular_user)
        
        # Crear algunos residentes de prueba
        self.residente1 = Residente.objects.create(
            nombre="Juan",
            apellido="Pérez",
            ci="123456",
            email="juan@test.com",
            telefono="123456789",
            tipo="propietario",
            fecha_ingreso=date.today()
        )
        
        self.residente2 = Residente.objects.create(
            nombre="Maria",
            apellido="González",
            ci="654321",
            email="maria@test.com",
            telefono="987654321",
            tipo="inquilino",
            fecha_ingreso=date.today()
        )
        
        self.residente3 = Residente.objects.create(
            nombre="Pedro",
            apellido="Rodríguez",
            ci="789456",
            email="pedro@test.com",
            telefono="456789123",
            tipo="propietario",
            fecha_ingreso=date.today()
        )
        
        # Crear una unidad de prueba
        self.unidad = UnidadHabitacional.objects.create(
            estado="OCUPADA",
            direccion="Torre A 101",
            cantidad_vehiculos=1
        )
    
    def test_crear_unidad_sin_residentes(self):
        """Probar crear una unidad sin residentes"""
        url = reverse('unidades-list')
        data = {
            'estado': 'DESOCUPADA',
            'direccion': 'Torre B 202',
            'cantidad_vehiculos': 0
        }
        
        response = self.staff_client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(UnidadHabitacional.objects.count(), 2)
        self.assertEqual(response.data['estado'], 'DESOCUPADA')
    
    def test_crear_unidad_con_un_residente(self):
        """Probar crear una unidad con un residente"""
        url = reverse('unidades-list')
        data = {
            'estado': 'OCUPADA',
            'direccion': 'Torre B 203',
            'cantidad_vehiculos': 1,
            'residente_ids': [self.residente1.id]
        }
        
        response = self.staff_client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verificar que el residente está asignado a la unidad
        self.residente1.refresh_from_db()
        self.assertIsNotNone(self.residente1.unidad)
        self.assertEqual(self.residente1.unidad.direccion, 'Torre B 203')
    
    def test_crear_unidad_con_dos_residentes(self):
        """Probar crear una unidad con dos residentes"""
        url = reverse('unidades-list')
        data = {
            'estado': 'OCUPADA',
            'direccion': 'Torre B 204',
            'cantidad_vehiculos': 2,
            'residente_ids': [self.residente1.id, self.residente2.id]
        }
        
        response = self.staff_client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verificar que ambos residentes están asignados a la unidad
        self.residente1.refresh_from_db()
        self.residente2.refresh_from_db()
        
        self.assertEqual(self.residente1.unidad.direccion, 'Torre B 204')
        self.assertEqual(self.residente2.unidad.direccion, 'Torre B 204')
    
    def test_crear_unidad_con_mas_de_dos_residentes(self):
        """Probar crear una unidad con más de dos residentes (debe fallar)"""
        url = reverse('unidades-list')
        data = {
            'estado': 'OCUPADA',
            'direccion': 'Torre B 205',
            'cantidad_vehiculos': 2,
            'residente_ids': [self.residente1.id, self.residente2.id, self.residente3.id]
        }
        
        response = self.staff_client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_actualizar_unidad_sin_residentes(self):
        """Probar actualizar una unidad quitando todos los residentes"""
        # Primero asignar residentes a la unidad
        self.residente1.unidad = self.unidad
        self.residente1.save()
        
        url = reverse('unidades-detail', kwargs={'pk': self.unidad.id})
        data = {
            'estado': 'DESOCUPADA',
            'direccion': 'Torre A 101',
            'cantidad_vehiculos': 0,
            'residente_ids': []
        }
        
        response = self.staff_client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificar que el residente ya no está asignado
        self.residente1.refresh_from_db()
        self.assertIsNone(self.residente1.unidad)
    
    def test_cantidad_vehiculos_negativa(self):
        """Probar crear unidad con cantidad de vehículos negativa (debe fallar)"""
        url = reverse('unidades-list')
        data = {
            'estado': 'DESOCUPADA',
            'direccion': 'Torre B 206',
            'cantidad_vehiculos': -1
        }
        
        response = self.staff_client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_filtro_por_estado(self):
        """Probar filtrar unidades por estado"""
        # Crear otra unidad con estado diferente
        UnidadHabitacional.objects.create(
            estado="DESOCUPADA",
            direccion="Torre C 301",
            cantidad_vehiculos=0
        )
        
        url = reverse('unidades-list') + '?estado=DESOCUPADA'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['estado'], 'DESOCUPADA')
    
    def test_permisos_usuario_no_staff(self):
        """Probar que un usuario no staff no puede crear/editar/borrar unidades"""
        # Intentar crear
        url = reverse('unidades-list')
        data = {
            'estado': 'DESOCUPADA',
            'direccion': 'Torre D 401',
            'cantidad_vehiculos': 0
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Intentar editar
        url = reverse('unidades-detail', kwargs={'pk': self.unidad.id})
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Intentar borrar
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)