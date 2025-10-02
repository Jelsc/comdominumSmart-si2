# 🔒 Configuración del Módulo de Seguridad con IA

## ✅ Estado Actual

El módulo de seguridad está **FUNCIONANDO** correctamente:

- ✅ Registro de vehículos
- ✅ Registro de personas
- ✅ Base de datos configurada
- ✅ APIs disponibles
- ⏳ OCR de placas (requiere credenciales de Google Cloud)
- ⏳ Reconocimiento facial (requiere credenciales de AWS)

## 🚀 Cómo Usar el Sistema

### 1. Acceder al Módulo de Seguridad

- **Frontend:** http://localhost:5173/admin/seguridad
- **Backend Admin:** http://localhost:8000/admin/
- **Credenciales:** `admin` / `admin`

### 2. Registrar Vehículos

1. Ve a "Vehículos Autorizados"
2. Haz clic en "+ Agregar Vehículo"
3. Completa los datos:
   - Placa: `ABC123`
   - Propietario: `Juan Pérez`
   - Tipo: `Automóvil`
   - Marca, Modelo, Color
4. Guarda el vehículo

### 3. Registrar Personas

1. Ve a "Personas Autorizadas"
2. Haz clic en "+ Agregar Persona"
3. Completa los datos:
   - Nombre: `María García`
   - CI: `12345678`
   - Teléfono, Email
   - Tipo de Acceso: `Residente`
4. Guarda la persona

## 🔧 Configuración de IA (Opcional)

### Para OCR de Placas (Google Cloud Vision)

1. **Crear proyecto en Google Cloud Console**

   - Ve a https://console.cloud.google.com/
   - Crea un nuevo proyecto o selecciona uno existente

2. **Habilitar la API de Vision**

   - Ve a "APIs y servicios" > "Biblioteca"
   - Busca "Cloud Vision API"
   - Haz clic en "Habilitar"

3. **Crear cuenta de servicio**

   - Ve a "IAM y administración" > "Cuentas de servicio"
   - Haz clic en "Crear cuenta de servicio"
   - Nombre: `condominio-vision`
   - Rol: `Cloud Vision API User`

4. **Descargar credenciales**

   - Haz clic en la cuenta de servicio creada
   - Ve a "Claves" > "Agregar clave" > "Crear nueva clave"
   - Selecciona "JSON" y descarga el archivo

5. **Configurar en el proyecto**
   - Renombra el archivo descargado a `google-credentials.json`
   - Colócalo en `backend/credentials/google-credentials.json`
   - Reinicia el contenedor: `docker-compose restart backend`

### Para Reconocimiento Facial (AWS Rekognition)

1. **Crear cuenta de AWS**

   - Ve a https://aws.amazon.com/
   - Crea una cuenta gratuita

2. **Crear usuario IAM**

   - Ve a "IAM" > "Usuarios" > "Crear usuario"
   - Nombre: `condominio-rekognition`
   - Adjunta política: `AmazonRekognitionFullAccess`

3. **Crear claves de acceso**

   - Ve a "Claves de acceso" > "Crear clave de acceso"
   - Descarga las credenciales

4. **Configurar variables de entorno**
   - Crea un archivo `.env` en la raíz del proyecto:
   ```bash
   AWS_ACCESS_KEY_ID=tu_access_key_aqui
   AWS_SECRET_ACCESS_KEY=tu_secret_key_aqui
   AWS_REGION=us-east-1
   ```

## 🧪 Probar el Sistema

### Datos de Prueba Creados

- **Vehículo:** ABC123 - Juan Pérez (Toyota Corolla Azul)
- **Persona:** María García - 12345678 (Residente)

### Probar Registro de Vehículos

1. Ve a http://localhost:5173/admin/seguridad
2. Haz clic en "Vehículos Autorizados"
3. Verifica que aparece el vehículo ABC123

### Probar Escaneo de Placas (con credenciales)

1. Ve a "Reconocimiento de Placas"
2. Sube una imagen de una placa
3. El sistema debería detectar la placa automáticamente

## 📊 Endpoints de API

- **Vehículos:** `GET/POST http://localhost:8000/api/seguridad/vehiculos/`
- **Personas:** `GET/POST http://localhost:8000/api/seguridad/personas/`
- **Reconocimiento de Placas:** `POST http://localhost:8000/api/seguridad/reconocimiento-placa/`
- **Reconocimiento Facial:** `POST http://localhost:8000/api/seguridad/reconocimiento-facial/`

## 🔍 Verificar Estado

Para verificar que todo funciona:

```bash
# Verificar contenedores
docker-compose ps

# Ver logs del backend
docker-compose logs backend

# Probar el módulo
docker-compose exec backend python test_seguridad.py
```

## ⚠️ Notas Importantes

1. **Sin credenciales de IA:** El sistema funciona para registro, pero no para reconocimiento automático
2. **Con credenciales de IA:** Funciona completamente con OCR y reconocimiento facial
3. **Base de datos:** Las tablas están creadas y funcionando
4. **Frontend:** Completamente funcional para todas las operaciones

## 🎯 Próximos Pasos

1. **Configurar Google Cloud Vision** para OCR de placas
2. **Configurar AWS Rekognition** para reconocimiento facial
3. **Probar el escaneo** con imágenes reales
4. **Configurar alertas** para vehículos no autorizados
