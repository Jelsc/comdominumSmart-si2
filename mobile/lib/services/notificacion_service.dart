import 'dart:convert';
import 'dart:io';
import 'dart:async';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'auth_service.dart';

class NotificacionService {
  final AuthService _authService = AuthService();
  
  // Obtener URL base desde configuración
  Future<String> get _baseUrl async {
    // Forzar siempre la URL correcta para móvil
    const apiBaseUrl = 'http://10.0.2.2:8000';
    print('🔧 [NotificacionService] URL forzada: $apiBaseUrl');
    return '$apiBaseUrl/api/notificaciones';
  }
  
  // Forzar configuración de URL (para debugging)
  Future<void> forceUrlConfiguration() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('api_base_url', 'http://10.0.2.2:8000');
    print('🔧 [NotificacionService] URL forzada a: http://10.0.2.2:8000');
  }

  // Obtener headers con autenticación
  Future<Map<String, String>> _getHeaders() async {
    final token = await _authService.getToken();
    print('🔔 [NotificacionService] Token obtenido: ${token != null ? "SÍ" : "NO"}');
    print('🔔 [NotificacionService] Token: ${token?.substring(0, 20)}...');
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  // Obtener notificaciones del usuario
  Future<List<Notificacion>> getNotificaciones({
    bool noLeidas = false,
    String? tipo,
    String? prioridad,
  }) async {
    try {
      // Usar endpoint específico para residentes
      const baseUrl = 'http://localhost:8000/api/notificaciones/mis_notificaciones';
      print('🔔 [NotificacionService] Obteniendo notificaciones...');
      print('🔔 [NotificacionService] URL forzada: $baseUrl');
      print('🔔 [NotificacionService] FORZANDO URL CORRECTA - USANDO LOCALHOST');
      
      final headers = await _getHeaders();
      print('🔔 [NotificacionService] Headers: $headers');
      
      final queryParams = <String, String>{};
      
      if (noLeidas) {
        queryParams['no_leidas'] = 'true';
      }
      if (tipo != null) {
        queryParams['tipo'] = tipo;
      }
      if (prioridad != null) {
        queryParams['prioridad'] = prioridad;
      }

      final uri = Uri.parse(baseUrl).replace(queryParameters: queryParams);
      print('🔔 [NotificacionService] URI final: $uri');
      print('🔔 [NotificacionService] VERIFICANDO: NO DEBE SER LOCALHOST');

      print('🔔 [NotificacionService] Enviando petición GET...');
      final response = await http.get(uri, headers: headers).timeout(
        const Duration(seconds: 10),
        onTimeout: () {
          print('🔔 [NotificacionService] TIMEOUT - El servidor no respondió');
          throw Exception('Timeout: El servidor no respondió en 10 segundos');
        },
      );
      print('🔔 [NotificacionService] Respuesta recibida - Status: ${response.statusCode}');
      
      print('🔔 [NotificacionService] Status code: ${response.statusCode}');
      print('🔔 [NotificacionService] Response body: ${response.body}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data is List) {
          return data.map((json) => Notificacion.fromJson(json)).toList();
        } else if (data is Map<String, dynamic> && data['results'] != null) {
          return (data['results'] as List)
              .map((json) => Notificacion.fromJson(json))
              .toList();
        }
        return [];
      } else if (response.statusCode == 401) {
        throw Exception('Error de autenticación: Token inválido o expirado');
      } else {
        throw Exception('Error al cargar notificaciones: ${response.statusCode} - ${response.body}');
      }
    } on SocketException catch (e) {
      print('❌ [NotificacionService] Error de conexión: $e');
      final baseUrl = await _baseUrl;
      throw Exception('Error de conexión: No se pudo conectar al servidor. Verifica que el backend esté corriendo en $baseUrl');
    } on TimeoutException catch (e) {
      print('❌ [NotificacionService] Timeout: $e');
      throw Exception('Timeout: El servidor no respondió. Verifica la conexión a internet y que el backend esté corriendo.');
    } catch (e) {
      print('❌ [NotificacionService] Error: $e');
      throw Exception('Error inesperado: $e');
    }
  }

  // Obtener una notificación específica
  Future<Notificacion> getNotificacion(int id) async {
    try {
      const baseUrl = 'http://localhost:8000/api/notificaciones';
      final headers = await _getHeaders();
      final response = await http.get(
        Uri.parse('$baseUrl/$id/'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return Notificacion.fromJson(data);
      } else {
        throw Exception('Error al cargar notificación: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }

  // Marcar notificación como leída
  Future<void> marcarComoLeida(int id) async {
    try {
      const baseUrl = 'http://localhost:8000/api/notificaciones';
      final headers = await _getHeaders();
      final response = await http.post(
        Uri.parse('$baseUrl/$id/marcar_como_leida/'),
        headers: headers,
      );

      if (response.statusCode != 200 && response.statusCode != 201) {
        throw Exception('Error al marcar como leída: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }

  // Obtener estadísticas de notificaciones
  Future<NotificacionEstadisticas> getEstadisticas() async {
    try {
      const baseUrl = 'http://localhost:8000/api/notificaciones';
      final headers = await _getHeaders();
      final response = await http.get(
        Uri.parse('$baseUrl/estadisticas/'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return NotificacionEstadisticas.fromJson(data);
      } else {
        throw Exception('Error al cargar estadísticas: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }

  // Obtener notificaciones no leídas
  Future<List<Notificacion>> getNotificacionesNoLeidas() async {
    return getNotificaciones(noLeidas: true);
  }

  // Obtener notificaciones por tipo
  Future<List<Notificacion>> getNotificacionesPorTipo(String tipo) async {
    return getNotificaciones(tipo: tipo);
  }

  // Obtener notificaciones por prioridad
  Future<List<Notificacion>> getNotificacionesPorPrioridad(String prioridad) async {
    return getNotificaciones(prioridad: prioridad);
  }
}

class Notificacion {
  final int id;
  final String nombre;
  final String descripcion;
  final String tipo;
  final String estado;
  final String prioridad;
  final bool esIndividual;
  final bool requiereConfirmacion;
  final bool activa;
  final DateTime? fechaProgramada;
  final DateTime? fechaExpiracion;
  final String? creadoPor;
  final DateTime fechaCreacion;
  final DateTime fechaActualizacion;
  final List<RolDestinatario> rolesDestinatarios;

  Notificacion({
    required this.id,
    required this.nombre,
    required this.descripcion,
    required this.tipo,
    required this.estado,
    required this.prioridad,
    required this.esIndividual,
    required this.requiereConfirmacion,
    required this.activa,
    this.fechaProgramada,
    this.fechaExpiracion,
    this.creadoPor,
    required this.fechaCreacion,
    required this.fechaActualizacion,
    required this.rolesDestinatarios,
  });

  factory Notificacion.fromJson(Map<String, dynamic> json) {
    return Notificacion(
      id: json['id'] ?? 0,
      nombre: json['nombre'] ?? '',
      descripcion: json['descripcion'] ?? '',
      tipo: json['tipo'] ?? 'general',
      estado: json['estado'] ?? 'borrador',
      prioridad: json['prioridad'] ?? 'normal',
      esIndividual: json['es_individual'] ?? false,
      requiereConfirmacion: json['requiere_confirmacion'] ?? false,
      activa: json['activa'] ?? true,
      fechaProgramada: json['fecha_programada'] != null
          ? DateTime.parse(json['fecha_programada'])
          : null,
      fechaExpiracion: json['fecha_expiracion'] != null
          ? DateTime.parse(json['fecha_expiracion'])
          : null,
      creadoPor: json['creado_por'],
      fechaCreacion: DateTime.parse(json['fecha_creacion']),
      fechaActualizacion: DateTime.parse(json['fecha_actualizacion']),
      rolesDestinatarios: json['roles_destinatarios'] != null
          ? (json['roles_destinatarios'] as List)
              .map((rol) => RolDestinatario.fromJson(rol))
              .toList()
          : [],
    );
  }

  String get tipoDisplay {
    switch (tipo) {
      case 'general':
        return 'General';
      case 'mantenimiento':
        return 'Mantenimiento';
      case 'reunion':
        return 'Reunión';
      case 'aviso':
        return 'Aviso';
      case 'emergencia':
        return 'Emergencia';
      case 'pagos':
        return 'Pagos';
      case 'evento':
        return 'Evento';
      default:
        return tipo;
    }
  }

  String get estadoDisplay {
    switch (estado) {
      case 'borrador':
        return 'Borrador';
      case 'programada':
        return 'Programada';
      case 'enviada':
        return 'Enviada';
      case 'cancelada':
        return 'Cancelada';
      case 'leida':
        return 'Leída';
      default:
        return estado;
    }
  }

  String get prioridadDisplay {
    switch (prioridad) {
      case 'baja':
        return 'Baja';
      case 'normal':
        return 'Normal';
      case 'alta':
        return 'Alta';
      case 'urgente':
        return 'Urgente';
      default:
        return prioridad;
    }
  }

  bool get esLeida => estado == 'leida';
  bool get esUrgente => prioridad == 'urgente';
  bool get esAlta => prioridad == 'alta';

  String get fechaCreacionFormateada {
    return '${fechaCreacion.day}/${fechaCreacion.month}/${fechaCreacion.year}';
  }

  String get horaCreacionFormateada {
    return '${fechaCreacion.hour.toString().padLeft(2, '0')}:${fechaCreacion.minute.toString().padLeft(2, '0')}';
  }
}

class RolDestinatario {
  final int id;
  final String nombre;
  final String descripcion;

  RolDestinatario({
    required this.id,
    required this.nombre,
    required this.descripcion,
  });

  factory RolDestinatario.fromJson(Map<String, dynamic> json) {
    return RolDestinatario(
      id: json['id'] ?? 0,
      nombre: json['nombre'] ?? '',
      descripcion: json['descripcion'] ?? '',
    );
  }
}

class NotificacionEstadisticas {
  final int total;
  final Map<String, int> porEstado;
  final Map<String, int> porTipo;
  final Map<String, int> porPrioridad;
  final int individuales;
  final int activas;

  NotificacionEstadisticas({
    required this.total,
    required this.porEstado,
    required this.porTipo,
    required this.porPrioridad,
    required this.individuales,
    required this.activas,
  });

  factory NotificacionEstadisticas.fromJson(Map<String, dynamic> json) {
    return NotificacionEstadisticas(
      total: json['total'] ?? 0,
      porEstado: Map<String, int>.from(json['por_estado'] ?? {}),
      porTipo: Map<String, int>.from(json['por_tipo'] ?? {}),
      porPrioridad: Map<String, int>.from(json['por_prioridad'] ?? {}),
      individuales: json['individuales'] ?? 0,
      activas: json['activas'] ?? 0,
    );
  }

  int get noLeidas => porEstado['borrador']! + 
                     porEstado['programada']! + 
                     porEstado['enviada']!;
}
