# Guía de Configuración - Condominio Smart Mobile

## Cambiar Backend (Local vs Nube)

Para cambiar entre el backend local y el backend en la nube, edita el archivo `lib/config/app_config.dart`:

### Usar Backend en la Nube (AWS)
```dart
static const bool _useCloudBackend = true;
```

### Usar Backend Local (Desarrollo)
```dart
static const bool _useCloudBackend = false;
```

## URLs Configuradas

- **Local**: `http://10.0.2.2:8000` (para emulador Android)
- **Nube**: `http://3.230.69.204:8000` (servidor AWS)

## Verificar Configuración Actual

En modo debug, puedes ver la configuración actual:

1. Ejecuta la app en modo debug
2. Toca el ícono de configuración (⚙️) en la esquina superior derecha
3. Verás la información de conexión actual

## Configuraciones Adicionales

### Timeouts
```dart
static const Duration requestTimeout = Duration(seconds: 30);
static const Duration connectionTimeout = Duration(seconds: 15);
```

### Modo Debug
```dart
static const bool isDebugMode = true; // Cambiar a false para producción
```

## Entornos Disponibles

El archivo incluye configuración para múltiples entornos:

- `Environment.local` - Desarrollo local
- `Environment.cloud` - Servidor en la nube
- `Environment.production` - Producción (configurar URL real)

## Solución de Problemas

### Error de Conexión
1. Verifica que la URL del backend sea correcta
2. Asegúrate de que el servidor esté ejecutándose
3. Verifica la conectividad de red

### Cambiar URL Manualmente
Si necesitas usar una URL diferente, edita directamente en `app_config.dart`:

```dart
static const String _cloudUrl = "http://TU_NUEVA_URL:8000";
```

## Notas Importantes

- Los cambios en configuración requieren reiniciar la app
- En modo debug, se muestra información adicional de configuración
- Para producción, asegúrate de usar HTTPS y configurar correctamente los certificados
