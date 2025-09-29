from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UnidadHabitacionalViewSet

router = DefaultRouter()
router.register(r'', UnidadHabitacionalViewSet, basename='unidades')

urlpatterns = [
    path('', include(router.urls)),
]