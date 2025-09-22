FROM python:3.12-slim

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    TZ=America/La_Paz

# Configurar zona horaria
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Dependencias para psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev bash tzdata \
 && rm -rf /var/lib/apt/lists/*

# Requisitos primero (mejor cache)
COPY requirements.txt /app/
RUN pip install -r requirements.txt

# Código
COPY . /app/

EXPOSE 8000
