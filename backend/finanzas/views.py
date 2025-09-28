from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse
from django.db.models import Sum, Count
from datetime import datetime, date
from decimal import Decimal

from .models import TipoCuota, Cuota, Pago, ConfiguracionFinanzas


class TipoCuotaListView(APIView):
    """Vista para listar tipos de cuota"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        tipos = TipoCuota.objects.all().values(
            'id', 'nombre', 'descripcion', 'monto_base', 
            'es_fija', 'fecha_creacion'
        )
        return Response(list(tipos))


class CuotaListView(APIView):
    """Vista para listar cuotas"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        cuotas = Cuota.objects.select_related('residente', 'tipo_cuota').all()
        data = []
        for cuota in cuotas:
            data.append({
                'id': cuota.id,
                'residente': cuota.residente.nombre if cuota.residente else 'N/A',
                'tipo_cuota': cuota.tipo_cuota.nombre if cuota.tipo_cuota else 'N/A',
                'monto': str(cuota.monto),
                'estado': cuota.estado,
                'fecha_vencimiento': cuota.fecha_vencimiento.isoformat() if cuota.fecha_vencimiento else None,
                'mes_periodo': cuota.mes_periodo.isoformat() if cuota.mes_periodo else None,
            })
        return Response(data)


class PagoListView(APIView):
    """Vista para listar pagos"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        pagos = Pago.objects.select_related('cuota', 'cuota__residente').all()
        data = []
        for pago in pagos:
            data.append({
                'id': pago.id,
                'cuota_id': pago.cuota.id if pago.cuota else None,
                'residente': pago.cuota.residente.nombre if pago.cuota and pago.cuota.residente else 'N/A',
                'monto': str(pago.monto),
                'metodo_pago': pago.metodo_pago,
                'referencia': pago.referencia,
                'fecha_pago': pago.fecha_pago.isoformat() if pago.fecha_pago else None,
                'observaciones': pago.observaciones,
            })
        return Response(data)


class EstadisticasView(APIView):
    """Vista para obtener estadísticas financieras"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Calcular estadísticas básicas
        total_cuotas = Cuota.objects.count()
        cuotas_pagadas = Cuota.objects.filter(estado='pagada').count()
        cuotas_pendientes = Cuota.objects.filter(estado='pendiente').count()
        cuotas_vencidas = Cuota.objects.filter(estado='vencida').count()
        
        # Montos
        monto_total_cuotas = Cuota.objects.aggregate(
            total=Sum('monto')
        )['total'] or Decimal('0.00')
        
        monto_pagado = Pago.objects.aggregate(
            total=Sum('monto')
        )['total'] or Decimal('0.00')
        
        estadisticas = {
            'resumen': {
                'total_cuotas': total_cuotas,
                'cuotas_pagadas': cuotas_pagadas,
                'cuotas_pendientes': cuotas_pendientes,
                'cuotas_vencidas': cuotas_vencidas,
                'porcentaje_cobranza': round((cuotas_pagadas / total_cuotas * 100) if total_cuotas > 0 else 0, 2)
            },
            'montos': {
                'total_cuotas': str(monto_total_cuotas),
                'monto_pagado': str(monto_pagado),
            },
            'fecha_generacion': datetime.now().isoformat()
        }
        
        return Response(estadisticas)


class ConfiguracionView(APIView):
    """Vista para obtener configuración financiera"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            config = ConfiguracionFinanzas.objects.first()
            if config:
                data = {
                    'id': config.id,
                    'aplica_multas_automaticas': config.aplica_multas_automaticas,
                    'dias_gracia': config.dias_gracia,
                    'porcentaje_multa': str(config.porcentaje_multa),
                    'dias_antes_vencimiento': config.dias_antes_vencimiento,
                    'descuento_pago_anticipado': str(config.descuento_pago_anticipado),
                }
                return Response(data)
            else:
                return Response({'error': 'Configuración no encontrada'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=500)
