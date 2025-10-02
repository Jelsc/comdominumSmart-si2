import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/reserva.dart';
import '../config/app_config.dart';
import 'auth_service.dart';

class ReservaService {
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

  // Obtener todas las reservas del usuario
  Future<ApiResponse<List<Reserva>>> getMisReservas() async {
    try {
      final headers = await _getHeaders();
      final response = await http.get(
        Uri.parse('$baseUrl/reservas/mis_reservas/'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final List<dynamic> results = data['results'] ?? [];
        final reservas = results.map((json) => Reserva.fromJson(json)).toList();
        
        return ApiResponse<List<Reserva>>(
          success: true,
          data: reservas,
          message: 'Reservas obtenidas exitosamente',
        );
      } else {
        final errorData = json.decode(response.body);
        return ApiResponse<List<Reserva>>(
          success: false,
          error: errorData['error'] ?? 'Error al obtener reservas',
        );
      }
    } catch (e) {
      return ApiResponse<List<Reserva>>(
        success: false,
        error: 'Error de conexión: $e',
      );
    }
  }

  // Obtener áreas disponibles para una fecha
  Future<ApiResponse<List<AreaDisponible>>> getAreasDisponibles(DateTime fecha) async {
    try {
      final headers = await _getHeaders();
      final fechaStr = fecha.toIso8601String().split('T')[0];
      final response = await http.get(
        Uri.parse('$baseUrl/reservas/disponibles/?fecha=$fechaStr'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        final areas = data.map((json) => AreaDisponible.fromJson(json)).toList();
        
        return ApiResponse<List<AreaDisponible>>(
          success: true,
          data: areas,
          message: 'Áreas disponibles obtenidas exitosamente',
        );
      } else {
        final errorData = json.decode(response.body);
        return ApiResponse<List<AreaDisponible>>(
          success: false,
          error: errorData['error'] ?? 'Error al obtener áreas disponibles',
        );
      }
    } catch (e) {
      return ApiResponse<List<AreaDisponible>>(
        success: false,
        error: 'Error de conexión: $e',
      );
    }
  }

  // Crear una nueva reserva
  Future<ApiResponse<Reserva>> crearReserva(ReservaRequest request) async {
    try {
      final headers = await _getHeaders();
      final response = await http.post(
        Uri.parse('$baseUrl/reservas/'),
        headers: headers,
        body: json.encode(request.toJson()),
      );

      if (response.statusCode == 201) {
        final data = json.decode(response.body);
        final reserva = Reserva.fromJson(data);
        
        return ApiResponse<Reserva>(
          success: true,
          data: reserva,
          message: 'Reserva creada exitosamente',
        );
      } else {
        final errorData = json.decode(response.body);
        return ApiResponse<Reserva>(
          success: false,
          error: errorData['error'] ?? 'Error al crear reserva',
        );
      }
    } catch (e) {
      return ApiResponse<Reserva>(
        success: false,
        error: 'Error de conexión: $e',
      );
    }
  }

  // Obtener una reserva específica
  Future<ApiResponse<Reserva>> getReserva(int id) async {
    try {
      final headers = await _getHeaders();
      final response = await http.get(
        Uri.parse('$baseUrl/reservas/$id/'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final reserva = Reserva.fromJson(data);
        
        return ApiResponse<Reserva>(
          success: true,
          data: reserva,
          message: 'Reserva obtenida exitosamente',
        );
      } else {
        final errorData = json.decode(response.body);
        return ApiResponse<Reserva>(
          success: false,
          error: errorData['error'] ?? 'Error al obtener reserva',
        );
      }
    } catch (e) {
      return ApiResponse<Reserva>(
        success: false,
        error: 'Error de conexión: $e',
      );
    }
  }

  // Actualizar una reserva
  Future<ApiResponse<Reserva>> actualizarReserva(int id, ReservaRequest request) async {
    try {
      final headers = await _getHeaders();
      final response = await http.put(
        Uri.parse('$baseUrl/reservas/$id/'),
        headers: headers,
        body: json.encode(request.toJson()),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final reserva = Reserva.fromJson(data);
        
        return ApiResponse<Reserva>(
          success: true,
          data: reserva,
          message: 'Reserva actualizada exitosamente',
        );
      } else {
        final errorData = json.decode(response.body);
        return ApiResponse<Reserva>(
          success: false,
          error: errorData['error'] ?? 'Error al actualizar reserva',
        );
      }
    } catch (e) {
      return ApiResponse<Reserva>(
        success: false,
        error: 'Error de conexión: $e',
      );
    }
  }

  // Cancelar una reserva
  Future<ApiResponse<Reserva>> cancelarReserva(int id, {String? motivo}) async {
    try {
      final headers = await _getHeaders();
      final body = motivo != null ? json.encode({'motivo': motivo}) : '{}';
      final response = await http.post(
        Uri.parse('$baseUrl/reservas/$id/cancelar/'),
        headers: headers,
        body: body,
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final reserva = Reserva.fromJson(data);
        
        return ApiResponse<Reserva>(
          success: true,
          data: reserva,
          message: 'Reserva cancelada exitosamente',
        );
      } else {
        final errorData = json.decode(response.body);
        return ApiResponse<Reserva>(
          success: false,
          error: errorData['error'] ?? 'Error al cancelar reserva',
        );
      }
    } catch (e) {
      return ApiResponse<Reserva>(
        success: false,
        error: 'Error de conexión: $e',
      );
    }
  }

  // Eliminar una reserva
  Future<ApiResponse<void>> eliminarReserva(int id) async {
    try {
      final headers = await _getHeaders();
      final response = await http.delete(
        Uri.parse('$baseUrl/reservas/$id/'),
        headers: headers,
      );

      if (response.statusCode == 204) {
        return ApiResponse<void>(
          success: true,
          message: 'Reserva eliminada exitosamente',
        );
      } else {
        final errorData = json.decode(response.body);
        return ApiResponse<void>(
          success: false,
          error: errorData['error'] ?? 'Error al eliminar reserva',
        );
      }
    } catch (e) {
      return ApiResponse<void>(
        success: false,
        error: 'Error de conexión: $e',
      );
    }
  }

  // Obtener próximas reservas
  Future<ApiResponse<List<Reserva>>> getProximasReservas() async {
    try {
      final headers = await _getHeaders();
      final response = await http.get(
        Uri.parse('$baseUrl/reservas/proximas/'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        final reservas = data.map((json) => Reserva.fromJson(json)).toList();
        
        return ApiResponse<List<Reserva>>(
          success: true,
          data: reservas,
          message: 'Próximas reservas obtenidas exitosamente',
        );
      } else {
        final errorData = json.decode(response.body);
        return ApiResponse<List<Reserva>>(
          success: false,
          error: errorData['error'] ?? 'Error al obtener próximas reservas',
        );
      }
    } catch (e) {
      return ApiResponse<List<Reserva>>(
        success: false,
        error: 'Error de conexión: $e',
      );
    }
  }
}

// Clase para manejar respuestas de la API
class ApiResponse<T> {
  final bool success;
  final T? data;
  final String? error;
  final String? message;

  ApiResponse({
    required this.success,
    this.data,
    this.error,
    this.message,
  });
}
