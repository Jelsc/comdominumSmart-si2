"""
Constantes para la aplicación de usuarios.
Define permisos y otras constantes utilizadas en el sistema.
"""

# Lista de permisos disponibles en el sistema
# Formato: (clave_permiso, descripción_legible)
PERMISOS_SISTEMA = [
    # Permisos administrativos
    ("gestionar_usuarios", "Gestionar usuarios del sistema"),
    ("gestionar_roles", "Gestionar roles y permisos"),
    ("ver_dashboard_admin", "Ver dashboard administrativo"),
    ("gestionar_configuracion", "Gestionar configuración del sistema"),
    # Permisos para residentes
    ("gestionar_residentes", "Gestionar residentes del sistema"),
    ("crear_residente", "Crear nuevos residentes"),
    ("editar_residente", "Editar información de residentes"),
    ("eliminar_residente", "Eliminar residentes"),
    ("ver_residentes", "Ver lista de residentes"),
    # Permisos para personal de empresa
    ("gestionar_personal", "Gestionar personal de empresa"),
    ("crear_personal", "Crear nuevo personal de empresa"),
    ("editar_personal", "Editar información del personal"),
    ("eliminar_personal", "Eliminar personal de empresa"),
    ("ver_personal", "Ver lista de personal de empresa"),
    ("gestionar_departamentos", "Gestionar departamentos"),
    # Permisos para unidades habitacionales
    ("gestionar_unidades", "Gestionar unidades habitacionales"),
    ("crear_unidad", "Crear nuevas unidades habitacionales"),
    ("editar_unidad", "Editar información de unidades"),
    ("eliminar_unidad", "Eliminar unidades habitacionales"),
    ("ver_unidades", "Ver lista de unidades habitacionales"),
    # Permisos para accesos
    ("gestionar_accesos", "Gestionar accesos al condominio"),
    ("registrar_entrada", "Registrar entrada de residentes"),
    ("registrar_salida", "Registrar salida de residentes"),
    ("ver_historial_accesos", "Ver historial de accesos"),
    ("gestionar_visitantes", "Gestionar visitantes del condominio"),
    # Permisos para clientes
    ("ver_perfil", "Ver perfil propio"),
    ("editar_perfil", "Editar perfil propio"),
    ("ver_historial", "Ver historial de actividad"),
    # Permisos para reportes
    ("ver_reportes_basicos", "Ver reportes básicos"),
    ("ver_reportes_avanzados", "Ver reportes avanzados"),
    ("exportar_reportes", "Exportar reportes"),
    ("generar_reportes_personalizados", "Generar reportes personalizados"),
    # Permisos para monitoreo
    ("monitorear_residentes", "Monitorear estado de residentes"),
    ("monitorear_accesos", "Monitorear accesos en tiempo real"),
    ("monitorear_seguridad", "Monitorear sistema de seguridad"),
    ("ver_estadisticas_tiempo_real", "Ver estadísticas en tiempo real"),
]

# Agrupar permisos por categoría para facilitar la asignación
GRUPOS_PERMISOS = {
    "administrador": [
        "gestionar_usuarios",
        "gestionar_roles",
        "ver_dashboard_admin",
        "gestionar_configuracion",
        "gestionar_residentes",
        "gestionar_personal",
        "gestionar_departamentos",
        "gestionar_unidades",
        "gestionar_accesos",
        "ver_reportes_avanzados",
        "exportar_reportes",
        "generar_reportes_personalizados",
    ],
    "supervisor": [
        "ver_residentes",
        "ver_personal",
        "ver_unidades",
        "gestionar_accesos",
        "monitorear_residentes",
        "monitorear_accesos",
        "monitorear_seguridad",
        "ver_estadisticas_tiempo_real",
        "ver_reportes_basicos",
        "gestionar_visitantes",
    ],
    "residente": [
        "ver_perfil",
        "editar_perfil",
        "ver_historial_accesos",
        "gestionar_visitantes",
        "reportar_incidente",
        "ver_historial",
    ],
    "cliente": [
        "solicitar_viaje",
        "cancelar_viaje",
        "ver_historial_viajes",
        "ver_perfil",
        "editar_perfil",
    ],
    "operador": [
        "ver_residentes",
        "gestionar_accesos",
        "monitorear_residentes",
        "monitorear_accesos",
        "ver_unidades",
        "registrar_entrada",
        "registrar_salida",
        "ver_reportes_basicos",
    ],
}
