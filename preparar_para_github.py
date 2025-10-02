#!/usr/bin/env python3
"""
Script para preparar el proyecto para GitHub
Remueve credenciales hardcodeadas y las reemplaza por variables de entorno
"""

import os
import shutil


def limpiar_credenciales_azure():
    """Reemplaza credenciales hardcodeadas de Azure por variables de entorno"""
    archivo = "backend/seguridad/azure_vision_api.py"

    if not os.path.exists(archivo):
        print(f"❌ No se encontró {archivo}")
        return

    with open(archivo, "r", encoding="utf-8") as f:
        contenido = f.read()

    # Reemplazar credenciales hardcodeadas
    contenido_limpio = contenido.replace(
        'self.subscription_key = "TU_AZURE_KEY_PLACEHOLDER"',
        'self.subscription_key = os.getenv("AZURE_VISION_SUBSCRIPTION_KEY", "")',
    ).replace(
        'self.endpoint = "https://tu-recurso.cognitiveservices.azure.com/"',
        'self.endpoint = os.getenv("AZURE_VISION_ENDPOINT", "")',
    )

    # Agregar import os si no existe
    if "import os" not in contenido_limpio:
        contenido_limpio = contenido_limpio.replace(
            "import requests", "import os\nimport requests"
        )

    with open(archivo, "w", encoding="utf-8") as f:
        f.write(contenido_limpio)

    print(f"Limpiado {archivo}")


def crear_env_example():
    """Crea archivo .env.example con plantilla"""
    contenido = """# Configuración de servicios de IA

# Azure Computer Vision (Reconocimiento de Placas)
AZURE_VISION_SUBSCRIPTION_KEY=tu_azure_subscription_key_aqui
AZURE_VISION_ENDPOINT=https://tu-recurso.cognitiveservices.azure.com/

# Google Cloud Vision (Backup de Placas)
GOOGLE_APPLICATION_CREDENTIALS=/app/credentials/google-credentials.json

# AWS Rekognition (Reconocimiento Facial)
AWS_ACCESS_KEY_ID=tu_aws_access_key_aqui
AWS_SECRET_ACCESS_KEY=tu_aws_secret_key_aqui
AWS_REGION=us-east-1
AWS_REKOGNITION_COLLECTION_ID=condominio-rostros

# Base de datos
POSTGRES_DB=condominio
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# OAuth (opcional)
GOOGLE_OAUTH2_CLIENT_ID=
GOOGLE_OAUTH2_CLIENT_SECRET=
"""

    with open(".env.example", "w", encoding="utf-8") as f:
        f.write(contenido)

    print("Creado .env.example")


def actualizar_gitignore():
    """Actualiza .gitignore para excluir credenciales"""
    gitignore_content = """
# Credenciales y archivos sensibles
.env
backend/credentials/google-credentials.json
CREDENCIALES_PARA_PRODUCCION.md

# Archivos temporales de configuración
configurar_*.py
fix_*.py
setup_*.py
activar_*.py
test_*.py
"""

    # Leer .gitignore existente
    gitignore_path = ".gitignore"
    existing_content = ""
    if os.path.exists(gitignore_path):
        with open(gitignore_path, "r", encoding="utf-8") as f:
            existing_content = f.read()

    # Agregar nuevo contenido si no existe
    if "CREDENCIALES_PARA_PRODUCCION.md" not in existing_content:
        with open(gitignore_path, "a", encoding="utf-8") as f:
            f.write(gitignore_content)
        print("Actualizado .gitignore")
    else:
        print(".gitignore ya está actualizado")


def crear_readme_credenciales():
    """Crea README con instrucciones de configuración"""
    contenido = """# 🔐 Configuración de Credenciales

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
"""

    with open("CONFIGURACION_CREDENCIALES.md", "w", encoding="utf-8") as f:
        f.write(contenido)

    print("Creado CONFIGURACION_CREDENCIALES.md")


def remover_archivos_sensibles():
    """Remueve archivos que no deben ir a GitHub"""
    archivos_a_remover = [".env", "CREDENCIALES_PARA_PRODUCCION.md"]

    for archivo in archivos_a_remover:
        if os.path.exists(archivo):
            # No remover, solo avisar
            print(f"RECORDATORIO: No subir {archivo} a GitHub")


def main():
    """Función principal"""
    print("PREPARANDO PROYECTO PARA GITHUB")
    print("=" * 50)

    # 1. Limpiar credenciales hardcodeadas
    limpiar_credenciales_azure()

    # 2. Crear archivos de configuración
    crear_env_example()
    actualizar_gitignore()
    crear_readme_credenciales()

    # 3. Avisos de seguridad
    remover_archivos_sensibles()

    print("\nPROYECTO PREPARADO PARA GITHUB")
    print("\nPASOS SIGUIENTES:")
    print("1. Revisa que .env no esté en el repositorio")
    print(
        "2. Verifica que backend/credentials/google-credentials.json esté en .gitignore"
    )
    print("3. Guarda CREDENCIALES_PARA_PRODUCCION.md en un lugar seguro")
    print("4. Haz commit y push normalmente")

    print("\nPARA DESPLEGAR EN PRODUCCIÓN:")
    print("1. Usa las credenciales guardadas en CREDENCIALES_PARA_PRODUCCION.md")
    print("2. Configura las variables de entorno en el servidor")
    print("3. Coloca google-credentials.json en backend/credentials/")


if __name__ == "__main__":
    main()
