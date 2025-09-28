"""
URLs para el módulo de reservas
"""
from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

urlpatterns = [
    # APIs básicas (temporales para pruebas)
    path('areas/', views.AreaComunListView.as_view(), name='areas'),
    path('reservas/', views.ReservaListView.as_view(), name='reservas'),
    path('pagos-reserva/', views.PagoReservaListView.as_view(), name='pagos-reserva'),
    path('estadisticas/', views.EstadisticasView.as_view(), name='estadisticas'),
]