import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AdminPage from "../pages/admin/admin.page";
import AdminLoginPage from "@/pages/auth/AdminLoginPage";
import ProtectedRoute from "@/app/auth/ProtectedRoute";
import PermisosCRUD from "../pages/admin/usuarios/roles-permisos/permiso";
import RolForm from "../pages/admin/usuarios/roles-permisos/rol";
import BitacoraPage from "@/pages/admin/bitacora.page";
import PersonalPage from "../pages/admin/personal/personal.page";
import ConductoresPage from "../pages/admin/conductores/driver.page";
import UsuariosPage from "../pages/admin/usuarios/users.page";
import AccountSettingsPage from "./auth/account-settings.page";

export default function AppRouter() {
  return (
    <Router>
      <Routes>
  <Route path="/" element={<Navigate to="/admin" replace />} />
        {/* Rutas protegidas de administración */}
        <Route
          path="/admin/roles-permisos/permisos"
          element={
            <ProtectedRoute requireAdmin={true}>
              <PermisosCRUD />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/roles-permisos/rol"
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
  <Route path="/email-verification" element={<Navigate to="/admin" replace />} />
  <Route path="/code-verification" element={<Navigate to="/admin" replace />} />

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
          path="/admin/conductores"
          element={
            <ProtectedRoute requireAdmin={true}>
              <ConductoresPage />
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
          path="/admin/mantenimiento"
          element={
            <ProtectedRoute requireAdmin={true}>
              <div>Mantenimiento (por implementar)</div>
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
