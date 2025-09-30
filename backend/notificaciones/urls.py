from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotificacionViewSet

# Router para las rutas del ViewSet
router = DefaultRouter()
router.register(r'', NotificacionViewSet, basename='notificaciones')

urlpatterns = [
    # Rutas del ViewSet (CRUD + acciones personalizadas)
    path('', include(router.urls)),
]