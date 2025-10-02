/// Configuración de la aplicación
class AppConfig {
  // URLs del backend
  static const String _localUrl = "http://10.0.2.2:8000";
  static const String _cloudUrl = "http://3.230.69.204:8000";
  
  // Cambiar esta variable para alternar entre local y nube
  static const bool _useCloudBackend = false; // Temporalmente local hasta que se actualice la nube
  
  /// URL base de la API
  static String get apiBaseUrl => _useCloudBackend ? _cloudUrl : _localUrl;
  
  /// URL completa de la API con el prefijo /api
  static String get apiUrl => "$apiBaseUrl/api";
  
  /// Configuración de timeouts
  static const Duration requestTimeout = Duration(seconds: 30);
  static const Duration connectionTimeout = Duration(seconds: 15);
  
  /// Configuración de la aplicación
  static const String appName = "Condominio Smart";
  static const String appVersion = "1.0.0";
  
  /// Configuración de notificaciones
  static const String notificationChannelId = "condominio_notifications";
  static const String notificationChannelName = "Notificaciones del Condominio";
  
  /// Configuración de debug
  static const bool isDebugMode = true;
  
  /// Información del entorno actual
  static String get environmentInfo => _useCloudBackend ? "Nube" : "Local";
  
  /// Método para obtener información de configuración
  static Map<String, dynamic> getConfigInfo() {
    return {
      'environment': environmentInfo,
      'apiBaseUrl': apiBaseUrl,
      'apiUrl': apiUrl,
      'appName': appName,
      'appVersion': appVersion,
      'isDebugMode': isDebugMode,
    };
  }
}

/// Enum para diferentes entornos
enum Environment {
  local,
  cloud,
  production,
}

/// Configuración avanzada por entorno
class EnvironmentConfig {
  static const Map<Environment, Map<String, String>> _configs = {
    Environment.local: {
      'baseUrl': 'http://10.0.2.2:8000',
      'name': 'Local',
    },
    Environment.cloud: {
      'baseUrl': 'http://3.230.69.204:8000',
      'name': 'Nube AWS',
    },
    Environment.production: {
      'baseUrl': 'https://tu-dominio.com',
      'name': 'Producción',
    },
  };
  
  static Map<String, String> getConfig(Environment env) {
    return _configs[env] ?? _configs[Environment.local]!;
  }
}
