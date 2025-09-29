from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from areas_comunes.models import AreaComun


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
@pytest.mark.django_db
def staff_user():
    user_model = get_user_model()
    user = user_model.objects.create_user(
        username="admin_user",
        email="admin@example.com",
        password="password123",
    )
    user.is_staff = True
    user.save()
    return user


@pytest.fixture
@pytest.mark.django_db
def regular_user():
    user_model = get_user_model()
    return user_model.objects.create_user(
        username="regular_user",
        email="regular@example.com",
        password="password123",
    )


@pytest.fixture
@pytest.mark.django_db
def area_comun():
    return AreaComun.objects.create(
        nombre="Sala Común",
        monto_hora=Decimal("15.00"),
        estado=AreaComun.ESTADO_ACTIVO,
    )


@pytest.mark.django_db
def test_crear_area_comun_exitoso(api_client, staff_user):
    url = reverse("areas-comunes-list")
    payload = {
        "nombre": "  Piscina   Principal  ",
        "monto_hora": "25.5",
        "estado": AreaComun.ESTADO_ACTIVO,
    }

    api_client.force_authenticate(user=staff_user)
    response = api_client.post(url, payload, format="json")

    assert response.status_code == status.HTTP_201_CREATED
    area = AreaComun.objects.get(nombre="Piscina Principal")
    assert area.monto_hora == Decimal("25.50")
    assert response.data["nombre"] == "Piscina Principal"


@pytest.mark.django_db
def test_rechazar_monto_negativo(api_client, staff_user):
    url = reverse("areas-comunes-list")
    payload = {
        "nombre": "Gimnasio",
        "monto_hora": "-10",
        "estado": AreaComun.ESTADO_ACTIVO,
    }

    api_client.force_authenticate(user=staff_user)
    response = api_client.post(url, payload, format="json")

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "monto_hora" in response.data


@pytest.mark.django_db
def test_rechazar_estado_invalido(api_client, staff_user):
    url = reverse("areas-comunes-list")
    payload = {
        "nombre": "Sala de Juegos",
        "monto_hora": "10.00",
        "estado": "DESCONOCIDO",
    }

    api_client.force_authenticate(user=staff_user)
    response = api_client.post(url, payload, format="json")

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "estado" in response.data


@pytest.mark.django_db
def test_unicidad_nombre_case_insensitive(api_client, staff_user):
    AreaComun.objects.create(
        nombre="Piscina",
        monto_hora=Decimal("20.00"),
        estado=AreaComun.ESTADO_ACTIVO,
    )

    url = reverse("areas-comunes-list")
    payload = {
        "nombre": "piscina",
        "monto_hora": "25.00",
        "estado": AreaComun.ESTADO_INACTIVO,
    }

    api_client.force_authenticate(user=staff_user)
    response = api_client.post(url, payload, format="json")

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "nombre" in response.data


@pytest.mark.django_db
def test_filtrar_por_estado(api_client, regular_user, staff_user):
    AreaComun.objects.bulk_create(
        [
            AreaComun(
                nombre="Piscina",
                monto_hora=Decimal("10.00"),
                estado=AreaComun.ESTADO_ACTIVO,
            ),
            AreaComun(
                nombre="Sala de Reuniones",
                monto_hora=Decimal("5.00"),
                estado=AreaComun.ESTADO_INACTIVO,
            ),
            AreaComun(
                nombre="Cancha",
                monto_hora=Decimal("8.00"),
                estado=AreaComun.ESTADO_MANTENIMIENTO,
            ),
        ]
    )

    url = reverse("areas-comunes-list")
    api_client.force_authenticate(user=regular_user)
    response = api_client.get(url, {"estado": AreaComun.ESTADO_INACTIVO})

    assert response.status_code == status.HTTP_200_OK
    assert response.data["count"] == 1
    assert response.data["results"][0]["nombre"] == "Sala de Reuniones"


@pytest.mark.django_db
def test_busqueda_por_nombre(api_client, regular_user):
    AreaComun.objects.bulk_create(
        [
            AreaComun(
                nombre="Piscina",
                monto_hora=Decimal("10.00"),
                estado=AreaComun.ESTADO_ACTIVO,
            ),
            AreaComun(
                nombre="Sala de Juegos",
                monto_hora=Decimal("7.00"),
                estado=AreaComun.ESTADO_ACTIVO,
            ),
        ]
    )

    url = reverse("areas-comunes-list")
    api_client.force_authenticate(user=regular_user)
    response = api_client.get(url, {"search": "juego"})

    assert response.status_code == status.HTTP_200_OK
    assert response.data["count"] == 1
    assert response.data["results"][0]["nombre"] == "Sala de Juegos"


@pytest.mark.django_db
def test_permisos_para_usuario_no_staff(api_client, regular_user, area_comun):
    url = reverse("areas-comunes-list")
    api_client.force_authenticate(user=regular_user)

    create_response = api_client.post(
        url,
        {
            "nombre": "Nueva Sala",
            "monto_hora": "12.00",
            "estado": AreaComun.ESTADO_ACTIVO,
        },
        format="json",
    )
    assert create_response.status_code == status.HTTP_403_FORBIDDEN

    detail_url = reverse("areas-comunes-detail", args=[area_comun.id])
    update_response = api_client.put(
        detail_url,
        {
            "nombre": "Sala Actualizada",
            "monto_hora": "18.00",
            "estado": AreaComun.ESTADO_INACTIVO,
        },
        format="json",
    )
    assert update_response.status_code == status.HTTP_403_FORBIDDEN

    delete_response = api_client.delete(detail_url)
    assert delete_response.status_code == status.HTTP_403_FORBIDDEN
