import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:flutter/material.dart';

// Configuración base de la API
const String apiBaseUrl = "http://10.0.2.2:8000"; // Para emulador Android

// Tipos de datos para la API
class ApiResponse<T> {
  final bool success;
  final T? data;
  final String? error;
  final String? message;

  ApiResponse({required this.success, this.data, this.error, this.message});

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic)? fromJsonT,
  ) {
    return ApiResponse<T>(
      success: json['success'] ?? false,
      data: json['data'] != null && fromJsonT != null
          ? fromJsonT(json['data'])
          : json['data'],
      error: json['error'],
      message: json['message'],
    );
  }
}

class Residente {
  final int id;
  final String username;
  final String email;
  final String firstName;
  final String lastName;
  final String? telefono;
  final String? unidadHabitacional;
  final String tipo; // "propietario" o "inquilino"
  final String estado; // "activo", "inactivo", "suspendido", "en_proceso"
  final bool isActive;

  Residente({
    required this.id,
    required this.username,
    required this.email,
    required this.firstName,
    required this.lastName,
    this.telefono,
    this.unidadHabitacional,
    required this.tipo,
    required this.estado,
    required this.isActive,
  });

  factory Residente.fromJson(Map<String, dynamic> json) {
    return Residente(
      id: json['id'] ?? 0,
      username: json['username'] ?? '',
      email: json['email'] ?? '',
      firstName: json['nombre'] ?? json['first_name'] ?? '', // Priorizar formato de residente
      lastName: json['apellido'] ?? json['last_name'] ?? '', // Priorizar formato de residente
      telefono: json['telefono'],
      unidadHabitacional: json['unidad_habitacional'],
      tipo: json['tipo'] ?? 'inquilino',
      estado: json['estado'] ?? 'activo',
      isActive: json['puede_acceder'] ?? json['is_active'] ?? false, // Priorizar formato de residente
    );
  }

  String get nombreCompleto => '$firstName $lastName'.trim();
  String get displayName => unidadHabitacional != null
      ? '$nombreCompleto - Casa $unidadHabitacional'
      : nombreCompleto;

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'email': email,
      'nombre': firstName, // Usar formato de residente
      'apellido': lastName, // Usar formato de residente
      'telefono': telefono,
      'unidad_habitacional': unidadHabitacional,
      'tipo': tipo,
      'estado': estado,
      'puede_acceder': isActive, // Usar formato de residente
    };
  }
}

class LoginCredentials {
  final String username; // Cambiar de email a username
  final String password;
  final bool rememberMe;

  LoginCredentials({
    required this.username, // Cambiar de email a username
    required this.password,
    this.rememberMe = false,
  });

  Map<String, dynamic> toJson() {
    return {'username': username, 'password': password}; // Usar username en lugar de email
  }
}

// Clase de servicio de autenticación para residentes
class AuthService {
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal();

  // Headers por defecto
  Map<String, String> get _defaultHeaders => {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Headers con autenticación
  Future<Map<String, String>> get _authHeaders async {
    final token = await getToken();
    final headers = Map<String, String>.from(_defaultHeaders);
    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  // Función para hacer peticiones HTTP
  Future<ApiResponse<T>> _apiRequest<T>(
    String endpoint, {
    String method = 'GET',
    Map<String, dynamic>? body,
    T Function(dynamic)? fromJson,
  }) async {
    final url = Uri.parse('$apiBaseUrl$endpoint');
    final headers = await _authHeaders;

    try {
      http.Response response;

      switch (method.toUpperCase()) {
        case 'GET':
          response = await http.get(url, headers: headers);
          break;
        case 'POST':
          response = await http.post(
            url,
            headers: headers,
            body: body != null ? jsonEncode(body) : null,
          );
          break;
        case 'PUT':
          response = await http.put(
            url,
            headers: headers,
            body: body != null ? jsonEncode(body) : null,
          );
          break;
        case 'DELETE':
          response = await http.delete(url, headers: headers);
          break;
        default:
          throw Exception('Método HTTP no soportado: $method');
      }

      final responseData = jsonDecode(response.body);

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return ApiResponse<T>(
          success: true,
          data: fromJson != null ? fromJson(responseData) : responseData,
          message: responseData['message'] ?? 'Operación exitosa',
        );
      } else {
        // Extraer mensaje de error específico
        String errorMessage = 'Error en la petición';

        if (responseData['detail'] != null) {
          errorMessage = responseData['detail'];
        } else if (responseData['error'] != null) {
          errorMessage = responseData['error'];
        } else if (responseData['non_field_errors'] != null) {
          // Para errores de validación generales
          errorMessage = responseData['non_field_errors'].join(', ');
        } else {
          // Para errores de campos específicos
          List<String> fieldErrors = [];
          responseData.forEach((key, value) {
            if (value is List && value.isNotEmpty) {
              fieldErrors.add('$key: ${value.join(', ')}');
            }
          });
          if (fieldErrors.isNotEmpty) {
            errorMessage = fieldErrors.join('; ');
          }
        }

        return ApiResponse<T>(
          success: false,
          error: errorMessage,
          message: responseData['message'],
        );
      }
    } catch (e) {
      return ApiResponse<T>(success: false, error: 'Error de conexión: $e');
    }
  }

  // Función para hacer peticiones HTTP sin autenticación
  Future<ApiResponse<T>> _apiRequestWithoutAuth<T>(
    String endpoint, {
    String method = 'GET',
    Map<String, dynamic>? body,
    T Function(dynamic)? fromJson,
  }) async {
    final url = Uri.parse('$apiBaseUrl$endpoint');
    final headers = _defaultHeaders;

    try {
      http.Response response;

      switch (method.toUpperCase()) {
        case 'GET':
          response = await http.get(url, headers: headers);
          break;
        case 'POST':
          response = await http.post(
            url,
            headers: headers,
            body: body != null ? jsonEncode(body) : null,
          );
          break;
        case 'PUT':
          response = await http.put(
            url,
            headers: headers,
            body: body != null ? jsonEncode(body) : null,
          );
          break;
        case 'DELETE':
          response = await http.delete(url, headers: headers);
          break;
        default:
          throw Exception('Método HTTP no soportado: $method');
      }

      final responseData = jsonDecode(response.body);

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return ApiResponse<T>(
          success: true,
          data: fromJson != null ? fromJson(responseData) : responseData,
          message: responseData['message'] ?? 'Operación exitosa',
        );
      } else {
        // Extraer mensaje de error específico
        String errorMessage = 'Error en la petición';

        if (responseData['detail'] != null) {
          errorMessage = responseData['detail'];
        } else if (responseData['error'] != null) {
          errorMessage = responseData['error'];
        } else if (responseData['non_field_errors'] != null) {
          // Para errores de validación generales
          errorMessage = responseData['non_field_errors'].join(', ');
        } else {
          // Para errores de campos específicos
          List<String> fieldErrors = [];
          responseData.forEach((key, value) {
            if (value is List && value.isNotEmpty) {
              fieldErrors.add('$key: ${value.join(', ')}');
            }
          });
          if (fieldErrors.isNotEmpty) {
            errorMessage = fieldErrors.join('; ');
          }
        }

        return ApiResponse<T>(
          success: false,
          error: errorMessage,
          message: responseData['message'],
        );
      }
    } catch (e) {
      return ApiResponse<T>(success: false, error: 'Error de conexión: $e');
    }
  }

  // ===== MÉTODOS DE AUTENTICACIÓN =====

  // Login para residentes
  Future<ApiResponse<Residente>> login(LoginCredentials credentials) async {
    try {
      // Usar el mismo endpoint que el frontend: /api/auth/login/
      final response = await _apiRequestWithoutAuth<Map<String, dynamic>>(
        '/api/auth/login/',
        method: 'POST',
        body: credentials.toJson(),
      );

      if (response.success && response.data != null) {
        // Guardar tokens si vienen en la respuesta
        final data = response.data!;
        if (data['access'] != null) {
          await saveToken(data['access']);
        }

        // Obtener perfil del usuario usando el endpoint de perfil de usuario
        final profileResponse = await getUserProfile();
        if (profileResponse.success && profileResponse.data != null) {
          return ApiResponse<Residente>(
            success: true,
            data: profileResponse.data,
            message: 'Inicio de sesión exitoso',
          );
        } else {
          return ApiResponse<Residente>(
            success: false,
            error: 'Error al obtener perfil del usuario',
          );
        }
      } else {
        return ApiResponse<Residente>(
          success: false,
          error: response.error ?? 'Error en el login',
        );
      }
    } catch (e) {
      return ApiResponse<Residente>(
        success: false,
        error: 'Error en el login: $e',
      );
    }
  }

  // Obtener perfil del residente autenticado
  Future<ApiResponse<Residente>> getUserProfile() async {
    try {
      final response = await _apiRequest<Map<String, dynamic>>(
        '/api/residentes/mi_perfil/',
      );
      
      if (response.success && response.data != null) {
        final residenteData = response.data!;
        // Convertir los datos del residente
        final residente = Residente.fromJson(residenteData);
        
        return ApiResponse<Residente>(
          success: true,
          data: residente,
        );
      }
      
      return ApiResponse<Residente>(
        success: false,
        error: response.error ?? 'Error al obtener perfil del residente',
      );
    } catch (e) {
      return ApiResponse<Residente>(
        success: false,
        error: 'Error al obtener perfil: $e',
      );
    }
  }

  // Obtener información del residente actual (método alternativo)
  Future<ApiResponse<Residente>> getCurrentUser() async {
    try {
      final response = await _apiRequest<Map<String, dynamic>>(
        '/api/residentes/',
      );
      
      if (response.success && response.data != null) {
        final data = response.data!;
        // El endpoint devuelve un objeto paginado, tomamos el primer resultado
        if (data['results'] != null && data['results'].isNotEmpty) {
          final residenteData = data['results'][0];
          final residente = Residente.fromJson(residenteData);
          
          return ApiResponse<Residente>(
            success: true,
            data: residente,
          );
        } else {
          return ApiResponse<Residente>(
            success: false,
            error: 'No se encontró información del residente',
          );
        }
      }
      
      return ApiResponse<Residente>(
        success: false,
        error: response.error ?? 'Error al obtener datos del residente',
      );
    } catch (e) {
      return ApiResponse<Residente>(
        success: false,
        error: 'Error al obtener residente: $e',
      );
    }
  }

  // Logout
  Future<void> logout() async {
    try {
      await _apiRequest('/api/auth/logout/', method: 'POST');
    } catch (e) {
      // Ignorar errores en logout
    } finally {
      await clearToken();
    }
  }

  // ===== MÉTODOS DE TOKEN =====

  // Guardar token
  Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
  }

  // Obtener token
  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  // Limpiar token
  Future<void> clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
  }

  // Verificar si está autenticado
  Future<bool> isAuthenticated() async {
    final token = await getToken();
    return token != null;
  }

  // ===== MÉTODOS DE UI =====

  // Mostrar toast de éxito
  void showSuccessToast(String message) {
    Fluttertoast.showToast(
      msg: message,
      toastLength: Toast.LENGTH_LONG,
      gravity: ToastGravity.BOTTOM,
      backgroundColor: Colors.green,
      textColor: Colors.white,
    );
  }

  // Mostrar toast de error
  void showErrorToast(String message) {
    Fluttertoast.showToast(
      msg: message,
      toastLength: Toast.LENGTH_LONG,
      gravity: ToastGravity.BOTTOM,
      backgroundColor: Colors.red,
      textColor: Colors.white,
    );
  }
}
