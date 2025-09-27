from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

from .models import Notificacion
from users.models import Rol

User = get_user_model()


class NotificacionModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com'
        )
        self.rol = Rol.objects.create(
            nombre='Administrador',
            descripcion='Rol de administrador'
        )
        
    def test_crear_notificacion(self):
        notificacion = Notificacion.objects.create(
            nombre='Test Notification',
            descripcion='Una notificación de prueba',
            tipo='general',
            creado_por=self.user
        )
        
        self.assertEqual(notificacion.nombre, 'Test Notification')
        self.assertEqual(notificacion.estado, 'borrador')
        self.assertEqual(notificacion.prioridad, 'normal')
        self.assertTrue(notificacion.activa)
    
    def test_str_method(self):
        notificacion = Notificacion.objects.create(
            nombre='Test Notification',
            descripcion='Test',
            tipo='mantenimiento',
            creado_por=self.user
        )
        
        self.assertEqual(str(notificacion), 'Test Notification (Mantenimiento)')
    
    def test_total_destinatarios_property(self):
        notificacion = Notificacion.objects.create(
            nombre='Test Notification',
            descripcion='Test',
            creado_por=self.user
        )
        
        # Sin roles asignados
        self.assertEqual(notificacion.total_destinatarios, 0)
        
        # Con rol asignado pero sin usuarios
        notificacion.roles_destinatarios.add(self.rol)
        self.assertEqual(notificacion.total_destinatarios, 0)
    
    def test_estado_display_property(self):
        notificacion = Notificacion.objects.create(
            nombre='Test Notification',
            descripcion='Test',
            estado='programada',
            creado_por=self.user
        )
        
        estado_info = notificacion.estado_display
        self.assertEqual(estado_info['estado'], 'Programada')
        self.assertEqual(estado_info['color'], 'blue')