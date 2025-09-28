"""
URLs para el módulo de mantenimiento
"""
from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

urlpatterns = [
    # APIs básicas (temporales para pruebas)
    path('categorias/', views.CategoriaListView.as_view(), name='categorias'),
    path('tareas/', views.TareaListView.as_view(), name='tareas'),
    path('materiales/', views.MaterialListView.as_view(), name='materiales'),
    path('incidentes/', views.IncidenteListView.as_view(), name='incidentes'),
    path('estadisticas/', views.EstadisticasView.as_view(), name='estadisticas'),
]