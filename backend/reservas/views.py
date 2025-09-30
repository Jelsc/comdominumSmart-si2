from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Sum
from django.utils import timezone
from datetime import datetime, timedelta
from bitacora.utils import registrar_bitacora
from .models import Reserva
from .serializers import (
    ReservaSerializer,
    ReservaCreateSerializer,
    ReservaUpdateSerializer,
    ReservaListSerializer,
    ReservaAprobacionSerializer,
    ReservaEstadisticasSerializer
)
from areas_comunes.models import AreaComun
from residentes.models import Residente
from .actions import add_reserva_actions


class IsOwnerOrAdmin(permissions.BasePermission):
    """Permite acceso solo al propietario o administradores"""
    
    def has_object_permission(self, request, view, obj):
        # Administradores pueden ver todo
        if request.user.is_staff:
            return True
        
        # Residentes solo pueden ver sus propias reservas
        if hasattr(request.user, 'residente_profile'):
            return obj.residente == request.user.residente_profile
        
        return False


class ReservaViewSet(viewsets.ModelViewSet):
    """ViewSet para el CRUD de reservas"""
    
    queryset = Reserva.objects.select_related(
        'area_comun', 'residente', 'administrador_aprobacion'
    ).all()
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # Campos para filtrado
    filterset_fields = {
        'estado': ['exact'],
        'tipo_reserva': ['exact'],
        'fecha_reserva': ['exact', 'gte', 'lte'],
        'area_comun': ['exact'],
        'residente': ['exact'],
    }
    
    # Campos para búsqueda
    search_fields = ['motivo', 'area_comun__nombre', 'residente__nombre', 'residente__apellido']
    
    # Campos para ordenamiento
    ordering_fields = ['fecha_creacion', 'fecha_reserva', 'hora_inicio', 'costo_total']
    ordering = ['-fecha_creacion']
    
    def get_serializer_class(self):
        """Retorna el serializer apropiado según la acción"""
        if self.action == 'create':
            return ReservaCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ReservaUpdateSerializer
        elif self.action == 'list':
            return ReservaListSerializer
        return ReservaSerializer
    
    def get_queryset(self):
        """Filtra el queryset según los permisos del usuario"""
        queryset = super().get_queryset()
        
        # Si no es staff, solo mostrar sus propias reservas
        if not self.request.user.is_staff:
            if hasattr(self.request.user, 'residente_profile'):
                queryset = queryset.filter(residente=self.request.user.residente_profile)
            else:
                queryset = queryset.none()
        
        return queryset
    
    def perform_create(self, serializer):
        """Asigna el residente al crear la reserva"""
        if hasattr(self.request.user, 'residente_profile'):
            serializer.save(residente=self.request.user.residente_profile)
        else:
            # Si no es residente, usar el residente especificado en los datos
            serializer.save()
        
        # Registrar en bitácora
        registrar_bitacora(
            request=self.request,
            usuario=self.request.user,
            accion="Crear Reserva",
            descripcion=f"Reserva creada para {serializer.instance.area_comun.nombre}",
            modulo="RESERVAS"
        )
    
    def perform_update(self, serializer):
        """Actualiza la reserva y registra en bitácora"""
        old_instance = self.get_object()
        serializer.save()
        
        # Registrar en bitácora
        registrar_bitacora(
            request=self.request,
            usuario=self.request.user,
            accion="Actualizar Reserva",
            descripcion=f"Reserva {old_instance.id} actualizada",
            modulo="RESERVAS"
        )
    
    def perform_destroy(self, instance):
        """Elimina la reserva y registra en bitácora"""
        # Registrar en bitácora antes de eliminar
        registrar_bitacora(
            request=self.request,
            usuario=self.request.user,
            accion="Eliminar Reserva",
            descripcion=f"Reserva {instance.id} eliminada",
            modulo="RESERVAS"
        )
        instance.delete()


# Aplicar las acciones personalizadas al ViewSet
ReservaViewSet = add_reserva_actions(ReservaViewSet)