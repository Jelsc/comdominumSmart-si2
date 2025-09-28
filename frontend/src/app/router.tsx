import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AdminPage from "../pages/admin/admin.page";
import AdminLoginPage from "@/pages/auth/AdminLoginPage";
import ProtectedRoute from "@/app/auth/ProtectedRoute";
import PermisosCRUD from "../pages/admin/usuarios/roles-permisos/permiso";
import RolForm from "../pages/admin/usuarios/roles-permisos/rol";
import BitacoraPage from "@/pages/admin/bitacora.page";
import PersonalPage from "../pages/admin/personal/personal.page";
import ResidentesPage from "../pages/admin/residentes/residentes.page";
import UsuariosPage from "../pages/admin/usuarios/users.page";
import NotificacionesPage from "../pages/admin/notificaciones/notificaciones.page";
import AccountSettingsPage from "./auth/account-settings.page";

// IA Security Module
import IASecurityDashboard from "../pages/admin/ia-seguridad/dashboard.page";
import CameraManagementPage from "../pages/admin/ia-seguridad/camaras.page";
import FacialRecognitionPage from "../pages/admin/ia-seguridad/reconocimiento-facial.page";
import VisitorDetectionPage from "../pages/admin/ia-seguridad/visitantes.page";
import VehicleRecognitionPage from "../pages/admin/ia-seguridad/vehiculos.page";
import SecurityAlertsPage from "../pages/admin/ia-seguridad/alertas.page";
import AccessLogPage from "../pages/admin/ia-seguridad/accesos.page";

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        {/* Rutas protegidas de administración */}
        <Route
          path="/admin/permisos"
          element={
            <ProtectedRoute requireAdmin={true}>
              <PermisosCRUD />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/roles"
          element={
            <ProtectedRoute requireAdmin={true}>
              <RolForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/bitacora"
          element={
            <ProtectedRoute requireAdmin={true}>
              <BitacoraPage />
            </ProtectedRoute>
          }
        />
        {/* auth */}
        {/* Ya no hay login/registro de cliente en web: redirigir a /admin */}
        <Route path="/login" element={<Navigate to="/admin" replace />} />
        <Route path="/register" element={<Navigate to="/admin" replace />} />
        <Route
          path="/email-verification"
          element={<Navigate to="/admin" replace />}
        />
        <Route
          path="/code-verification"
          element={<Navigate to="/admin" replace />}
        />

        {/* admin */}
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route
          path="/admin/home"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        {/* Otras rutas de admin protegidas */}
        <Route
          path="/admin/flotas"
          element={
            <ProtectedRoute requireAdmin={true}>
              <div>Flotas (por implementar)</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/residentes"
          element={
            <ProtectedRoute requireAdmin={true}>
              <ResidentesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/personal"
          element={
            <ProtectedRoute requireAdmin={true}>
              <PersonalPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/usuarios"
          element={
            <ProtectedRoute requireAdmin={true}>
              <UsuariosPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/notificaciones"
          element={
            <ProtectedRoute requireAdmin={true}>
              <NotificacionesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/mantenimiento"
          element={
            <ProtectedRoute requireAdmin={true}>
              <div>Mantenimiento (por implementar)</div>
            </ProtectedRoute>
          }
        />

        {/* IA Security Module Routes */}
        <Route
          path="/admin/ia-seguridad"
          element={
            <ProtectedRoute requireAdmin={true}>
              <IASecurityDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/ia-seguridad/camaras"
          element={
            <ProtectedRoute requireAdmin={true}>
              <CameraManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/ia-seguridad/reconocimiento-facial"
          element={
            <ProtectedRoute requireAdmin={true}>
              <FacialRecognitionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/ia-seguridad/visitantes"
          element={
            <ProtectedRoute requireAdmin={true}>
              <VisitorDetectionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/ia-seguridad/vehiculos"
          element={
            <ProtectedRoute requireAdmin={true}>
              <VehicleRecognitionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/ia-seguridad/alertas"
          element={
            <ProtectedRoute requireAdmin={true}>
              <SecurityAlertsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/ia-seguridad/accesos"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AccessLogPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/rutas"
          element={
            <ProtectedRoute requireAdmin={true}>
              <div>Rutas (por implementar)</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/ventas"
          element={
            <ProtectedRoute requireAdmin={true}>
              <div>Ventas (por implementar)</div>
            </ProtectedRoute>
          }
        />

        {/* rutas de usuario ya no aplican en web; mantener settings solo para admin */}
        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AccountSettingsPage />
            </ProtectedRoute>
          }
        />

        {/* catch-all: redirigir al login de admin */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Router>
  );
}
