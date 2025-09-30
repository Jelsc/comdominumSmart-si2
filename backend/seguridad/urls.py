from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Router para ViewSets
router = DefaultRouter()
router.register(
    r"personas", views.PersonaAutorizadaViewSet, basename="personas-autorizadas"
)
router.register(
    r"vehiculos", views.VehiculoAutorizadoViewSet, basename="vehiculos-autorizados"
)
router.register(
    r"registros-acceso", views.RegistroAccesoViewSet, basename="registros-acceso"
)
router.register(
    r"registros-vehiculos",
    views.RegistroVehiculoViewSet,
    basename="registros-vehiculos",
)
router.register(r"alertas", views.AlertaSeguridadViewSet, basename="alertas-seguridad")

urlpatterns = [
    # Incluir rutas del router
    path("", include(router.urls)),
    # Endpoints específicos de IA
    path(
        "reconocimiento-facial/",
        views.procesar_reconocimiento_facial,
        name="reconocimiento-facial",
    ),
    path(
        "reconocimiento-placa/",
        views.procesar_reconocimiento_placa,
        name="reconocimiento-placa",
    ),
    # Estadísticas y reportes
    path("estadisticas/", views.estadisticas_seguridad, name="estadisticas-seguridad"),
]
