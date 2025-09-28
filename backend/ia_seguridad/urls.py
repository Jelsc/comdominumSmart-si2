from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'camaras', views.CamaraViewSet)
router.register(r'fotos-residentes', views.FotoResidenteViewSet)
router.register(r'vehiculos', views.VehiculoViewSet)
router.register(r'visitantes', views.VisitanteViewSet)
router.register(r'registros-acceso', views.RegistroAccesoViewSet)
router.register(r'alertas', views.AlertaSeguridadViewSet)
router.register(r'ia', views.ServicioIAViewSet, basename='ia')

urlpatterns = [
    path('', include(router.urls)),
]