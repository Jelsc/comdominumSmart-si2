# 🔐 Configuración de Credenciales

## 📋 Variables de Entorno Requeridas

Copia `.env.example` a `.env` y configura las siguientes variables:

### 🔍 Azure Computer Vision (Reconocimiento de Placas)
```bash
AZURE_VISION_SUBSCRIPTION_KEY=tu_key_aqui
AZURE_VISION_ENDPOINT=https://tu-recurso.cognitiveservices.azure.com/
```

### 🌐 Google Cloud Vision (Backup)
```bash
GOOGLE_APPLICATION_CREDENTIALS=/app/credentials/google-credentials.json
```

### 🤖 AWS Rekognition (Reconocimiento Facial)
```bash
AWS_ACCESS_KEY_ID=tu_access_key_aqui
AWS_SECRET_ACCESS_KEY=tu_secret_key_aqui
AWS_REGION=us-east-1
```

## 🚀 Configuración Rápida

1. Copia el archivo de ejemplo:
   ```bash
   cp .env.example .env
   ```

2. Edita `.env` con tus credenciales reales

3. Para Google Cloud, coloca tu archivo JSON en:
   ```bash
   backend/credentials/google-credentials.json
   ```

4. Reinicia el sistema:
   ```bash
   docker-compose restart
   ```

## 🔒 Seguridad

- ❌ NUNCA subas archivos `.env` o credenciales a Git
- ✅ Usa siempre variables de entorno en producción
- ✅ Rota las credenciales regularmente
