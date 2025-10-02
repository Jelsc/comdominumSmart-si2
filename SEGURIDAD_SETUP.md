# Configuración del Módulo de Seguridad

## Descripción

El módulo de seguridad implementa reconocimiento facial usando AWS Rekognition y OCR de placas usando Google Vision API, específicamente optimizado para placas bolivianas.

## Configuración Requerida

### 1. Variables de Entorno del Backend

Agregar las siguientes variables al archivo `.env` del backend:

```bash
# ====== CONFIGURACIÓN DE SEGURIDAD E IA ======
# AWS Rekognition
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_REKOGNITION_COLLECTION_ID=condominio-rostros

# Google Vision API
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/google-credentials.json
```

### 2. Configuración de AWS Rekognition

1. **Crear cuenta en AWS** y configurar IAM:

   - Crear un usuario IAM con permisos para Amazon Rekognition
   - Política recomendada: `AmazonRekognitionFullAccess`

2. **Crear colección de rostros**:

   ```bash
   # El sistema creará automáticamente la colección "condominio-rostros"
   # O puedes crearla manualmente en la consola de AWS
   ```

3. **Configurar credenciales**:
   - Obtener Access Key ID y Secret Access Key
   - Configurar en las variables de entorno

### 3. Configuración de Google Vision API

1. **Habilitar Google Vision API**:

   - Ir a [Google Cloud Console](https://console.cloud.google.com/)
   - Habilitar la API de Vision
   - Crear credenciales de servicio

2. **Descargar credenciales**:
   - Descargar el archivo JSON de credenciales
   - Colocar en el servidor y configurar la ruta en `GOOGLE_APPLICATION_CREDENTIALS`

### 4. Instalación de Dependencias

Las dependencias ya están incluidas en `requirements.txt`:

- `boto3>=1.34.0` - Para AWS Rekognition
- `google-cloud-vision>=3.4.0` - Para Google Vision API
- `Pillow>=10.0.0` - Para procesamiento de imágenes

### 5. Migraciones de Base de Datos

Ejecutar las migraciones para crear las tablas del módulo de seguridad:

```bash
# En el contenedor del backend
docker-compose exec backend python manage.py makemigrations seguridad
docker-compose exec backend python manage.py migrate
```

### 6. Configuración de Permisos

Los permisos de seguridad ya están configurados en el sistema:

- `seguridad.ver_personas` - Ver personas autorizadas
- `seguridad.crear_personas` - Crear personas autorizadas
- `seguridad.editar_personas` - Editar personas autorizadas
- `seguridad.eliminar_personas` - Eliminar personas autorizadas
- `seguridad.ver_vehiculos` - Ver vehículos autorizados
- `seguridad.crear_vehiculos` - Crear vehículos autorizados
- `seguridad.editar_vehiculos` - Editar vehículos autorizados
- `seguridad.eliminar_vehiculos` - Eliminar vehículos autorizados
- `seguridad.ver_registros_acceso` - Ver registros de acceso
- `seguridad.ver_registros_vehiculos` - Ver registros de vehículos
- `seguridad.ver_alertas` - Ver alertas de seguridad
- `seguridad.resolver_alertas` - Resolver alertas de seguridad
- `seguridad.procesar_reconocimiento_facial` - Procesar reconocimiento facial
- `seguridad.procesar_reconocimiento_placa` - Procesar reconocimiento de placas
- `seguridad.ver_estadisticas` - Ver estadísticas de seguridad
- `seguridad.gestionar_configuracion` - Gestionar configuración de seguridad

## Uso del Sistema

### 1. Acceso al Módulo

- Ir a `/admin/seguridad` en el panel administrativo
- Requiere permisos de administrador o supervisor

### 2. Gestión de Personas Autorizadas

- Agregar personas con sus datos biométricos
- El sistema indexará automáticamente los rostros en AWS Rekognition
- Configurar tipos de acceso: residente, personal, visitante, proveedor

### 3. Gestión de Vehículos Autorizados

- Registrar vehículos con sus placas
- El sistema detectará automáticamente placas bolivianas
- Configurar tipos de vehículo: auto, moto, camión, bus, otro

### 4. Reconocimiento Facial

- Usar la cámara web o subir imágenes
- El sistema comparará con la base de datos de personas autorizadas
- Generará alertas para accesos no autorizados

### 5. Reconocimiento de Placas

- Capturar imágenes de placas de vehículos
- El sistema extraerá el texto usando Google Vision OCR
- Validará contra la base de datos de vehículos autorizados

### 6. Monitoreo y Alertas

- Ver registros de accesos y vehículos en tiempo real
- Gestionar alertas de seguridad
- Ver estadísticas y reportes

## Patrones de Placas Bolivianas Soportados

El sistema está configurado para reconocer los siguientes formatos:

- `AB 1234` - Formato estándar
- `ABC 123` - Formato de 3 letras
- `AB 123C` - Formato con letra final

## Costos Estimados

Basado en la recomendación de AWS Rekognition + Google Vision:

- **AWS Rekognition**: ~$1-5 USD por 1000 consultas
- **Google Vision API**: ~$1.50 USD por 1000 consultas
- **Setup**: 2-3 horas de configuración

## Solución de Problemas

### Error de Credenciales AWS

- Verificar que las credenciales estén correctamente configuradas
- Verificar que el usuario IAM tenga permisos para Rekognition

### Error de Google Vision

- Verificar que la API esté habilitada
- Verificar que el archivo de credenciales esté en la ruta correcta
- Verificar que el archivo JSON sea válido

### Problemas de Reconocimiento

- Asegurar buena iluminación en las imágenes
- Verificar que las imágenes sean de alta calidad
- Ajustar los umbrales de confianza en la configuración

## Seguridad

- Las imágenes se almacenan localmente en el servidor
- Los datos biométricos se envían a AWS de forma segura
- Se recomienda usar HTTPS en producción
- Las credenciales deben mantenerse seguras y no exponerse
