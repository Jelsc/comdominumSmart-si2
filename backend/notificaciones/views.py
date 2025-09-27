from rest_framework import viewsets, status, filters, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from django.utils import timezone

from .models import Notificacion
from .serializers import (
    NotificacionSerializer, 
    NotificacionCreateUpdateSerializer,
    RolSerializer
)
from users.models import Rol, CustomUser
from users.permissions import IsAdminPortalUser


class NotificacionViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar notificaciones del condominio
    """
    queryset = Notificacion.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsAdminPortalUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['tipo', 'estado', 'prioridad', 'es_individual', 'activa']
    search_fields = ['nombre', 'descripcion']
    ordering_fields = ['fecha_creacion', 'fecha_programada', 'prioridad', 'nombre']
    ordering = ['-fecha_creacion']
    
    def get_serializer_class(self):
        """Usar diferentes serializers según la acción"""
        if self.action in ['create', 'update', 'partial_update']:
            return NotificacionCreateUpdateSerializer
        return NotificacionSerializer
    
    def perform_create(self, serializer):
        """Asignar el usuario actual como creador"""
        serializer.save(creado_por=self.request.user)
    
    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """
        Devuelve estadísticas de las notificaciones
        """
        queryset = self.get_queryset()
        
        stats = {
            'total': queryset.count(),
            'por_estado': {
                'borrador': queryset.filter(estado='borrador').count(),
                'programada': queryset.filter(estado='programada').count(),
                'enviada': queryset.filter(estado='enviada').count(),
                'cancelada': queryset.filter(estado='cancelada').count(),
            },
            'por_tipo': {},
            'por_prioridad': {
                'baja': queryset.filter(prioridad='baja').count(),
                'normal': queryset.filter(prioridad='normal').count(),
                'alta': queryset.filter(prioridad='alta').count(),
                'urgente': queryset.filter(prioridad='urgente').count(),
            },
            'individuales': queryset.filter(es_individual=True).count(),
            'activas': queryset.filter(activa=True).count(),
        }
        
        # Estadísticas por tipo
        tipos = dict(Notificacion.TIPO_CHOICES)
        for tipo_key, tipo_name in tipos.items():
            stats['por_tipo'][tipo_key] = queryset.filter(tipo=tipo_key).count()
        
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def programadas_hoy(self, request):
        """
        Devuelve las notificaciones programadas para hoy
        """
        hoy = timezone.now().date()
        queryset = self.get_queryset().filter(
            fecha_programada__date=hoy,
            estado='programada'
        )
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def enviar(self, request, pk=None):
        """
        Marcar una notificación como enviada
        """
        notificacion = self.get_object()
        
        if notificacion.estado != 'programada':
            return Response(
                {'error': 'Solo se pueden enviar notificaciones programadas'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        notificacion.estado = 'enviada'
        notificacion.save()
        
        return Response({'message': 'Notificación enviada correctamente'})
    
    @action(detail=True, methods=['post'])
    def cancelar(self, request, pk=None):
        """
        Cancelar una notificación
        """
        notificacion = self.get_object()
        
        if notificacion.estado == 'enviada':
            return Response(
                {'error': 'No se pueden cancelar notificaciones ya enviadas'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        notificacion.estado = 'cancelada'
        notificacion.save()
        
        return Response({'message': 'Notificación cancelada correctamente'})
    
    @action(detail=False, methods=['get'])
    def roles_disponibles(self, request):
        """
        Devuelve los roles disponibles para asignar a notificaciones
        """
        roles = Rol.objects.all().order_by('nombre')
        serializer = RolSerializer(roles, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def usuarios_por_rol(self, request):
        """
        Devuelve los usuarios activos agrupados por rol para notificaciones individuales
        """
        roles_ids = request.query_params.getlist('roles[]')
        
        if not roles_ids:
            return Response({'error': 'Se requiere al menos un rol'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            roles_ids = [int(rol_id) for rol_id in roles_ids]
        except ValueError:
            return Response({'error': 'IDs de roles inválidos'}, status=status.HTTP_400_BAD_REQUEST)
        
        roles_con_usuarios = []
        
        for rol_id in roles_ids:
            try:
                rol = Rol.objects.get(id=rol_id)
                usuarios = CustomUser.objects.filter(
                    rol=rol, 
                    is_active=True
                ).order_by('first_name', 'last_name')
                
                usuarios_data = []
                for usuario in usuarios:
                    usuarios_data.append({
                        'id': usuario.id,
                        'first_name': usuario.first_name,
                        'last_name': usuario.last_name,
                        'email': usuario.email,
                        'nombre_completo': f"{usuario.first_name} {usuario.last_name}".strip()
                    })
                
                roles_con_usuarios.append({
                    'rol_id': rol.id,
                    'rol_nombre': rol.nombre,
                    'usuarios': usuarios_data,
                    'total_usuarios': len(usuarios_data)
                })
                
            except Rol.DoesNotExist:
                continue
        
        return Response(roles_con_usuarios)