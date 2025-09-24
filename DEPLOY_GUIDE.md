# 🚀 Sistema de Detección Automática de Entorno

## ✨ Características Principales

Este monorepo incluye un **sistema inteligente de detección automática** que configura las URLs de la API sin necesidad de configuración manual, funcionando perfectamente en:

- 🏠 **Desarrollo Local** (`localhost:5173` → `localhost:8000`)
- 🐳 **Docker Local** (`localhost:5173` → `localhost:8000`)
- ☁️ **Producción/Nube** (`cualquier-ip:5173` → `misma-ip:8000`)
- 🔄 **IP Dinámicas** - Si la IP cambia, se adapta automáticamente

## 🧠 Cómo Funciona la Detección Automática

### Frontend (React + Vite)

```typescript
// frontend/src/lib/api.ts
export function getApiBaseUrl(): string {
  // 1. Si hay variable de entorno, úsala
  const envUrl = import.meta.env.VITE_API_URL?.trim();
  if (envUrl) return envUrl;

  // 2. Detección automática basada en window.location
  const { protocol, hostname } = window.location;

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    // 🏠 Entorno local → localhost:8000
    return `${protocol}//localhost:8000`;
  } else {
    // ☁️ Entorno de producción → misma-ip:8000
    return `${protocol}//${hostname}:8000`;
  }
}
```

### Backend (Django)

```python
# backend/core/settings.py
def get_allowed_hosts():
    """Configura automáticamente hosts permitidos"""
    return ["*"]  # Máxima compatibilidad

def configure_cors():
    """Configura CORS automáticamente"""
    return True, []  # Permite todos los orígenes
```

## 🎯 Casos de Uso Automáticos

| Entorno              | Frontend URL               | API URL                    | Configuración Necesaria |
| -------------------- | -------------------------- | -------------------------- | ----------------------- |
| **Desarrollo Local** | `http://localhost:5173`    | `http://localhost:8000`    | ✅ NINGUNA              |
| **Docker Local**     | `http://localhost:5173`    | `http://localhost:8000`    | ✅ NINGUNA              |
| **EC2 (Ejemplo)**    | `http://3.230.69.204:5173` | `http://3.230.69.204:8000` | ✅ NINGUNA              |
| **IP Nueva**         | `http://1.2.3.4:5173`      | `http://1.2.3.4:8000`      | ✅ NINGUNA              |
| **Dominio**          | `https://miapp.com:5173`   | `https://miapp.com:8000`   | ✅ NINGUNA              |

## 🚀 Comandos de Despliegue

### Desarrollo Local

```bash
# Frontend
cd frontend && npm run dev

# Backend (en otra terminal)
cd backend && python manage.py runserver
```

### Docker (Local)

```bash
docker-compose up --build
```

### Producción (EC2/Nube)

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/comdominumSmart-si2.git
cd comdominumSmart-si2

# Ejecutar con Docker
docker-compose up --build -d

# ¡Eso es todo! No necesitas configurar IPs ni URLs
```

## 🔧 Variables de Entorno (OPCIONALES)

### Frontend (.env - OPCIONAL)

```bash
# Detección automática habilitada por defecto
VITE_API_URL=  # Vacío = detección automática

# Solo especifica si necesitas override manual
# VITE_API_URL=http://mi-api-personalizada:8000
```

### Backend (.env - OPCIONAL)

```bash
# Configuración automática habilitada por defecto
# DJANGO_ALLOWED_HOSTS=*  # Permite cualquier host
# CORS_ALLOW_ALL_ORIGINS=True  # Permite todos los orígenes

# Solo especifica si necesitas restricciones específicas
```

## 📋 Logs de Depuración

El sistema incluye logs automáticos que te muestran cómo se está configurando:

```bash
# Frontend (Consola del navegador)
🏠 [API] Entorno local detectado → localhost:8000
🎯 [API] URL final de la API: http://localhost:8000

# Backend (Consola del servidor)
🌐 [Django] Hosts automáticos configurados: ['*']
🌍 [Django] CORS configurado para permitir TODOS los orígenes
🎨 [Django] Frontend URLs configuradas: http://localhost:5173, http://127.0.0.1:5173
```

## 🛠️ Solución de Problemas

### ❌ Problema: API no conecta

```bash
# Verificar que el backend esté ejecutándose
curl http://localhost:8000/api/

# Ver logs del frontend en el navegador (F12 → Console)
🎯 [API] URL final de la API: http://...
```

### ❌ Problema: CORS bloqueado

```bash
# El sistema permite todos los orígenes por defecto
# Si necesitas restricciones específicas, configura:
CORS_ALLOW_ALL_ORIGINS=False
FRONTEND_URL=http://tu-frontend-especifico:5173
```

### ❌ Problema: IP cambió en la nube

```bash
# ✅ No hay problema - se detecta automáticamente
# El sistema usa window.location para construir la URL
```

## 🎉 Beneficios del Sistema Automático

1. **🔄 Zero Configuration**: Funciona sin configuración inicial
2. **🌐 Universal**: Compatible con cualquier IP o dominio
3. **🐳 Docker Friendly**: Se adapta a contenedores automáticamente
4. **☁️ Cloud Ready**: Funciona en cualquier proveedor de nube
5. **🛡️ Error Resistant**: Si la IP cambia, sigue funcionando
6. **📊 Debug Friendly**: Logs claros para depuración

---

**¡Despliega en cualquier lugar sin configuración! 🚀**
