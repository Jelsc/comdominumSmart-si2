from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from bitacora.utils import registrar_bitacora
from users.permissions import IsAdminPortalUser
from .models import UnidadHabitacional
from .serializers import (
    UnidadHabitacionalSerializer,
    UnidadHabitacionalCreateSerializer,
    UnidadHabitacionalUpdateSerializer,
    UnidadHabitacionalEstadoSerializer
)


# Crear una clase de permisos personalizada para gestionar unidades
class CanManageUnidades(permissions.BasePermission):
    """
    Permiso para gestionar unidades habitacionales.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Solo permitir lectura para todos los usuarios autenticados
        if request.method in permissions.SAFE_METHODS:
            return True

        # Para escritura (crear/editar/borrar), requerir permiso específico
        return request.user.tiene_permiso("gestionar_unidades")


class UnidadHabitacionalViewSet(viewsets.ModelViewSet):
    """ViewSet para el CRUD de unidades habitacionales - Refactorizado"""

    queryset = UnidadHabitacional.objects.all()
    serializer_class = UnidadHabitacionalSerializer
    permission_classes = [permissions.IsAuthenticated, CanManageUnidades]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # Campos válidos para filtrado/búsqueda/ordenamiento
    filterset_fields = ["estado"]
    search_fields = ["direccion", "codigo"]
    ordering_fields = ["direccion", "codigo", "estado", "fecha_creacion", "fecha_actualizacion"]
    ordering = ["codigo"]
    
    def get_serializer_class(self):
        """Retorna el serializer apropiado según la acción"""
        if self.action == "create":
            return UnidadHabitacionalCreateSerializer
        elif self.action in ["update", "partial_update"]:
            return UnidadHabitacionalUpdateSerializer
        elif self.action == "cambiar_estado":
            return UnidadHabitacionalEstadoSerializer
        return UnidadHabitacionalSerializer
    
    def perform_create(self, serializer):
        """Crear una nueva unidad habitacional"""
        if not self.request.user.tiene_permiso('gestionar_unidades'):
            raise PermissionDenied("No tienes permisos para crear unidades habitacionales")
            
        unidad = serializer.save()

        # Registrar en bitácora
        registrar_bitacora(
            request=self.request,
            usuario=self.request.user,
            accion="Crear",
            descripcion=f"Se creó la unidad habitacional {unidad.codigo}",
            modulo="UNIDADES",
        )

    def perform_update(self, serializer):
        """Actualizar una unidad habitacional"""
        if not self.request.user.tiene_permiso('gestionar_unidades'):
            raise PermissionDenied("No tienes permisos para actualizar unidades habitacionales")
        
        unidad = serializer.save()

        # Registrar en bitácora
        registrar_bitacora(
            request=self.request,
            usuario=self.request.user,
            accion="Actualizar",
            descripcion=f"Se actualizó la unidad habitacional {unidad.codigo}",
            modulo="UNIDADES",
        )
    
    def perform_destroy(self, instance):
        """Eliminar una unidad habitacional"""
        if not self.request.user.tiene_permiso('gestionar_unidades'):
            raise PermissionDenied("No tienes permisos para eliminar unidades habitacionales")
        
        codigo = instance.codigo
        instance.delete()

        # Registrar en bitácora
        registrar_bitacora(
            request=self.request,
            usuario=self.request.user,
            accion="Eliminar",
            descripcion=f"Se eliminó la unidad habitacional {codigo}",
            modulo="UNIDADES",
        )
    
    @action(detail=True, methods=['patch'])
    def cambiar_estado(self, request, pk=None):
        """
        Endpoint para cambiar solo el estado de una unidad habitacional
        """
        unidad = self.get_object()
        serializer = self.get_serializer(unidad, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            
            # Registrar en bitácora
            registrar_bitacora(
                request=request,
                usuario=request.user,
                accion="Cambiar Estado",
                descripcion=f"Se cambió el estado de la unidad {unidad.codigo} a {unidad.get_estado_display()}",
                modulo="UNIDADES",
            )
            
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)