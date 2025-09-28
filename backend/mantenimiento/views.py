from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from datetime import datetime

from .models import (
    CategoriaMantenimiento, TareaMantenimiento, Material,
    IncidenteMantenimiento
)


class CategoriaListView(APIView):
    """Vista para listar categorías de mantenimiento"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        categorias = CategoriaMantenimiento.objects.all().values(
            'id', 'nombre', 'descripcion', 'color', 'activa'
        )
        return Response(list(categorias))


class TareaListView(APIView):
    """Vista para listar tareas de mantenimiento"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        tareas = TareaMantenimiento.objects.select_related('categoria').all()
        data = []
        for tarea in tareas:
            data.append({
                'id': tarea.id,
                'titulo': tarea.titulo,
                'descripcion': tarea.descripcion,
                'categoria': tarea.categoria.nombre if tarea.categoria else 'N/A',
                'tipo': tarea.tipo,
                'estado': tarea.estado,
                'prioridad': tarea.prioridad,
                'ubicacion': tarea.ubicacion,
                'fecha_programada': tarea.fecha_programada.isoformat() if tarea.fecha_programada else None,
                'costo_estimado': str(tarea.costo_estimado),
            })
        return Response(data)


class MaterialListView(APIView):
    """Vista para listar materiales"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        materiales = Material.objects.all().values(
            'id', 'nombre', 'descripcion', 'unidad_medida',
            'precio_unitario', 'stock_actual', 'stock_minimo'
        )
        return Response(list(materiales))


class IncidenteListView(APIView):
    """Vista para listar incidentes"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        incidentes = IncidenteMantenimiento.objects.all().values(
            'id', 'titulo', 'descripcion', 'ubicacion',
            'prioridad', 'estado', 'fecha_reporte'
        )
        return Response(list(incidentes))


class EstadisticasView(APIView):
    """Vista para obtener estadísticas de mantenimiento"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        total_tareas = TareaMantenimiento.objects.count()
        tareas_completadas = TareaMantenimiento.objects.filter(estado='completada').count()
        tareas_pendientes = TareaMantenimiento.objects.filter(estado='pendiente').count()
        
        estadisticas = {
            'resumen': {
                'total_tareas': total_tareas,
                'tareas_completadas': tareas_completadas,
                'tareas_pendientes': tareas_pendientes,
            },
            'fecha_generacion': datetime.now().isoformat()
        }
        
        return Response(estadisticas)
