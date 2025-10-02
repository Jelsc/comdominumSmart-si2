#!/bin/bash
# Script para configurar credenciales en AWS EC2

echo "🚀 CONFIGURANDO CREDENCIALES EN PRODUCCIÓN"
echo "=========================================="

# 1. Crear directorio de credenciales
echo "📁 Creando directorio de credenciales..."
mkdir -p backend/credentials

# 2. Configurar Google Cloud credentials
echo "🌐 Configurando Google Cloud Vision..."
cat > backend/credentials/google-credentials.json << 'EOF'

EOF

# 3. Configurar variables de entorno
echo "🔐 Configurando variables de entorno..."
cat > .env << 'EOF'
# Azure Computer Vision (Reconocimiento de Placas)

AZURE_VISION_ENDPOINT=${AZURE_VISION_ENDPOINT}

# Google Cloud Vision (Backup de Placas)
GOOGLE_APPLICATION_CREDENTIALS=/app/credentials/google-credentials.json

# AWS Rekognition (Reconocimiento Facial) - CONFIGURAR CUANDO TENGAS CREDENCIALES
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_REKOGNITION_COLLECTION_ID=condominio-rostros

# Base de datos
POSTGRES_DB=condominio
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres_prod_password_CAMBIAR

# OAuth (opcional)
GOOGLE_OAUTH2_CLIENT_ID=
GOOGLE_OAUTH2_CLIENT_SECRET=
EOF

# 4. Establecer permisos seguros
echo "🔒 Configurando permisos de seguridad..."
chmod 600 backend/credentials/google-credentials.json
chmod 600 .env

# 5. Verificar configuración
echo "✅ Verificando configuración..."
if [ -f "backend/credentials/google-credentials.json" ]; then
    echo "✅ Google Cloud credentials: OK"
else
    echo "❌ Google Cloud credentials: FALTA"
fi

if [ -f ".env" ]; then
    echo "✅ Variables de entorno: OK"
else
    echo "❌ Variables de entorno: FALTA"
fi

echo ""
echo "🎉 CONFIGURACIÓN COMPLETADA"
echo ""
echo "📋 PRÓXIMOS PASOS:"
echo "1. Configura AWS_ACCESS_KEY_ID y AWS_SECRET_ACCESS_KEY en .env"
echo "2. Cambia POSTGRES_PASSWORD por una contraseña segura"
echo "3. Ejecuta: docker-compose up -d"
echo "4. Verifica: curl http://localhost:8000/api/seguridad/personas/"
echo ""
echo "🔐 IMPORTANTE:"
echo "- Las credenciales de Azure y Google ya están configuradas"
echo "- Solo necesitas configurar AWS para reconocimiento facial"
echo "- El sistema funcionará sin AWS (solo simulación facial)"

