import { api } from "@/lib/api";

// Tipos para el módulo de IA Seguridad
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

// Datos demo fallback
const demoStats: DashboardStats = {
  camaras_activas: 8,
  total_camaras: 10,
  reconocimientos_hoy: 24,
  visitantes_detectados: 6,
  alertas_activas: 3,
  vehiculos_registrados: 12,
  ingresos_hoy: 18,
  salidas_hoy: 15,
};

const demoCameras: Camera[] = [
  {
    id: 1,
    nombre: "Cámara Entrada Principal",
    ubicacion: "Portón de entrada",
    tipo: "domo",
    estado: "activa",
    ip: "192.168.1.101",
    puerto: 554,
    configuracion: {},
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-15T12:00:00Z",
  },
  {
    id: 2,
    nombre: "Cámara Estacionamiento",
    ubicacion: "Área de estacionamiento",
    tipo: "bullet",
    estado: "activa",
    ip: "192.168.1.102",
    puerto: 554,
    configuracion: {},
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-15T12:00:00Z",
  },
  {
    id: 3,
    nombre: "Cámara Piscina",
    ubicacion: "Área de piscina",
    tipo: "ptz",
    estado: "mantenimiento",
    ip: "192.168.1.103",
    puerto: 554,
    configuracion: {},
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-15T12:00:00Z",
  },
];

const demoFacialRecognitions: FacialRecognition[] = [
  {
    id: 1,
    residente_id: 1,
    residente_nombre: "Juan Pérez",
    imagen_perfil: "https://via.placeholder.com/150/0000FF/FFFFFF?text=JP",
    estado: "activo",
    fecha_registro: "2025-01-15T10:30:00Z",
    confianza_minima: 85,
    ultima_deteccion: "2025-09-28T06:30:00Z",
  },
  {
    id: 2,
    residente_id: 2,
    residente_nombre: "María González",
    imagen_perfil: "https://via.placeholder.com/150/FF0000/FFFFFF?text=MG",
    estado: "activo",
    fecha_registro: "2025-01-20T14:20:00Z",
    confianza_minima: 90,
    ultima_deteccion: "2025-09-27T18:45:00Z",
  },
  {
    id: 3,
    residente_id: 3,
    residente_nombre: "Carlos López",
    imagen_perfil: "https://via.placeholder.com/150/00FF00/FFFFFF?text=CL",
    estado: "inactivo",
    fecha_registro: "2025-01-10T09:15:00Z",
    confianza_minima: 80,
    ultima_deteccion: null,
  },
];

const demoVisitorDetections: VisitorDetection[] = [
  {
    id: 1,
    foto: "https://via.placeholder.com/200/FF6B6B/FFFFFF?text=Visitante+1",
    fecha_deteccion: "2025-09-28T08:30:00Z",
    camara: "Cámara Principal",
    estado: "no_identificado",
    confianza: 78.5,
    observaciones: "Persona no reconocida en el sistema",
    procesado: false,
  },
  {
    id: 2,
    foto: "https://via.placeholder.com/200/4ECDC4/FFFFFF?text=Visitante+2",
    fecha_deteccion: "2025-09-28T07:45:00Z",
    camara: "Cámara Entrada",
    estado: "autorizado",
    confianza: 92.3,
    observaciones: "Autorizado por administración",
    procesado: true,
  },
  {
    id: 3,
    foto: "https://via.placeholder.com/200/45B7D1/FFFFFF?text=Visitante+3",
    fecha_deteccion: "2025-09-28T06:20:00Z",
    camara: "Cámara Estacionamiento",
    estado: "denegado",
    confianza: 65.1,
    observaciones: "Acceso denegado por seguridad",
    procesado: true,
  },
];

const demoVehicleRecognitions: VehicleRecognition[] = [
  {
    id: 1,
    placa: "ABC-123",
    propietario: "Juan Pérez",
    tipo_vehiculo: "auto",
    color: "Blanco",
    foto: "https://via.placeholder.com/250/87CEEB/FFFFFF?text=ABC-123",
    fecha_reconocimiento: "2025-09-28T08:15:00Z",
    camara: "Cámara Estacionamiento",
    confianza: 95.2,
    autorizado: true,
  },
  {
    id: 2,
    placa: "XYZ-789",
    propietario: "María González",
    tipo_vehiculo: "camioneta",
    color: "Rojo",
    foto: "https://via.placeholder.com/250/FF6B6B/FFFFFF?text=XYZ-789",
    fecha_reconocimiento: "2025-09-28T07:30:00Z",
    camara: "Cámara Principal",
    confianza: 88.7,
    autorizado: true,
  },
  {
    id: 3,
    placa: "DEF-456",
    propietario: "Sin propietario",
    tipo_vehiculo: "moto",
    color: "Negro",
    foto: "https://via.placeholder.com/250/696969/FFFFFF?text=DEF-456",
    fecha_reconocimiento: "2025-09-28T06:45:00Z",
    camara: "Cámara Entrada",
    confianza: 72.4,
    autorizado: false,
  },
];

const demoSecurityAlerts: SecurityAlert[] = [
  {
    id: 1,
    tipo: "persona_desconocida",
    descripcion: "Persona no identificada detectada en área común",
    gravedad: "media",
    fecha_deteccion: "2025-09-28T08:45:00Z",
    camara: "Cámara Piscina",
    imagen_evidencia:
      "https://via.placeholder.com/300/FF6B6B/FFFFFF?text=Alerta+1",
    estado: "activa",
    asignado_a: null,
    observaciones: "",
  },
  {
    id: 2,
    tipo: "vehiculo_no_autorizado",
    descripcion: "Vehículo sin autorización en estacionamiento",
    gravedad: "alta",
    fecha_deteccion: "2025-09-28T07:20:00Z",
    camara: "Cámara Estacionamiento",
    imagen_evidencia:
      "https://via.placeholder.com/300/FF4500/FFFFFF?text=Alerta+2",
    estado: "revisada",
    asignado_a: "Administrador",
    observaciones: "En investigación",
  },
  {
    id: 3,
    tipo: "comportamiento_sospechoso",
    descripcion: "Actividad sospechosa detectada en horario nocturno",
    gravedad: "critica",
    fecha_deteccion: "2025-09-27T23:30:00Z",
    camara: "Cámara Principal",
    imagen_evidencia:
      "https://via.placeholder.com/300/DC143C/FFFFFF?text=Alerta+3",
    estado: "resuelta",
    asignado_a: "Seguridad",
    observaciones: "Falsa alarma confirmada",
  },
];

const demoAccessLogs: AccessLog[] = [
  {
    id: 1,
    tipo: "ingreso",
    persona_tipo: "residente",
    persona_id: 1,
    nombre: "Juan Pérez",
    foto: "https://via.placeholder.com/150/0000FF/FFFFFF?text=JP",
    fecha_hora: "2025-09-28T08:30:00Z",
    camara: "Cámara Principal",
    metodo_deteccion: "facial",
    autorizado: true,
    observaciones: "Reconocimiento facial exitoso - 95.2%",
  },
  {
    id: 2,
    tipo: "salida",
    persona_tipo: "visitante",
    persona_id: 2,
    nombre: "Visitante Autorizado",
    foto: "https://via.placeholder.com/150/4ECDC4/FFFFFF?text=VA",
    fecha_hora: "2025-09-28T07:45:00Z",
    camara: "Cámara Entrada",
    metodo_deteccion: "manual",
    autorizado: true,
    observaciones: "Registrado manualmente por seguridad",
  },
  {
    id: 3,
    tipo: "ingreso",
    persona_tipo: "personal",
    persona_id: 3,
    nombre: "Personal de Limpieza",
    foto: "https://via.placeholder.com/150/32CD32/FFFFFF?text=PL",
    fecha_hora: "2025-09-28T06:00:00Z",
    camara: "Cámara Servicio",
    metodo_deteccion: "qr",
    autorizado: true,
    observaciones: "Acceso con código QR",
  },
  {
    id: 4,
    tipo: "ingreso",
    persona_tipo: "residente",
    persona_id: 4,
    nombre: "María González",
    foto: "https://via.placeholder.com/150/FF0000/FFFFFF?text=MG",
    fecha_hora: "2025-09-28T09:15:00Z",
    camara: "Cámara Principal",
    metodo_deteccion: "facial",
    autorizado: true,
    observaciones: "Reconocimiento facial exitoso - 91.8%",
  },
];

// Servicios de API para IA Seguridad
export const iaSecurityService = {
  // Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const response = await api.get("/api/ia-seguridad/ia/dashboard_stats/");
      return response.data;
    } catch (error) {
      console.warn("Backend not available, using demo data");
      return demoStats;
    }
  },

  // Cámaras
  getCameras: async (): Promise<Camera[]> => {
    try {
      const response = await api.get("/api/ia-seguridad/camaras/");
      return response.data;
    } catch (error) {
      console.warn("Backend not available, using demo data");
      return demoCameras;
    }
  },

  createCamera: async (camera: Partial<Camera>): Promise<Camera> => {
    const response = await api.post("/api/ia-seguridad/camaras/", camera);
    return response.data;
  },

  updateCamera: async (
    id: number,
    camera: Partial<Camera>
  ): Promise<Camera> => {
    const response = await api.put(`/api/ia-seguridad/camaras/${id}/`, camera);
    return response.data;
  },

  deleteCamera: async (id: number): Promise<void> => {
    await api.delete(`/api/ia-seguridad/camaras/${id}/`);
  },

  testCamera: async (
    id: number
  ): Promise<{ exito: boolean; mensaje: string }> => {
    const response = await api.post(
      `/api/ia-seguridad/camaras/${id}/test_conexion/`
    );
    return response.data;
  },

  // Reconocimiento facial
  getFacialRecognitions: async (): Promise<FacialRecognition[]> => {
    try {
      const response = await api.get("/api/ia-seguridad/fotos-residentes/");
      // Transformar datos del backend al formato esperado por el frontend
      return response.data.map((item: any) => ({
        id: item.id,
        residente_id: item.residente,
        residente_nombre: `${item.residente_nombre || ""} ${
          item.residente_apellido || ""
        }`.trim(),
        imagen_perfil: item.imagen,
        estado: item.activo ? "activo" : "inactivo",
        fecha_registro: item.fecha_creacion,
        confianza_minima: 85, // valor por defecto
        ultima_deteccion: null,
      }));
    } catch (error) {
      console.warn("Backend not available, using demo data");
      return demoFacialRecognitions;
    }
  },

  createFacialRecognition: async (
    data: FormData
  ): Promise<FacialRecognition> => {
    const response = await api.post(
      "/api/ia-seguridad/fotos-residentes/",
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  updateFacialRecognition: async (
    id: number,
    data: Partial<FacialRecognition>
  ): Promise<FacialRecognition> => {
    const response = await api.put(
      `/api/ia-seguridad/fotos-residentes/${id}/`,
      data
    );
    return response.data;
  },

  deleteFacialRecognition: async (id: number): Promise<void> => {
    await api.delete(`/api/ia-seguridad/fotos-residentes/${id}/`);
  },

  trainFacialModel: async (): Promise<{ status: string; message: string }> => {
    // Simulamos el entrenamiento del modelo
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: Math.random() > 0.2 ? "success" : "error",
          message:
            Math.random() > 0.2
              ? "Modelo entrenado exitosamente"
              : "Error en el entrenamiento",
        });
      }, 2000);
    });
  },

  // Detección de visitantes
  getVisitorDetections: async (): Promise<VisitorDetection[]> => {
    try {
      const response = await api.get("/api/ia-seguridad/visitantes/");
      // Transformar datos del backend al formato esperado por el frontend
      return response.data.map((item: any) => ({
        id: item.id,
        foto: item.foto_entrada,
        fecha_deteccion: item.fecha_entrada,
        camara: "Cámara Principal", // hardcoded por ahora
        estado: item.fecha_salida ? "autorizado" : "no_identificado",
        confianza: Math.random() * 100, // simulado
        observaciones: item.observaciones || "",
        procesado: !!item.autorizado_por,
      }));
    } catch (error) {
      console.warn("Backend not available, using demo data");
      return demoVisitorDetections;
    }
  },

  updateVisitorStatus: async (
    id: number,
    status: "autorizado" | "denegado"
  ): Promise<VisitorDetection> => {
    const response = await api.put(`/api/ia-seguridad/visitantes/${id}/`, {
      estado: status,
    });
    return response.data;
  },

  processVisitor: async (
    id: number,
    observaciones: string
  ): Promise<VisitorDetection> => {
    const response = await api.put(`/api/ia-seguridad/visitantes/${id}/`, {
      observaciones,
    });
    return response.data;
  },

  // Reconocimiento de vehículos
  getVehicleRecognitions: async (): Promise<VehicleRecognition[]> => {
    try {
      const response = await api.get("/api/ia-seguridad/vehiculos/");
      // Transformar datos del backend al formato esperado por el frontend
      return response.data.map((item: any) => ({
        id: item.id,
        placa: item.placa,
        propietario: item.residente_nombre || "Sin propietario",
        tipo_vehiculo: item.tipo,
        color: item.color,
        foto: "/api/placeholder-image.jpg", // placeholder
        fecha_reconocimiento: item.fecha_registro,
        camara: "Cámara Principal",
        confianza: Math.random() * 100, // simulado
        autorizado: item.activo,
      }));
    } catch (error) {
      console.warn("Backend not available, using demo data");
      return demoVehicleRecognitions;
    }
  },

  authorizeVehicle: async (id: number): Promise<VehicleRecognition> => {
    const response = await api.put(`/api/ia-seguridad/vehiculos/${id}/`, {
      activo: true,
    });
    return response.data;
  },

  denyVehicle: async (
    id: number,
    razon: string
  ): Promise<VehicleRecognition> => {
    const response = await api.put(`/api/ia-seguridad/vehiculos/${id}/`, {
      activo: false,
    });
    return response.data;
  },

  // Alertas de seguridad
  getSecurityAlerts: async (): Promise<SecurityAlert[]> => {
    try {
      const response = await api.get("/api/ia-seguridad/alertas/");
      // Transformar datos del backend al formato esperado por el frontend
      return response.data.map((item: any) => ({
        id: item.id,
        tipo: item.tipo_alerta,
        descripcion: item.descripcion,
        gravedad: item.nivel as "baja" | "media" | "alta" | "critica",
        fecha_deteccion: item.fecha_hora,
        camara: item.camara_id,
        imagen_evidencia: item.foto_evidencia || "",
        estado: item.resuelto ? "resuelta" : "activa",
        asignado_a: item.resuelto_por ? "Administrador" : null,
        observaciones: "",
      }));
    } catch (error) {
      console.warn("Backend not available, using demo data");
      return demoSecurityAlerts;
    }
  },

  updateAlertStatus: async (
    id: number,
    estado: SecurityAlert["estado"],
    observaciones?: string
  ): Promise<SecurityAlert> => {
    if (estado === "resuelta") {
      const response = await api.post(
        `/api/ia-seguridad/alertas/${id}/resolver_alerta/`
      );
      return response.data;
    }
    const response = await api.put(`/api/ia-seguridad/alertas/${id}/`, {
      observaciones,
    });
    return response.data;
  },

  assignAlert: async (
    id: number,
    asignado_a: string
  ): Promise<SecurityAlert> => {
    const response = await api.put(`/api/ia-seguridad/alertas/${id}/`, {
      asignado_a,
    });
    return response.data;
  },

  // Registro de accesos
  getAccessLogs: async (filters?: {
    fecha_inicio?: string;
    fecha_fin?: string;
    tipo?: string;
    persona_tipo?: string;
  }): Promise<AccessLog[]> => {
    try {
      const response = await api.get("/api/ia-seguridad/registros-acceso/", {
        params: filters,
      });
      // Transformar datos del backend al formato esperado por el frontend
      return response.data.map((item: any) => ({
        id: item.id,
        tipo: item.tipo_acceso as "ingreso" | "salida",
        persona_tipo: item.tipo_persona as
          | "residente"
          | "visitante"
          | "personal",
        persona_id: item.residente?.id || item.visitante?.id || null,
        nombre: item.residente
          ? `${item.residente.nombre} ${item.residente.apellido}`
          : item.visitante?.nombre || "Persona no identificada",
        foto: item.foto_acceso,
        fecha_hora: item.fecha_hora,
        camara: item.camara_id,
        metodo_deteccion:
          item.confianza_reconocimiento > 0 ? "facial" : "manual",
        autorizado: item.confianza_reconocimiento > 50 || !!item.residente,
        observaciones: `Confianza: ${item.confianza_reconocimiento}%`,
      }));
    } catch (error) {
      console.warn("Backend not available, using demo data");
      return demoAccessLogs.filter((log) => {
        if (filters?.tipo && log.tipo !== filters.tipo) return false;
        if (filters?.persona_tipo && log.persona_tipo !== filters.persona_tipo)
          return false;
        // Más filtros podrían agregarse aquí
        return true;
      });
    }
  },

  createManualAccess: async (
    access: Partial<AccessLog>
  ): Promise<AccessLog> => {
    const response = await api.post("/api/ia-seguridad/registros-acceso/", {
      tipo_acceso: access.tipo,
      tipo_persona: access.persona_tipo,
      foto_acceso: access.foto,
      camara_id: access.camara || "manual",
    });
    return response.data;
  },

  // Análisis y reportes
  getAnalytics: async (periodo: "7d" | "30d" | "3m") => {
    // Simulamos datos de análisis
    return {
      accesos_por_dia: Array.from({ length: 7 }, (_, i) => ({
        fecha: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        ingresos: Math.floor(Math.random() * 50),
        salidas: Math.floor(Math.random() * 45),
      })),
      alertas_por_tipo: [
        { tipo: "persona_desconocida", cantidad: 12 },
        { tipo: "vehiculo_no_autorizado", cantidad: 8 },
        { tipo: "comportamiento_sospechoso", cantidad: 5 },
      ],
    };
  },

  exportAccessReport: async (filters: any) => {
    // Simulamos la exportación
    return new Blob(["Reporte de accesos..."], { type: "text/csv" });
  },

  // Control en tiempo real
  startLiveMonitoring: async () => {
    // Simulamos el inicio del monitoreo
    return { status: "iniciado", mensaje: "Monitoreo en tiempo real activado" };
  },

  stopLiveMonitoring: async () => {
    // Simulamos el fin del monitoreo
    return {
      status: "detenido",
      mensaje: "Monitoreo en tiempo real desactivado",
    };
  },

  getLiveStream: (cameraId: number): string => {
    return `${api.defaults.baseURL}/api/ia-seguridad/camaras/${cameraId}/stream/`;
  },

  // Métodos para visitantes
  getVisitantesDetectados: async (): Promise<any[]> => {
    try {
      const response = await api.get("/api/ia-seguridad/visitantes/");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  procesarVisitante: async (
    visitorId: number,
    estado: string,
    observaciones: string
  ) => {
    try {
      const response = await api.patch(
        `/api/ia-seguridad/visitantes/${visitorId}/`,
        {
          estado,
          observaciones,
          procesado: true,
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default iaSecurityService;
