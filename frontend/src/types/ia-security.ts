// Tipos para el módulo de IA Seguridad

export interface DetectedPerson {
  name: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  landmarks?: {
    leftEye: { x: number; y: number };
    rightEye: { x: number; y: number };
    nose: { x: number; y: number };
    mouth: { x: number; y: number };
  };
}

export interface Camera {
  id: number;
  nombre: string;
  ubicacion: string;
  tipo: string;
  estado: "activa" | "inactiva" | "mantenimiento";
  ip: string;
  puerto: number;
  configuracion: any;
  created_at: string;
  updated_at: string;
}

export interface FacialRecognition {
  id: number;
  residente_id: number;
  residente_nombre: string;
  imagen_perfil: string;
  estado: "activo" | "inactivo";
  fecha_registro: string;
  confianza_minima: number;
  ultima_deteccion: string | null;
}

export interface VisitorDetection {
  id: number;
  foto: string;
  fecha_deteccion: string;
  camara: string;
  estado: "no_identificado" | "autorizado" | "denegado";
  confianza: number;
  observaciones: string;
  procesado: boolean;
}

export interface VehicleRecognition {
  id: number;
  placa: string;
  propietario: string;
  tipo_vehiculo: string;
  color: string;
  foto: string;
  fecha_reconocimiento: string;
  camara: string;
  confianza: number;
  autorizado: boolean;
}

export interface SecurityAlert {
  id: number;
  tipo: string;
  descripcion: string;
  gravedad: "baja" | "media" | "alta" | "critica";
  fecha_deteccion: string;
  camara: string;
  imagen_evidencia: string;
  estado: "activa" | "revisada" | "resuelta" | "falsa_alarma";
  asignado_a: string | null;
  observaciones: string;
}

export interface AccessLog {
  id: number;
  tipo: "ingreso" | "salida";
  persona_tipo: "residente" | "visitante" | "personal";
  persona_id: number | null;
  nombre: string;
  foto: string;
  fecha_hora: string;
  camara: string;
  metodo_deteccion: "facial" | "manual" | "qr";
  autorizado: boolean;
  observaciones: string;
}

export interface DashboardStats {
  camaras_activas: number;
  total_camaras: number;
  reconocimientos_hoy: number;
  visitantes_detectados: number;
  alertas_activas: number;
  vehiculos_registrados: number;
  ingresos_hoy: number;
  salidas_hoy: number;
}

export interface IASecurityFilters {
  fecha_inicio?: string;
  fecha_fin?: string;
  tipo?: string;
  estado?: string;
  camara?: string;
  gravedad?: string;
}
