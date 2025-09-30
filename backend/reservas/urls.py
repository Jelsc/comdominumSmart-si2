from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReservaViewSet

# Router para ViewSets
router = DefaultRouter()
router.register(r'', ReservaViewSet, basename='reservas')

urlpatterns = [
    path('', include(router.urls)),
]
