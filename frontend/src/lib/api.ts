import axios from "axios";
import toast from "react-hot-toast";

/**
 * Obtiene la URL base de la API de forma dinámica
 * Prioridad:
 * 1. Variable de entorno VITE_API_URL (si existe)
 * 2. Construcción dinámica usando window.location + puerto 8000
 */
export function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL?.trim();
  if (envUrl) return envUrl.replace(/\/+$/, ''); // sin trailing slash

  // Construcción dinámica para local y producción
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:8000`;
}

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true, // habilitado para cookies/CSRF
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 segundos timeout
});

// Interceptor para requests - agregar headers necesarios
api.interceptors.request.use(
  (config) => {
    // Asegurar que Content-Type esté presente
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para responses - manejo de errores mejorado
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Manejo específico de errores
    let msg = "Error de red";
    
    if (err.response) {
      // Error del servidor
      const status = err.response.status;
      const errorData = err.response.data;
      
      if (status === 400) {
        // Bad Request - mostrar mensaje específico del backend
        msg = errorData?.detail || errorData?.message || errorData?.error || "Datos inválidos";
      } else if (status === 401) {
        msg = "No autorizado. Verifica tus credenciales.";
      } else if (status === 403) {
        msg = "No tienes permisos para realizar esta acción.";
      } else if (status === 404) {
        msg = "Recurso no encontrado.";
      } else if (status >= 500) {
        msg = "Error del servidor. Intenta nuevamente.";
      } else {
        msg = errorData?.detail || errorData?.message || `Error ${status}`;
      }
    } else if (err.request) {
      // No hubo respuesta del servidor
      msg = "No se pudo conectar al servidor. Verifica tu conexión.";
    } else {
      // Error en la configuración de la petición
      msg = err.message || "Error inesperado";
    }
    
    // Solo mostrar toast si no es un error de login (lo maneja el componente)
    if (!err.config?.url?.includes('/login/')) {
      toast.error(msg);
    }
    
    return Promise.reject(err);
  }
);

export default api;
