class Notificacion {
  final int id;
  final String nombre;
  final String descripcion;
  final String tipo;
  final String tipoDisplay;
  final String estado;
  final String estadoDisplay;
  final String prioridad;
  final String prioridadDisplay;
  final bool esIndividual;
  final bool requiereConfirmacion;
  final bool activa;
  final String? fechaProgramada;
  final String? fechaExpiracion;
  final String fechaCreacion;
  final String fechaActualizacion;
  final List<int> rolesDestinatarios;
  final List<Map<String, dynamic>> rolesDestinatariosInfo;
  final Map<String, dynamic>? creadoPorInfo;
  final int totalDestinatarios;

  Notificacion({
    required this.id,
    required this.nombre,
    required this.descripcion,
    required this.tipo,
    required this.tipoDisplay,
    required this.estado,
    required this.estadoDisplay,
    required this.prioridad,
    required this.prioridadDisplay,
    required this.esIndividual,
    required this.requiereConfirmacion,
    required this.activa,
    this.fechaProgramada,
    this.fechaExpiracion,
    required this.fechaCreacion,
    required this.fechaActualizacion,
    required this.rolesDestinatarios,
    required this.rolesDestinatariosInfo,
    this.creadoPorInfo,
    required this.totalDestinatarios,
  });

  factory Notificacion.fromJson(Map<String, dynamic> json) {
    return Notificacion(
      id: _parseInt(json['id']),
      nombre: _parseString(json['nombre']),
      descripcion: _parseString(json['descripcion']),
      tipo: _parseString(json['tipo']),
      tipoDisplay: _parseString(json['tipo_display']),
      estado: _parseString(json['estado']),
      estadoDisplay: _parseString(json['estado_display']),
      prioridad: _parseString(json['prioridad']),
      prioridadDisplay: _parseString(json['prioridad_display']),
      esIndividual: _parseBool(json['es_individual']),
      requiereConfirmacion: _parseBool(json['requiere_confirmacion']),
      activa: _parseBool(json['activa']),
      fechaProgramada: _parseString(json['fecha_programada']),
      fechaExpiracion: _parseString(json['fecha_expiracion']),
      fechaCreacion: _parseString(json['fecha_creacion']),
      fechaActualizacion: _parseString(json['fecha_actualizacion']),
      rolesDestinatarios: _parseIntList(json['roles_destinatarios']),
      rolesDestinatariosInfo: _parseMapList(json['roles_destinatarios_info']),
      creadoPorInfo: json['creado_por_info'] != null ? Map<String, dynamic>.from(json['creado_por_info']) : null,
      totalDestinatarios: _parseInt(json['total_destinatarios']),
    );
  }

  static int _parseInt(dynamic value) {
    if (value is int) return value;
    if (value is String) return int.tryParse(value) ?? 0;
    return 0;
  }

  static String _parseString(dynamic value) {
    if (value is String) return value;
    if (value is int) return value.toString();
    return '';
  }

  static bool _parseBool(dynamic value) {
    if (value is bool) return value;
    if (value is String) return value.toLowerCase() == 'true';
    if (value is int) return value == 1;
    return false;
  }

  static List<int> _parseIntList(dynamic value) {
    if (value is List) {
      return value.map((e) => _parseInt(e)).toList();
    }
    return [];
  }

  static List<Map<String, dynamic>> _parseMapList(dynamic value) {
    if (value is List) {
      return value.map((e) => Map<String, dynamic>.from(e)).toList();
    }
    return [];
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nombre': nombre,
      'descripcion': descripcion,
      'tipo': tipo,
      'tipo_display': tipoDisplay,
      'estado': estado,
      'estado_display': estadoDisplay,
      'prioridad': prioridad,
      'prioridad_display': prioridadDisplay,
      'es_individual': esIndividual,
      'requiere_confirmacion': requiereConfirmacion,
      'activa': activa,
      'fecha_programada': fechaProgramada,
      'fecha_expiracion': fechaExpiracion,
      'fecha_creacion': fechaCreacion,
      'fecha_actualizacion': fechaActualizacion,
      'roles_destinatarios': rolesDestinatarios,
      'roles_destinatarios_info': rolesDestinatariosInfo,
      'creado_por_info': creadoPorInfo,
      'total_destinatarios': totalDestinatarios,
    };
  }
}

class NotificacionEstadisticas {
  final int total;
  final int noLeidas;
  final int leidas;
  final int porTipo;

  NotificacionEstadisticas({
    required this.total,
    required this.noLeidas,
    required this.leidas,
    required this.porTipo,
  });

  factory NotificacionEstadisticas.fromJson(Map<String, dynamic> json) {
    return NotificacionEstadisticas(
      total: _parseInt(json['total']),
      noLeidas: _parseInt(json['no_leidas']),
      leidas: _parseInt(json['leidas']),
      porTipo: _parseInt(json['por_tipo']),
    );
  }

  static int _parseInt(dynamic value) {
    if (value is int) return value;
    if (value is String) return int.tryParse(value) ?? 0;
    return 0;
  }
}
