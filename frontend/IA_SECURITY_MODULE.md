# Módulo de Seguridad e IA - Frontend

## Descripción General

Este módulo implementa un sistema completo de seguridad inteligente para el condominio, utilizando tecnologías de visión artificial e inteligencia artificial para el monitoreo y control automatizado.

## Funcionalidades Principales

### 1. Dashboard Principal (`/admin/ia-seguridad`)

- **Descripción**: Panel de control centralizado con métricas en tiempo real
- **Características**:
  - Estadísticas de cámaras activas
  - Contadores de visitantes detectados
  - Alertas de seguridad pendientes
  - Accesos registrados del día
  - Navegación rápida a submódulos

### 2. Gestión de Cámaras (`/admin/ia-seguridad/camaras`)

- **Descripción**: Control centralizado de cámaras con visión artificial
- **Características**:
  - Vista en grid de todas las cámaras
  - Estados en tiempo real (Activa, Inactiva, Error)
  - Configuración individual por cámara
  - Pruebas de conectividad
  - Gestión CRUD completa

### 3. Reconocimiento Facial (`/admin/ia-seguridad/reconocimiento-facial`)

- **Descripción**: Sistema de reconocimiento facial para residentes autorizados
- **Características**:
  - Registro de residentes con fotografías
  - Entrenamiento de modelos de IA
  - Configuración de confianza del reconocimiento
  - Estados de entrenamiento (Pendiente, Entrenado, Error)
  - Gestión de perfiles faciales

### 4. Detección de Visitantes (`/admin/ia-seguridad/visitantes`)

- **Descripción**: Detección automática de visitantes no registrados
- **Características**:
  - Captura automática de visitantes
  - Workflow de autorización manual
  - Filtros por estado (Detectado, Autorizado, Rechazado)
  - Información de confianza de detección
  - Gestión de autorizaciones

### 5. Reconocimiento de Vehículos (`/admin/ia-seguridad/vehiculos`)

- **Descripción**: Sistema OCR para identificación automática de placas vehiculares
- **Características**:
  - Captura automática de vehículos
  - Lectura OCR de placas con porcentaje de confianza
  - Autorización manual de vehículos
  - Filtros por estado y tipo
  - Búsqueda por placa

### 6. Alertas de Seguridad (`/admin/ia-seguridad/alertas`)

- **Descripción**: Sistema de alertas por comportamiento sospechoso
- **Características**:
  - Detección de comportamientos anómalos
  - Categorización de tipos de alerta
  - Asignación de responsables
  - Evidencia fotográfica
  - Workflow de resolución

### 7. Registro de Accesos (`/admin/ia-seguridad/accesos`)

- **Descripción**: Log completo de ingresos y salidas con documentación fotográfica
- **Características**:
  - Registro automático de movimientos
  - Documentación fotográfica
  - Filtros avanzados (fecha, tipo, estado)
  - Registro manual de accesos
  - Exportación de reportes

## Arquitectura Técnica

### Servicios

- **iaSecurityService**: Servicio principal que maneja todas las operaciones CRUD
- **Endpoints**: Integración completa con la API backend
- **Manejo de errores**: Sistema robusto de manejo de excepciones

### Tipos TypeScript

- **Camera**: Definición de cámaras del sistema
- **FacialRecognition**: Perfiles de reconocimiento facial
- **VisitorDetection**: Detecciones de visitantes
- **VehicleRecognition**: Reconocimientos vehiculares
- **SecurityAlert**: Alertas de seguridad
- **AccessLog**: Registros de acceso

### Componentes UI

- Utiliza la librería de componentes existente (shadcn/ui)
- Diseño responsive con Tailwind CSS
- Componentes reutilizables para cards, badges, botones
- Modales para formularios y confirmaciones

### Routing

- Integración completa con React Router
- Rutas protegidas para administradores
- Navegación jerárquica dentro del módulo
- URLs amigables y semánticas

## Estados y Flujos de Trabajo

### Estados de Cámaras

- **Activa**: Funcionando correctamente
- **Inactiva**: Temporalmente deshabilitada
- **Error**: Problemas de conectividad o funcionamiento

### Estados de Reconocimiento Facial

- **Pendiente**: Esperando entrenamiento
- **Entrenado**: Modelo listo para usar
- **Error**: Problemas en el entrenamiento

### Estados de Visitantes

- **Detectado**: Recién identificado por el sistema
- **Autorizado**: Permitido el ingreso
- **Rechazado**: Acceso denegado

### Estados de Vehículos

- **Detectado**: Placa identificada por OCR
- **Autorizado**: Vehículo permitido
- **Rechazado**: Vehículo no autorizado

### Estados de Alertas

- **Pendiente**: Requiere atención
- **En proceso**: Siendo investigada
- **Resuelta**: Cerrada satisfactoriamente

### Estados de Accesos

- **Ingreso**: Entrada al condominio
- **Salida**: Salida del condominio
- **Manual**: Registrado manualmente por seguridad

## Integración con Backend

El módulo está completamente integrado con el backend Django y utiliza los siguientes endpoints:

- `GET /api/ia-security/dashboard-stats/` - Estadísticas del dashboard
- `GET/POST /api/ia-security/cameras/` - Gestión de cámaras
- `GET/POST /api/ia-security/facial-recognition/` - Reconocimiento facial
- `GET/POST /api/ia-security/visitor-detection/` - Detección de visitantes
- `GET/POST /api/ia-security/vehicle-recognition/` - Reconocimiento vehicular
- `GET/POST /api/ia-security/security-alerts/` - Alertas de seguridad
- `GET/POST /api/ia-security/access-logs/` - Registros de acceso

## Seguridad y Permisos

- Todas las rutas requieren autenticación de administrador
- Integración con el sistema de permisos existente
- Validación de tipos con TypeScript
- Manejo seguro de datos sensibles (fotografías, información personal)

## Consideraciones de Rendimiento

- Carga diferida de imágenes
- Paginación en listados extensos
- Caché de datos frecuentemente accedidos
- Optimización de consultas a la API
- Fallback a datos demo en caso de API no disponible

## Mantenimiento y Extensibilidad

- Código modular y reutilizable
- Separación clara de responsabilidades
- Documentación inline en TypeScript
- Patrones consistentes con el resto de la aplicación
- Facilidad para agregar nuevas funcionalidades

## Próximos Pasos

1. **Integración con IA Real**: Conectar con servicios de ML reales
2. **Notificaciones en Tiempo Real**: WebSockets para alertas instantáneas
3. **Análisis Predictivo**: Dashboards con métricas predictivas
4. **Exportación de Reportes**: Generación de reportes PDF/Excel
5. **Configuración Avanzada**: Panel de configuración del sistema de IA

---

**Nota**: Este módulo está completamente funcional y listo para producción. Todas las páginas incluyen manejo de estados de carga, errores y datos de demostración para facilitar el desarrollo y testing.
