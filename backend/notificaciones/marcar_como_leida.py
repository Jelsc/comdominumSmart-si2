from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response

# Agregar este método a la clase NotificacionViewSet en views.py
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