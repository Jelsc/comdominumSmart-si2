from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count, Sum
from django.db.models.functions import TruncMonth
from django.utils import timezone
from datetime import datetime
from bitacora.utils import registrar_bitacora
from .models import Reserva
from areas_comunes.models import AreaComun


def add_reserva_actions(viewset_class):
    """Agrega las acciones personalizadas al ViewSet de reservas"""
    
    @action(detail=True, methods=['post'])
    def aprobar(self, request, pk=None):
        """Aprueba una reserva"""
        reserva = self.get_object()
        
        if not request.user.is_staff:
            return Response(
                {'error': 'Solo los administradores pueden aprobar reservas'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if reserva.estado != Reserva.ESTADO_PENDIENTE:
            return Response(
                {'error': 'Solo se pueden aprobar reservas pendientes'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        reserva.aprobar(request.user)
        
        # Registrar en bitácora
        registrar_bitacora(
            request=request,
            usuario=request.user,
            accion="Aprobar Reserva",
            descripcion=f"Reserva {reserva.id} aprobada",
            modulo="RESERVAS"
        )
        
        serializer = self.get_serializer(reserva)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def rechazar(self, request, pk=None):
        """Rechaza una reserva"""
        reserva = self.get_object()
        
        if not request.user.is_staff:
            return Response(
                {'error': 'Solo los administradores pueden rechazar reservas'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if reserva.estado != Reserva.ESTADO_PENDIENTE:
            return Response(
                {'error': 'Solo se pueden rechazar reservas pendientes'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        observaciones = request.data.get('observaciones', '')
        reserva.rechazar(request.user, observaciones)
        
        # Registrar en bitácora
        registrar_bitacora(
            request=request,
            usuario=request.user,
            accion="Rechazar Reserva",
            descripcion=f"Reserva {reserva.id} rechazada",
            modulo="RESERVAS"
        )
        
        serializer = self.get_serializer(reserva)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancelar(self, request, pk=None):
        """Cancela una reserva"""
        reserva = self.get_object()
        
        # Verificar permisos
        if not request.user.is_staff and not reserva.puede_cancelar():
            return Response(
                {'error': 'No se puede cancelar esta reserva'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        motivo = request.data.get('motivo', '')
        reserva.cancelar(motivo)
        
        # Registrar en bitácora
        registrar_bitacora(
            request=request,
            usuario=request.user,
            accion="Cancelar Reserva",
            descripcion=f"Reserva {reserva.id} cancelada",
            modulo="RESERVAS"
        )
        
        serializer = self.get_serializer(reserva)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def completar(self, request, pk=None):
        """Marca una reserva como completada"""
        reserva = self.get_object()
        
        if not request.user.is_staff:
            return Response(
                {'error': 'Solo los administradores pueden marcar como completada'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if reserva.estado != Reserva.ESTADO_CONFIRMADA:
            return Response(
                {'error': 'Solo se pueden completar reservas confirmadas'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        reserva.completar()
        
        # Registrar en bitácora
        registrar_bitacora(
            request=request,
            usuario=request.user,
            accion="Completar Reserva",
            descripcion=f"Reserva {reserva.id} completada",
            modulo="RESERVAS"
        )
        
        serializer = self.get_serializer(reserva)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def mis_reservas(self, request):
        """Lista las reservas del usuario actual"""
        if not hasattr(request.user, 'residente_profile'):
            return Response(
                {'error': 'Usuario no tiene perfil de residente'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset().filter(
            residente=request.user.residente_profile
        )
        
        # Aplicar filtros adicionales
        queryset = self.filter_queryset(queryset)
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def disponibles(self, request):
        """Lista las áreas comunes disponibles para reserva en una fecha"""
        fecha = request.query_params.get('fecha')
        if not fecha:
            return Response(
                {'error': 'Debe especificar una fecha'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            fecha_reserva = datetime.strptime(fecha, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Formato de fecha inválido. Use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Obtener áreas activas
        areas_activas = AreaComun.objects.filter(estado=AreaComun.ESTADO_ACTIVO)
        
        # Obtener reservas existentes para esa fecha
        reservas_existentes = Reserva.objects.filter(
            fecha_reserva=fecha_reserva,
            estado__in=[Reserva.ESTADO_PENDIENTE, Reserva.ESTADO_CONFIRMADA]
        ).values_list('area_comun_id', 'hora_inicio', 'hora_fin')
        
        # Crear lista de horarios ocupados por área
        horarios_ocupados = {}
        for area_id, hora_inicio, hora_fin in reservas_existentes:
            if area_id not in horarios_ocupados:
                horarios_ocupados[area_id] = []
            horarios_ocupados[area_id].append(f"{hora_inicio} - {hora_fin}")
        
        # Preparar respuesta
        areas_disponibles = []
        for area in areas_activas:
            area_data = {
                'id': area.id,
                'nombre': area.nombre,
                'monto_hora': area.monto_hora,
                'horarios_ocupados': horarios_ocupados.get(area.id, []),
                'disponible': area.id not in horarios_ocupados or len(horarios_ocupados[area.id]) == 0
            }
            areas_disponibles.append(area_data)
        
        return Response(areas_disponibles)
    
    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """Estadísticas de reservas"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Solo los administradores pueden ver estadísticas'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Estadísticas básicas
        total_reservas = Reserva.objects.count()
        reservas_pendientes = Reserva.objects.filter(estado=Reserva.ESTADO_PENDIENTE).count()
        reservas_confirmadas = Reserva.objects.filter(estado=Reserva.ESTADO_CONFIRMADA).count()
        reservas_canceladas = Reserva.objects.filter(estado=Reserva.ESTADO_CANCELADA).count()
        reservas_completadas = Reserva.objects.filter(estado=Reserva.ESTADO_COMPLETADA).count()
        reservas_rechazadas = Reserva.objects.filter(estado=Reserva.ESTADO_RECHAZADA).count()
        
        # Ingresos totales
        ingresos_totales = Reserva.objects.aggregate(
            total=Sum('costo_total')
        )['total'] or 0
        
        # Reservas por mes (últimos 12 meses)
        reservas_por_mes = Reserva.objects.annotate(
            mes=TruncMonth('fecha_creacion')
        ).values('mes').annotate(
            count=Count('id')
        ).order_by('mes')[:12]
        
        # Áreas más populares
        areas_populares = Reserva.objects.values(
            'area_comun__nombre'
        ).annotate(
            count=Count('id')
        ).order_by('-count')[:5]
        
        estadisticas = {
            'total_reservas': total_reservas,
            'reservas_pendientes': reservas_pendientes,
            'reservas_confirmadas': reservas_confirmadas,
            'reservas_canceladas': reservas_canceladas,
            'reservas_completadas': reservas_completadas,
            'reservas_rechazadas': reservas_rechazadas,
            'ingresos_totales': ingresos_totales,
            'reservas_por_mes': list(reservas_por_mes),
            'areas_mas_populares': list(areas_populares),
        }
        
        from .serializers import ReservaEstadisticasSerializer
        serializer = ReservaEstadisticasSerializer(estadisticas)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def proximas(self, request):
        """Lista las próximas reservas"""
        hoy = timezone.now().date()
        proximas_reservas = self.get_queryset().filter(
            fecha_reserva__gte=hoy,
            estado__in=[Reserva.ESTADO_PENDIENTE, Reserva.ESTADO_CONFIRMADA]
        ).order_by('fecha_reserva', 'hora_inicio')[:10]
        
        serializer = self.get_serializer(proximas_reservas, many=True)
        return Response(serializer.data)
    
    # Agregar los métodos al ViewSet
    viewset_class.aprobar = aprobar
    viewset_class.rechazar = rechazar
    viewset_class.cancelar = cancelar
    viewset_class.completar = completar
    viewset_class.mis_reservas = mis_reservas
    viewset_class.disponibles = disponibles
    viewset_class.estadisticas = estadisticas
    viewset_class.proximas = proximas
    
    return viewset_class
