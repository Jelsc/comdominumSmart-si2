"""
URLs para el módulo de finanzas
"""
from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

urlpatterns = [
    # APIs básicas (temporales para pruebas)
    path('tipos-cuota/', views.TipoCuotaListView.as_view(), name='tipos-cuota'),
    path('cuotas/', views.CuotaListView.as_view(), name='cuotas'),
    path('pagos/', views.PagoListView.as_view(), name='pagos'),
    path('estadisticas/', views.EstadisticasView.as_view(), name='estadisticas'),
    path('configuracion/', views.ConfiguracionView.as_view(), name='configuracion'),
]