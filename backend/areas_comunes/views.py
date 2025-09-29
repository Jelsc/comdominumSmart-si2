from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets

from .models import AreaComun
from .serializers import AreaComunSerializer


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


class AreaComunViewSet(viewsets.ModelViewSet):
    queryset = AreaComun.objects.all().order_by("nombre")
    serializer_class = AreaComunSerializer
    permission_classes = [IsStaffOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ("estado",)
    search_fields = ("nombre",)
