import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth_service.dart';
import '../models/notificacion.dart';
import '../config/app_config.dart';

class NotificacionService {
  String get baseUrl => '${AppConfig.apiBaseUrl}/api';
  final AuthService _authService = AuthService();

  // Headers para las peticiones autenticadas
  Future<Map<String, String>> _getHeaders() async {
    final token = await _authService.getToken();
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
      final headers = await _getHeaders();
      
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

      final uri = Uri.parse('$baseUrl/notificaciones/mis_notificaciones/').replace(queryParameters: queryParams);
      final response = await http.get(uri, headers: headers);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data is List) {
          return data.map((json) => Notificacion.fromJson(json)).toList();
        }
        return [];
      } else {
        throw Exception('Error al cargar notificaciones: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      throw Exception('Error inesperado: $e');
    }
  }

  // Obtener una notificación específica
  Future<Notificacion> getNotificacion(int id) async {
    try {
      final headers = await _getHeaders();
      final response = await http.get(
        Uri.parse('$baseUrl/notificaciones/$id/'),
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
      final headers = await _getHeaders();
      final response = await http.post(
        Uri.parse('$baseUrl/notificaciones/$id/marcar_como_leida/'),
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
      final headers = await _getHeaders();
      final response = await http.get(
        Uri.parse('$baseUrl/notificaciones/estadisticas/'),
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
}