class Reserva {
  final int id;
  final int areaComun;
  final AreaComunInfo? areaComunInfo;
  final int residente;
  final ResidenteInfo? residenteInfo;
  final DateTime fechaReserva;
  final String horaInicio;
  final String horaFin;
  final String tipoReserva;
  final String? motivo;
  final int numeroPersonas;
  final String estado;
  final double costoTotal;
  final DateTime fechaCreacion;
  final DateTime fechaActualizacion;
  final String? observacionesAdmin;
  final int? administradorAprobacion;
  final String? administradorNombre;
  final DateTime? fechaAprobacion;
  final double duracionHoras;
  final bool puedeCancelar;
  final bool puedeModificar;
  final bool estaActiva;

  Reserva({
    required this.id,
    required this.areaComun,
    this.areaComunInfo,
    required this.residente,
    this.residenteInfo,
    required this.fechaReserva,
    required this.horaInicio,
    required this.horaFin,
    required this.tipoReserva,
    this.motivo,
    required this.numeroPersonas,
    required this.estado,
    required this.costoTotal,
    required this.fechaCreacion,
    required this.fechaActualizacion,
    this.observacionesAdmin,
    this.administradorAprobacion,
    this.administradorNombre,
    this.fechaAprobacion,
    required this.duracionHoras,
    required this.puedeCancelar,
    required this.puedeModificar,
    required this.estaActiva,
  });

  factory Reserva.fromJson(Map<String, dynamic> json) {
    return Reserva(
      id: json['id'] ?? 0,
      areaComun: json['area_comun'] ?? 0,
      areaComunInfo: json['area_comun_info'] != null 
          ? AreaComunInfo.fromJson(json['area_comun_info']) 
          : null,
      residente: json['residente'] ?? 0,
      residenteInfo: json['residente_info'] != null 
          ? ResidenteInfo.fromJson(json['residente_info']) 
          : null,
      fechaReserva: DateTime.parse(json['fecha_reserva']),
      horaInicio: json['hora_inicio'] ?? '',
      horaFin: json['hora_fin'] ?? '',
      tipoReserva: json['tipo_reserva'] ?? 'PARTICULAR',
      motivo: json['motivo'],
      numeroPersonas: json['numero_personas'] ?? 1,
      estado: json['estado'] ?? 'PENDIENTE',
      costoTotal: _parseDouble(json['costo_total']),
      fechaCreacion: DateTime.parse(json['fecha_creacion']),
      fechaActualizacion: DateTime.parse(json['fecha_actualizacion']),
      observacionesAdmin: json['observaciones_admin'],
      administradorAprobacion: json['administrador_aprobacion'],
      administradorNombre: json['administrador_nombre'],
      fechaAprobacion: json['fecha_aprobacion'] != null 
          ? DateTime.parse(json['fecha_aprobacion']) 
          : null,
      duracionHoras: _parseDouble(json['duracion_horas']),
      puedeCancelar: json['puede_cancelar'] ?? false,
      puedeModificar: json['puede_modificar'] ?? false,
      estaActiva: json['esta_activa'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'area_comun': areaComun,
      'area_comun_info': areaComunInfo?.toJson(),
      'residente': residente,
      'residente_info': residenteInfo?.toJson(),
      'fecha_reserva': fechaReserva.toIso8601String().split('T')[0],
      'hora_inicio': horaInicio,
      'hora_fin': horaFin,
      'tipo_reserva': tipoReserva,
      'motivo': motivo,
      'numero_personas': numeroPersonas,
      'estado': estado,
      'costo_total': costoTotal,
      'fecha_creacion': fechaCreacion.toIso8601String(),
      'fecha_actualizacion': fechaActualizacion.toIso8601String(),
      'observaciones_admin': observacionesAdmin,
      'administrador_aprobacion': administradorAprobacion,
      'administrador_nombre': administradorNombre,
      'fecha_aprobacion': fechaAprobacion?.toIso8601String(),
      'duracion_horas': duracionHoras,
      'puede_cancelar': puedeCancelar,
      'puede_modificar': puedeModificar,
      'esta_activa': estaActiva,
    };
  }

  String get estadoDisplay {
    switch (estado) {
      case 'PENDIENTE':
        return 'Pendiente';
      case 'CONFIRMADA':
        return 'Confirmada';
      case 'CANCELADA':
        return 'Cancelada';
      case 'COMPLETADA':
        return 'Completada';
      case 'RECHAZADA':
        return 'Rechazada';
      default:
        return estado;
    }
  }

  String get tipoReservaDisplay {
    switch (tipoReserva) {
      case 'PARTICULAR':
        return 'Uso Particular';
      case 'EVENTO':
        return 'Evento';
      case 'REUNION':
        return 'Reunión';
      case 'DEPORTE':
        return 'Deporte';
      case 'OTRO':
        return 'Otro';
      default:
        return tipoReserva;
    }
  }

  String get fechaFormateada {
    final months = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];
    return '${fechaReserva.day} ${months[fechaReserva.month - 1]} ${fechaReserva.year}';
  }

  String get horarioFormateado {
    return '$horaInicio - $horaFin';
  }

  String get costoFormateado {
    return '\$${costoTotal.toStringAsFixed(2)}';
  }
}

class AreaComunInfo {
  final int id;
  final String nombre;
  final double montoHora;
  final String estado;
  final DateTime fechaCreacion;
  final DateTime fechaActualizacion;

  AreaComunInfo({
    required this.id,
    required this.nombre,
    required this.montoHora,
    required this.estado,
    required this.fechaCreacion,
    required this.fechaActualizacion,
  });

  factory AreaComunInfo.fromJson(Map<String, dynamic> json) {
    return AreaComunInfo(
      id: json['id'] ?? 0,
      nombre: json['nombre'] ?? '',
      montoHora: _parseDouble(json['monto_hora']),
      estado: json['estado'] ?? 'INACTIVO',
      fechaCreacion: DateTime.parse(json['created_at']),
      fechaActualizacion: DateTime.parse(json['updated_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nombre': nombre,
      'monto_hora': montoHora,
      'estado': estado,
      'created_at': fechaCreacion.toIso8601String(),
      'updated_at': fechaActualizacion.toIso8601String(),
    };
  }

  String get montoHoraFormateado {
    return '\$${montoHora.toStringAsFixed(2)}/hora';
  }
}

class ResidenteInfo {
  final int id;
  final int? usuario;
  final String? username;
  final String nombre;
  final String apellido;
  final String? ci;
  final String? email;
  final String? telefono;
  final String? unidadHabitacional;
  final String tipo;
  final DateTime fechaIngreso;
  final String estado;
  final String nombreCompleto;
  final bool puedeAcceder;
  final String estadoUsuario;
  final DateTime fechaCreacion;
  final DateTime fechaActualizacion;

  ResidenteInfo({
    required this.id,
    this.usuario,
    this.username,
    required this.nombre,
    required this.apellido,
    this.ci,
    this.email,
    this.telefono,
    this.unidadHabitacional,
    required this.tipo,
    required this.fechaIngreso,
    required this.estado,
    required this.nombreCompleto,
    required this.puedeAcceder,
    required this.estadoUsuario,
    required this.fechaCreacion,
    required this.fechaActualizacion,
  });

  factory ResidenteInfo.fromJson(Map<String, dynamic> json) {
    return ResidenteInfo(
      id: json['id'] ?? 0,
      usuario: json['usuario'],
      username: json['username'],
      nombre: json['nombre'] ?? '',
      apellido: json['apellido'] ?? '',
      ci: json['ci'],
      email: json['email'],
      telefono: json['telefono'],
      unidadHabitacional: json['unidad_habitacional'],
      tipo: json['tipo'] ?? 'inquilino',
      fechaIngreso: DateTime.parse(json['fecha_ingreso']),
      estado: json['estado'] ?? 'activo',
      nombreCompleto: json['nombre_completo'] ?? '',
      puedeAcceder: json['puede_acceder'] ?? false,
      estadoUsuario: json['estado_usuario'] ?? 'activo',
      fechaCreacion: DateTime.parse(json['fecha_creacion']),
      fechaActualizacion: DateTime.parse(json['fecha_actualizacion']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'usuario': usuario,
      'username': username,
      'nombre': nombre,
      'apellido': apellido,
      'ci': ci,
      'email': email,
      'telefono': telefono,
      'unidad_habitacional': unidadHabitacional,
      'tipo': tipo,
      'fecha_ingreso': fechaIngreso.toIso8601String().split('T')[0],
      'estado': estado,
      'nombre_completo': nombreCompleto,
      'puede_acceder': puedeAcceder,
      'estado_usuario': estadoUsuario,
      'fecha_creacion': fechaCreacion.toIso8601String(),
      'fecha_actualizacion': fechaActualizacion.toIso8601String(),
    };
  }
}

class AreaDisponible {
  final int id;
  final String nombre;
  final double montoHora;
  final List<String> horariosOcupados;
  final bool disponible;

  AreaDisponible({
    required this.id,
    required this.nombre,
    required this.montoHora,
    required this.horariosOcupados,
    required this.disponible,
  });

  factory AreaDisponible.fromJson(Map<String, dynamic> json) {
    return AreaDisponible(
      id: json['id'] ?? 0,
      nombre: json['nombre'] ?? '',
      montoHora: _parseDouble(json['monto_hora']),
      horariosOcupados: List<String>.from(json['horarios_ocupados'] ?? []),
      disponible: json['disponible'] ?? false,
    );
  }


  String get montoHoraFormateado {
    return '\$${montoHora.toStringAsFixed(2)}/hora';
  }
}

class ReservaRequest {
  final int areaComun;
  final DateTime fechaReserva;
  final String horaInicio;
  final String horaFin;
  final String tipoReserva;
  final String? motivo;
  final int numeroPersonas;

  ReservaRequest({
    required this.areaComun,
    required this.fechaReserva,
    required this.horaInicio,
    required this.horaFin,
    required this.tipoReserva,
    this.motivo,
    required this.numeroPersonas,
  });

  Map<String, dynamic> toJson() {
    return {
      'area_comun': areaComun,
      'fecha_reserva': fechaReserva.toIso8601String().split('T')[0],
      'hora_inicio': horaInicio,
      'hora_fin': horaFin,
      'tipo_reserva': tipoReserva,
      'motivo': motivo,
      'numero_personas': numeroPersonas,
    };
  }
}

// Helper function para parsear números de manera segura
double _parseDouble(dynamic value) {
  if (value == null) return 0.0;
  if (value is double) return value;
  if (value is int) return value.toDouble();
  if (value is String) {
    return double.tryParse(value) ?? 0.0;
  }
  return 0.0;
}
