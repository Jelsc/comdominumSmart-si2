from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Inventario
from .serializers import InventarioSerializer, InventarioDetailSerializer


class IsStaffOrReadOnly(permissions.BasePermission):
    """Permite lectura a usuarios autenticados y escritura solo a staff."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
        )


class InventarioViewSet(viewsets.ModelViewSet):
    queryset = Inventario.objects.all()
    serializer_class = InventarioSerializer
    permission_classes = [IsStaffOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ('estado', 'categoria', 'area_comun')
    search_fields = ('nombre', 'ubicacion', 'descripcion', 'area_comun__nombre')
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return InventarioDetailSerializer
        return InventarioSerializer
        
    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """Obtener estadísticas de inventario."""
        total = Inventario.objects.count()
        activos = Inventario.objects.filter(estado='ACTIVO').count()
        inactivos = Inventario.objects.filter(estado='INACTIVO').count()
        en_reparacion = Inventario.objects.filter(estado='EN_REPARACION').count()
        dados_de_baja = Inventario.objects.filter(estado='DADO_DE_BAJA').count()
        
        # Distribución por categorías
        categorias = {}
        for categoria, _ in Inventario.CATEGORIA_CHOICES:
            categorias[categoria] = Inventario.objects.filter(categoria=categoria).count()
        
        return Response({
            'total': total,
            'por_estado': {
                'activos': activos,
                'inactivos': inactivos,
                'en_reparacion': en_reparacion,
                'dados_de_baja': dados_de_baja,
            },
            'por_categoria': categorias
        })