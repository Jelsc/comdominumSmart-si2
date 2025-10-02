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
    permission_classes = [permissions.IsAuthenticated]  # Permitir acceso a usuarios autenticados
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['tipo', 'prioridad', 'es_individual', 'activa', 'estado']
    search_fields = ['nombre', 'descripcion']
    ordering_fields = ['fecha_creacion', 'fecha_programada', 'prioridad', 'nombre']
    ordering = ['-fecha_creacion']
    
    def get_queryset(self):
        """Filtrar notificaciones según el usuario y parámetros de consulta"""
        queryset = super().get_queryset()
        user = self.request.user
        
        # Si NO es administrador, filtrar solo notificaciones dirigidas al usuario
        if not (user.es_administrativo and user.is_staff):
            # Solo mostrar notificaciones activas y enviadas
            queryset = queryset.filter(activa=True, estado='enviada')
            
            # Filtrar por roles del usuario actual
            if user.rol:
                queryset = queryset.filter(roles_destinatarios=user.rol)
        
        # Verificar si se solicita sólo las notificaciones del usuario actual
        if self.request.query_params.get('usuario_actual') == 'true':
            # Filtramos para mostrar las notificaciones según los parámetros
            
            # Filtrar por estado
            estado = self.request.query_params.get('estado')
            if estado == 'no_leida':
                # Mostrar todas excepto las que ya están marcadas como leídas
                queryset = queryset.exclude(estado='leida')
            elif estado:
                queryset = queryset.filter(estado=estado)
            
            # Nuevo filtro para notificaciones no leídas usando parámetro no_leidas
            no_leidas = self.request.query_params.get('no_leidas')
            if no_leidas == 'true':
                queryset = queryset.exclude(estado='leida')
            
            return queryset
        
        return queryset.distinct()
    
    def get_serializer_class(self):
        """Usar diferentes serializers según la acción"""
        if self.action in ['create', 'update', 'partial_update']:
            return NotificacionCreateUpdateSerializer
        return NotificacionSerializer
    
    def perform_create(self, serializer):
        """Asignar el usuario actual como creador"""
        # Solo administradores pueden crear notificaciones
        if not (self.request.user.es_administrativo and self.request.user.is_staff):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Solo los administradores pueden crear notificaciones")
        serializer.save(creado_por=self.request.user)
    
    def update(self, request, *args, **kwargs):
        """Solo administradores pueden actualizar notificaciones"""
        if not (request.user.es_administrativo and request.user.is_staff):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Solo los administradores pueden editar notificaciones")
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """Solo administradores pueden eliminar notificaciones"""
        if not (request.user.es_administrativo and request.user.is_staff):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Solo los administradores pueden eliminar notificaciones")
        return super().destroy(request, *args, **kwargs)
    
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
    
    @action(detail=True, methods=['post'])
    def marcar_como_leida(self, request, pk=None):
        """
        Marcar una notificación como leída para el usuario actual
        """
        notificacion = self.get_object()
        
        # Actualizar el estado a "leida"
        notificacion.estado = 'leida'
        notificacion.save()
        
        return Response({
            'message': 'Notificación marcada como leída correctamente',
            'notificacion_id': notificacion.id
        })
        
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
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def mis_notificaciones(self, request):
        """
        Endpoint específico para residentes - obtener sus notificaciones
        """
        try:
            # Obtener el residente asociado al usuario
            if hasattr(request.user, 'residente_profile'):
                residente = request.user.residente_profile
                
                # Filtrar notificaciones que incluyan al residente
                # Primero obtenemos el rol correspondiente al tipo de residente
                from users.models import Rol
                try:
                    rol_residente = Rol.objects.get(nombre=residente.tipo)
                    queryset = Notificacion.objects.filter(
                        roles_destinatarios=rol_residente
                    ).distinct()
                except Rol.DoesNotExist:
                    # Si no existe el rol, mostrar todas las notificaciones generales
                    queryset = Notificacion.objects.filter(
                        es_individual=False
                    ).distinct()
                
                # Aplicar filtros adicionales
                estado = request.query_params.get('estado')
                if estado == 'no_leida':
                    queryset = queryset.exclude(estado='leida')
                elif estado:
                    queryset = queryset.filter(estado=estado)
                
                no_leidas = request.query_params.get('no_leidas')
                if no_leidas == 'true':
                    queryset = queryset.exclude(estado='leida')
                
                # Serializar y devolver
                serializer = NotificacionSerializer(queryset, many=True)
                return Response(serializer.data)
            else:
                return Response(
                    {'error': 'Usuario no tiene perfil de residente'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )