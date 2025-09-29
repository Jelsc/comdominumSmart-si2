# ComdominumSmart-si2

Monorepo para **PostgreSQL + Django REST (backend)**, **React + Vite (frontend)** y **Flutter (mobile)**.
En DEV usamos Docker para **db + backend + frontend**. Flutter se corre fuera de Docker (emulador/dispositivo).

## 📁 Estructura

```
ComdominumSmart-si2/
├─ backend/         # Django + DRF
├─ frontend/        # React + Vite + TS + Tailwind
├─ mobile/          # Flutter (fuera de Docker en dev)
├─ .env.example     # vars del backend/compose (copia a .env)
├─ docker-compose.yml
└─ README.md
```

---

## 🚀 Pasos rápidos (con Docker)

### 0) Requisitos

- Docker Desktop (o Docker Engine + Compose)
- Git
- (Opcional) Node 18+ si vas a tocar el frontend sin Docker
- (Opcional) Python 3.11+ si vas a correr backend sin Docker
- flutter

### 1) Clonar y configurar variables

```bash
git clone <URL-DEL-REPO>

# Linux/Mac
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env

# Windows PowerShell
copy frontend\.env.example frontend\.env
copy backend/.env.example backend/.env
```

### 2) Levantar servicios

```bash
docker-compose up -d --build
```

Nota: El superusuario y otros datos iniciales se crean automáticamente durante el arranque del contenedor usando el sistema de seeders. Las credenciales están definidas en el archivo `.env` (variables `DJANGO_SUPERUSER_*`).

### 3) Ejecución

```bash
# para iniciar los contenedores
docker-compose up -d

# MIGRACIONES (importante seguir este orden):
# 1. Primero generar archivos de migración (detecta cambios en modelos)
#    Para todas las apps:
docker-compose exec backend python manage.py makemigrations

#    O para apps específicas:
docker compose exec backend python manage.py makemigrations users
docker compose exec backend python manage.py makemigrations account

# 2. Luego aplicar migraciones a la base de datos
docker-compose exec backend python manage.py migrate

# SEEDERS:
# Para ejecutar todos los seeders automáticamente:
docker-compose exec backend python manage.py seed
docker-compose exec backend python manage.py seed residente

# Para ejecutar seeders específicos (por nombre, sin el sufijo "_seeder"):
docker compose exec backend python manage.py seed user rol

# Para ejecutar un nuevo seeder que acabas de crear (ejemplo: vehiculo_seeder.py):
docker compose exec backend python manage.py seed vehiculo

# Para forzar la ejecución aunque should_run() devuelva False:
docker compose exec backend python manage.py seed --force
docker compose exec backend python manage.py seed vehiculo --force

#para parar detener los contenedores
docker compose stop
```

### 3) Comandos útiles

```bash
# logs en vivo
docker compose logs -f backend
docker compose logs -f db
docker compose logs -f frontend

```

### 4) URLs

**Desarrollo local:**

- Backend (Django): [http://localhost:8000](http://localhost:8000)
- Admin Django: [http://localhost:8000/admin](http://localhost:8000/admin)
- Frontend (Vite): [http://localhost:5173](http://localhost:5173)
- MailHog: [http://localhost:8025](http://localhost:8025/)

**Producción EC2:**

- Backend (Django): [http://3.230.69.204:8000](http://3.230.69.204:8000)
- Admin Django: [http://3.230.69.204:8000/admin](http://3.230.69.204:8000/admin)
- Frontend (Vite): [http://3.230.69.204:5173](http://3.230.69.204:5173)
- MailHog: [http://3.230.69.204:8025](http://3.230.69.204:8025/)

## 🧑‍💻 Desarrollo local (sin Docker) — opcional

### Backend

```bash
cd backend
python -m venv .venv
# Windows
.\.venv\Scripts\Activate.ps1
# Linux/Mac
# source .venv/bin/activate

pip install -r requirements.txt

# crea y ajusta backend/.env o usa el .env de la raíz (ya configurado)
# para local, POSTGRES_HOST=127.0.0.1

python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
# asegúrate de tener frontend/.env con VITE_API_URL
npm run dev -- --host
```

---

## 🧰 Cheatsheet Docker

```bash
# levantar / reconstruir
docker compose up -d --build

# detener
docker compose down

# detener y borrar volúmenes (borra datos de Postgres)
docker compose down -v

# ejecutar comandos dentro del backend
docker compose exec backend python manage.py migrate
docker compose exec backend bash
```

---

## 🚀 Despliegue en EC2 (IP: 3.230.69.204)

### **Paso a paso en tu servidor EC2:**

```bash
# 1. Conectar a EC2
ssh -i tu-clave.pem ubuntu@3.230.69.204

# 2. Clonar repositorio
git clone https://github.com/Jelsc/comdominumSmart-si2.git
cd comdominumSmart-si2

# 3. Usar configuración pre-configurada para EC2
cp .env.ec2 .env
cp frontend/.env.ec2 frontend/.env

# 4. IMPORTANTE: Cambiar credenciales de seguridad
nano .env
# - Cambiar DJANGO_SECRET_KEY por algo aleatorio y seguro
# - Cambiar DJANGO_SUPERUSER_PASSWORD por una contraseña segura
# - Cambiar POSTGRES_PASSWORD por una contraseña segura

# 5. Levantar servicios
docker compose up -d --build

# 6. Aplicar migraciones
docker compose exec backend python manage.py migrate

# 7. Crear datos iniciales
docker compose exec backend python manage.py seed user rol --force
```

### **URLs de acceso:**

- **Frontend**: http://3.230.69.204:5173
- **Backend/API**: http://3.230.69.204:8000
- **Admin Django**: http://3.230.69.204:8000/admin
- **MailHog**: http://3.230.69.204:8025

### **Security Group necesario:**

```
Inbound Rules:
- SSH (22): Tu IP
- HTTP Frontend (5173): 0.0.0.0/0
- HTTP Backend (8000): 0.0.0.0/0
- MailHog (8025): 0.0.0.0/0
```

---

## 🌐 Configuración de URLs Dinámicas

El frontend está configurado para **nunca usar URLs hardcodeadas** hacia el backend:

### Prioridad de resolución de API URL:

1. **Variable de entorno**: Si existe `VITE_API_URL` en `frontend/.env`, la usa
2. **Construcción dinámica**: Si no existe, construye automáticamente usando:
   - `window.location.protocol` + `window.location.hostname` + `:8000`

### Ejemplos:

- **Local development**: `http://127.0.0.1:8000` o `http://localhost:8000`
- **EC2/Servidor**: `http://tu-ip-publica:8000` (se resuelve automáticamente)
- **Docker**: `http://host-docker:8000` (según el hostname)

### Variables de entorno importantes:

**Frontend (.env)**:

```bash
VITE_API_URL=http://127.0.0.1:8000  # Opcional - se resuelve automáticamente si no existe
```

**Backend (.env)**:

```bash
DJANGO_ALLOWED_HOSTS=127.0.0.1,localhost,tu-ip-publica
CORS_ALLOW_ALL_ORIGINS=True  # Solo desarrollo
```

---

## 🚀 Despliegue en Producción

### Docker en EC2/VPS:

```bash
# 1. Clonar repo
git clone <repo> && cd comdominumSmart-si2

# 2. Configurar variables (NO uses las de ejemplo en producción)
cp .env.example .env
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env

# 3. Editar .env con valores de producción:
#    - DJANGO_SECRET_KEY (genera uno nuevo)
#    - DJANGO_DEBUG=0
#    - DJANGO_ALLOWED_HOSTS=tu-ip-publica,tu-dominio.com
#    - CORS_ALLOW_ALL_ORIGINS=False (más seguro)
#    - Passwords de BD seguros

# 4. Levantar
docker compose up -d --build

# 5. Acceder desde navegador:
#    Frontend: http://tu-ip-publica:5173
#    Backend: http://tu-ip-publica:8000
```

### Consideraciones de seguridad:

- **NO uses** `CORS_ALLOW_ALL_ORIGINS=True` en producción
- Cambia `DJANGO_SECRET_KEY` por uno aleatorio
- Usa contraseñas fuertes para la base de datos
- Considera usar un reverse proxy (nginx) para HTTPS

---

## 🩹 Troubleshooting

### URLs y CORS:

- **Frontend no conecta al backend**: El sistema resuelve automáticamente la URL usando `window.location`. Si usas un AdBlocker como uBlock/Brave, puede bloquear peticiones a puertos no estándar.
- **ERR_BLOCKED_BY_CLIENT**: Desactiva temporalmente el AdBlocker o añade la IP/puerto a la lista blanca.
- **CORS errors**: Verifica que `CORS_ALLOW_ALL_ORIGINS=True` en desarrollo o que tu dominio/IP esté en `CORS_ALLOWED_ORIGINS`.

### Otros problemas comunes:

- **Puertos ocupados**: cambia el lado izquierdo del mapeo en `docker-compose.yml`
  (ej: `"8001:8000"`, `"5174:5173"`, `"15432:5432"`).
- **Backend no conecta a DB en Docker**: confirma que en `compose` se fuerza `POSTGRES_HOST: db`.

---
