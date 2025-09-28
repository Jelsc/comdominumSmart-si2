from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from datetime import datetime

from .models import AreaComun, Reserva, PagoReserva


class AreaComunListView(APIView):
    """Vista para listar áreas comunes"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        areas = AreaComun.objects.all().values(
            'id', 'nombre', 'descripcion', 'capacidad_maxima',
            'precio_por_hora', 'activa', 'requiere_pago'
        )
        return Response(list(areas))


class ReservaListView(APIView):
    """Vista para listar reservas"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        reservas = Reserva.objects.select_related('area_comun', 'residente').all()
        data = []
        for reserva in reservas:
            data.append({
                'id': reserva.id,
                'area_comun': reserva.area_comun.nombre if reserva.area_comun else 'N/A',
                'residente': reserva.residente.nombre if reserva.residente else 'N/A',
                'fecha_reserva': reserva.fecha_reserva.isoformat() if reserva.fecha_reserva else None,
                'hora_inicio': str(reserva.hora_inicio),
                'hora_fin': str(reserva.hora_fin),
                'estado': reserva.estado,
                'numero_personas': reserva.numero_personas,
                'costo_total': str(reserva.costo_total),
            })
        return Response(data)


class PagoReservaListView(APIView):
    """Vista para listar pagos de reservas"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        pagos = PagoReserva.objects.select_related('reserva').all()
        data = []
        for pago in pagos:
            data.append({
                'id': pago.id,
                'reserva_id': pago.reserva.id if pago.reserva else None,
                'monto': str(pago.monto),
                'metodo_pago': pago.metodo_pago,
                'fecha_pago': pago.fecha_pago.isoformat() if pago.fecha_pago else None,
                'referencia': pago.referencia,
            })
        return Response(data)


class EstadisticasView(APIView):
    """Vista para obtener estadísticas de reservas"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        total_reservas = Reserva.objects.count()
        areas_disponibles = AreaComun.objects.filter(activa=True).count()
        reservas_activas = Reserva.objects.filter(estado='confirmada').count()
        
        estadisticas = {
            'resumen': {
                'total_reservas': total_reservas,
                'areas_disponibles': areas_disponibles,
                'reservas_activas': reservas_activas,
            },
            'fecha_generacion': datetime.now().isoformat()
        }
        
        return Response(estadisticas)
