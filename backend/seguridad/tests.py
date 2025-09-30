from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import (
    PersonaAutorizada,
    VehiculoAutorizado,
    RegistroAcceso,
    RegistroVehiculo,
)

User = get_user_model()


class SeguridadModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="testpass123"
        )

    def test_crear_persona_autorizada(self):
        """Test crear persona autorizada"""
        persona = PersonaAutorizada.objects.create(
            nombre="Juan Pérez",
            ci="12345678",
            telefono="+59112345678",
            email="juan@example.com",
            tipo_acceso="residente",
        )

        self.assertEqual(persona.nombre, "Juan Pérez")
        self.assertEqual(persona.ci, "12345678")
        self.assertTrue(persona.activo)
        self.assertEqual(str(persona), "Juan Pérez (12345678)")

    def test_crear_vehiculo_autorizado(self):
        """Test crear vehículo autorizado"""
        vehiculo = VehiculoAutorizado.objects.create(
            placa="ABC123",
            propietario="Juan Pérez",
            tipo_vehiculo="auto",
            marca="Toyota",
            modelo="Corolla",
        )

        self.assertEqual(vehiculo.placa, "ABC123")
        self.assertEqual(vehiculo.propietario, "Juan Pérez")
        self.assertTrue(vehiculo.activo)
        self.assertEqual(str(vehiculo), "ABC123 - Juan Pérez")

    def test_crear_registro_acceso(self):
        """Test crear registro de acceso"""
        persona = PersonaAutorizada.objects.create(nombre="Juan Pérez", ci="12345678")

        registro = RegistroAcceso.objects.create(
            persona=persona, tipo_acceso="entrada", resultado="exitoso", confianza=95.5
        )

        self.assertEqual(registro.persona, persona)
        self.assertEqual(registro.tipo_acceso, "entrada")
        self.assertEqual(registro.resultado, "exitoso")
        self.assertEqual(registro.confianza, 95.5)

    def test_crear_registro_vehiculo(self):
        """Test crear registro de vehículo"""
        vehiculo = VehiculoAutorizado.objects.create(
            placa="ABC123", propietario="Juan Pérez"
        )

        registro = RegistroVehiculo.objects.create(
            placa="ABC123",
            vehiculo=vehiculo,
            tipo_vehiculo="auto",
            resultado="exitoso",
            confianza=92.3,
        )

        self.assertEqual(registro.placa, "ABC123")
        self.assertEqual(registro.vehiculo, vehiculo)
        self.assertEqual(registro.resultado, "exitoso")
        self.assertEqual(registro.confianza, 92.3)
