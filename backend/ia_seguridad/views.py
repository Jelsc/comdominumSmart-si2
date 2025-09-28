from rest_framework import status, viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q, Count
from datetime import datetime, timedelta
import base64
import logging

from .models import (
    Camara, FotoResidente, Vehiculo, Visitante, RegistroAcceso,
    AlertaSeguridad, ConfiguracionIA, EstadisticaSeguridad
)
from .serializers import (
    CamaraSerializer, FotoResidenteSerializer, VehiculoSerializer, VisitanteSerializer,
    RegistroAccesoSerializer, AlertaSeguridadSerializer,
    ConfiguracionIASerializer, EstadisticaSeguridadSerializer,
    AnalisisImagenSerializer, ComparacionFacialSerializer,
    RegistroAccesoAutomaticoSerializer, ResultadoAnalisisSerializer
)

# Import condicional para evitar errores durante migraciones
try:
    from .ia_services import ServicioIAIntegrado
    IA_DISPONIBLE = True
except ImportError:
    IA_DISPONIBLE = False
    ServicioIAIntegrado = None

from residentes.models import Residente

logger = logging.getLogger(__name__)


class CamaraViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de cámaras"""
    queryset = Camara.objects.all()
    serializer_class = CamaraSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        estado = self.request.query_params.get('estado')
        tipo = self.request.query_params.get('tipo')
        
        if estado:
            queryset = queryset.filter(estado=estado)
        if tipo:
            queryset = queryset.filter(tipo=tipo)
            
        return queryset.order_by('nombre')
    
    @action(detail=True, methods=['post'])
    def test_conexion(self, request, pk=None):
        """Probar conexión con la cámara"""
        camara = self.get_object()
        try:
            # Aquí iría la lógica real de prueba de conexión
            # Por ahora simulamos la respuesta
            import random
            exito = random.choice([True, True, True, False])  # 75% éxito
            
            if exito:
                camara.estado = 'activa'
                camara.ultima_verificacion = timezone.now()
                camara.save()
                return Response({
                    'exito': True,
                    'mensaje': 'Conexión exitosa',
                    'latencia': f'{random.randint(10, 50)}ms'
                })
            else:
                camara.estado = 'error'
                camara.save()
                return Response({
                    'exito': False,
                    'mensaje': 'Error de conexión - Verificar configuración',
                    'error': 'Timeout'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                'exito': False,
                'mensaje': f'Error interno: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FotoResidenteViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de fotos de residentes"""
    queryset = FotoResidente.objects.all()
    serializer_class = FotoResidenteSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        residente_id = self.request.query_params.get('residente_id')
        if residente_id:
            queryset = queryset.filter(residente_id=residente_id)
        return queryset
    
    def create(self, request, *args, **kwargs):
        """Método create con logging detallado"""
        try:
            logger.info(f"=== INICIO CREATE FOTO RESIDENTE ===")
            logger.info(f"User: {request.user}")
            logger.info(f"Data: {request.data}")
            logger.info(f"Files: {request.FILES}")
            
            # Validar datos
            serializer = self.get_serializer(data=request.data)
            if not serializer.is_valid():
                logger.error(f"Errores de validación: {serializer.errors}")
                return Response(
                    {
                        'error': 'Datos inválidos',
                        'detalles': serializer.errors
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Guardar
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            
            logger.info(f"Foto creada exitosamente: {serializer.data}")
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
            
        except Exception as e:
            logger.error(f"Error inesperado en create: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return Response(
                {
                    'error': 'Error interno del servidor',
                    'detalle': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def perform_create(self, serializer):
        """Al crear una foto, generar encoding facial automáticamente"""
        foto = serializer.save()
        
        try:
            # Verificar si IA está disponible
            if not IA_DISPONIBLE or ServicioIAIntegrado is None:
                logger.info(f"IA no disponible, guardando foto {foto.id} sin encoding facial")
                return
                
            # Generar encoding facial
            servicio_ia = ServicioIAIntegrado()
            encoding = servicio_ia.reconocimiento_facial.generar_encoding_facial(
                foto.imagen.path
            )
            
            if encoding:
                foto.encoding_facial = str(encoding)
                foto.save()
                logger.info(f"Encoding facial generado para foto {foto.id}")
            else:
                logger.warning(f"No se pudo generar encoding para foto {foto.id}")
                
        except Exception as e:
            # No fallar el guardado por errores en el encoding
            logger.error(f"Error generando encoding facial: {e}")
            logger.info(f"Foto {foto.id} guardada sin encoding facial")


class VehiculoViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de vehículos"""
    queryset = Vehiculo.objects.all()
    serializer_class = VehiculoSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        residente_id = self.request.query_params.get('residente_id')
        activo = self.request.query_params.get('activo')
        
        if residente_id:
            queryset = queryset.filter(residente_id=residente_id)
        if activo is not None:
            queryset = queryset.filter(activo=activo.lower() == 'true')
            
        return queryset.order_by('-fecha_registro')
    
    @action(detail=False, methods=['get'])
    def buscar_por_placa(self, request):
        """Buscar vehículo por placa"""
        placa = request.query_params.get('placa', '').upper()
        if not placa:
            return Response({'error': 'Placa requerida'}, status=status.HTTP_400_BAD_REQUEST)
        
        vehiculo = Vehiculo.objects.filter(placa=placa, activo=True).first()
        if vehiculo:
            return Response(VehiculoSerializer(vehiculo).data)
        else:
            return Response({'message': 'Vehículo no encontrado'}, status=status.HTTP_404_NOT_FOUND)


class VisitanteViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de visitantes"""
    queryset = Visitante.objects.all()
    serializer_class = VisitanteSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        fecha_desde = self.request.query_params.get('fecha_desde')
        fecha_hasta = self.request.query_params.get('fecha_hasta')
        
        if fecha_desde:
            queryset = queryset.filter(fecha_entrada__gte=fecha_desde)
        if fecha_hasta:
            queryset = queryset.filter(fecha_entrada__lte=fecha_hasta)
            
        return queryset.order_by('-fecha_entrada')
    
    @action(detail=True, methods=['post'])
    def registrar_salida(self, request, pk=None):
        """Registrar salida de visitante"""
        visitante = self.get_object()
        if visitante.fecha_salida:
            return Response(
                {'error': 'Visitante ya tiene salida registrada'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        visitante.fecha_salida = timezone.now()
        visitante.save()
        
        return Response(VisitanteSerializer(visitante).data)


class RegistroAccesoViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para consulta de registros de acceso"""
    queryset = RegistroAcceso.objects.all()
    serializer_class = RegistroAccesoSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtros por parámetros
        tipo_acceso = self.request.query_params.get('tipo_acceso')
        tipo_persona = self.request.query_params.get('tipo_persona')
        fecha_desde = self.request.query_params.get('fecha_desde')
        fecha_hasta = self.request.query_params.get('fecha_hasta')
        
        if tipo_acceso:
            queryset = queryset.filter(tipo_acceso=tipo_acceso)
        if tipo_persona:
            queryset = queryset.filter(tipo_persona=tipo_persona)
        if fecha_desde:
            queryset = queryset.filter(fecha_hora__gte=fecha_desde)
        if fecha_hasta:
            queryset = queryset.filter(fecha_hora__lte=fecha_hasta)
            
        return queryset.order_by('-fecha_hora')


class AlertaSeguridadViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de alertas de seguridad"""
    queryset = AlertaSeguridad.objects.all()
    serializer_class = AlertaSeguridadSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtros
        resuelto = self.request.query_params.get('resuelto')
        nivel = self.request.query_params.get('nivel')
        tipo_alerta = self.request.query_params.get('tipo_alerta')
        
        if resuelto is not None:
            queryset = queryset.filter(resuelto=resuelto.lower() == 'true')
        if nivel:
            queryset = queryset.filter(nivel=nivel)
        if tipo_alerta:
            queryset = queryset.filter(tipo_alerta=tipo_alerta)
            
        return queryset.order_by('-fecha_hora')
    
    @action(detail=True, methods=['post'])
    def resolver_alerta(self, request, pk=None):
        """Marcar alerta como resuelta"""
        alerta = self.get_object()
        alerta.resuelto = True
        alerta.resuelto_por = request.user
        alerta.fecha_resolucion = timezone.now()
        alerta.save()
        
        return Response(AlertaSeguridadSerializer(alerta).data)
    
    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """Estadísticas de alertas"""
        # Alertas por nivel
        por_nivel = AlertaSeguridad.objects.values('nivel').annotate(
            count=Count('id')
        ).order_by('nivel')
        
        # Alertas por tipo
        por_tipo = AlertaSeguridad.objects.values('tipo_alerta').annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        # Alertas sin resolver
        sin_resolver = AlertaSeguridad.objects.filter(resuelto=False).count()
        
        return Response({
            'por_nivel': list(por_nivel),
            'por_tipo': list(por_tipo),
            'sin_resolver': sin_resolver
        })


class ServicioIAViewSet(viewsets.ViewSet):
    """ViewSet para servicios de IA"""
    permission_classes = [permissions.IsAuthenticated]
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if IA_DISPONIBLE:
            self.servicio_ia = ServicioIAIntegrado()
        else:
            self.servicio_ia = None
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Estadísticas para el dashboard"""
        try:
            # Contar cámaras (necesitamos crear un modelo Camera o usar configuración)
            hoy = timezone.now().date()
            
            # Estadísticas básicas
            stats = {
                'camaras_activas': 5,  # Hardcodeado hasta crear modelo Camera
                'total_camaras': 8,
                'reconocimientos_hoy': FotoResidente.objects.filter(
                    fecha_creacion__date=hoy
                ).count(),
                'visitantes_detectados': Visitante.objects.filter(
                    fecha_entrada__date=hoy
                ).count(),
                'alertas_activas': AlertaSeguridad.objects.filter(
                    resuelto=False
                ).count(),
                'vehiculos_registrados': Vehiculo.objects.filter(
                    fecha_registro__date=hoy
                ).count(),
                'ingresos_hoy': RegistroAcceso.objects.filter(
                    fecha_hora__date=hoy,
                    tipo_acceso='ingreso'
                ).count(),
                'salidas_hoy': RegistroAcceso.objects.filter(
                    fecha_hora__date=hoy,
                    tipo_acceso='salida'
                ).count(),
            }
            
            return Response(stats)
            
        except Exception as e:
            logger.error(f"Error obteniendo estadísticas dashboard: {e}")
            return Response(
                {'error': 'Error obteniendo estadísticas'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def analizar_imagen(self, request):
        """Analizar imagen con IA"""
        serializer = AnalisisImagenSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            imagen = serializer.validated_data['imagen']
            tipo_analisis = serializer.validated_data['tipo_analisis']
            
            # Leer bytes de la imagen
            imagen_bytes = imagen.read()
            
            # Procesar con IA
            resultado = self.servicio_ia.procesar_imagen_entrada(
                imagen_bytes, tipo_analisis
            )
            
            return Response(resultado)
            
        except Exception as e:
            logger.error(f"Error analizando imagen: {e}")
            return Response(
                {'error': 'Error procesando imagen'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def comparar_facial(self, request):
        """Comparar cara con residente registrado"""
        serializer = ComparacionFacialSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            residente_id = serializer.validated_data['residente_id']
            imagen_nueva = serializer.validated_data['imagen_nueva']
            tolerancia = serializer.validated_data['tolerancia']
            
            # Obtener foto de referencia del residente
            foto_referencia = FotoResidente.objects.filter(
                residente_id=residente_id,
                activo=True,
                es_principal=True
            ).first()
            
            if not foto_referencia or not foto_referencia.encoding_facial:
                return Response(
                    {'error': 'No hay foto de referencia para este residente'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Generar encoding de imagen nueva
            imagen_bytes = imagen_nueva.read()
            encoding_nuevo = self.servicio_ia.reconocimiento_facial.generar_encoding_facial(
                imagen_bytes
            )
            
            if not encoding_nuevo:
                return Response(
                    {'error': 'No se detectó cara en la imagen'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Comparar encodings
            encoding_referencia = eval(foto_referencia.encoding_facial)
            es_coincidencia, confianza = self.servicio_ia.reconocimiento_facial.comparar_caras(
                encoding_referencia, encoding_nuevo, tolerancia
            )
            
            return Response({
                'es_coincidencia': es_coincidencia,
                'confianza': confianza,
                'residente': {
                    'id': foto_referencia.residente.id,
                    'nombre': foto_referencia.residente.nombre,
                    'apellido': foto_referencia.residente.apellido
                }
            })
            
        except Exception as e:
            logger.error(f"Error comparando facial: {e}")
            return Response(
                {'error': 'Error en comparación facial'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def registrar_acceso_automatico(self, request):
        """Registro automático de acceso con IA"""
        serializer = RegistroAccesoAutomaticoSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            imagen = serializer.validated_data['imagen']
            tipo_acceso = serializer.validated_data['tipo_acceso']
            camara_id = serializer.validated_data['camara_id']
            forzar_registro = serializer.validated_data['forzar_registro']
            
            # Analizar imagen completa
            imagen_bytes = imagen.read()
            resultado_ia = self.servicio_ia.procesar_imagen_entrada(imagen_bytes, 'completo')
            
            # Intentar identificar persona
            residente_identificado = None
            confianza_facial = 0
            
            if resultado_ia['facial'] and resultado_ia['facial']['encoding']:
                # Buscar coincidencia con residentes
                encoding_nuevo = resultado_ia['facial']['encoding']
                fotos_residentes = FotoResidente.objects.filter(activo=True)
                
                mejor_coincidencia = None
                mejor_confianza = 0
                
                for foto in fotos_residentes:
                    if foto.encoding_facial:
                        try:
                            encoding_ref = eval(foto.encoding_facial)
                            es_coincidencia, confianza = self.servicio_ia.reconocimiento_facial.comparar_caras(
                                encoding_ref, encoding_nuevo
                            )
                            
                            if es_coincidencia and confianza > mejor_confianza:
                                mejor_coincidencia = foto.residente
                                mejor_confianza = confianza
                                
                        except:
                            continue
                
                if mejor_coincidencia:
                    residente_identificado = mejor_coincidencia
                    confianza_facial = mejor_confianza
            
            # Crear registro de acceso
            registro = RegistroAcceso.objects.create(
                tipo_acceso=tipo_acceso,
                tipo_persona='residente' if residente_identificado else 'desconocido',
                residente=residente_identificado,
                foto_acceso=imagen,
                confianza_reconocimiento=confianza_facial,
                placa_vehiculo=resultado_ia['placa']['texto'] if resultado_ia['placa'] else '',
                camara_id=camara_id
            )
            
            # Generar alerta si es necesario
            if not residente_identificado and not forzar_registro:
                AlertaSeguridad.objects.create(
                    tipo_alerta='persona_desconocida',
                    nivel='medio',
                    descripcion=f'Persona no identificada en {tipo_acceso}',
                    foto_evidencia=imagen,
                    camara_id=camara_id
                )
            
            return Response({
                'registro_id': registro.id,
                'residente_identificado': residente_identificado is not None,
                'residente': {
                    'id': residente_identificado.id,
                    'nombre': f"{residente_identificado.nombre} {residente_identificado.apellido}"
                } if residente_identificado else None,
                'confianza_facial': confianza_facial,
                'placa_detectada': resultado_ia['placa']['texto'] if resultado_ia['placa'] else None,
                'anomalias_detectadas': resultado_ia['anomalias']
            })
            
        except Exception as e:
            logger.error(f"Error en registro automático: {e}")
            return Response(
                {'error': 'Error en registro automático'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
