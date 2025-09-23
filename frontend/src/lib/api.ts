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
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err?.response?.data?.detail || err.message || "Error de red";
    toast.error(msg);
    return Promise.reject(err);
  }
);
