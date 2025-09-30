# Generated manually

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="PersonaAutorizada",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("nombre", models.CharField(max_length=100)),
                (
                    "ci",
                    models.CharField(
                        max_length=20, unique=True, verbose_name="Cédula de Identidad"
                    ),
                ),
                ("telefono", models.CharField(blank=True, max_length=20, null=True)),
                ("email", models.EmailField(blank=True, max_length=254, null=True)),
                (
                    "tipo_acceso",
                    models.CharField(
                        choices=[
                            ("residente", "Residente"),
                            ("personal", "Personal"),
                            ("visitante", "Visitante"),
                            ("proveedor", "Proveedor"),
                        ],
                        default="visitante",
                        max_length=20,
                    ),
                ),
                ("activo", models.BooleanField(default=True)),
                ("fecha_registro", models.DateTimeField(auto_now_add=True)),
                ("fecha_actualizacion", models.DateTimeField(auto_now=True)),
                (
                    "foto_rostro",
                    models.ImageField(
                        blank=True, null=True, upload_to="seguridad/rostros/"
                    ),
                ),
                (
                    "foto_rostro_aws_id",
                    models.CharField(blank=True, max_length=255, null=True),
                ),
            ],
            options={
                "verbose_name": "Persona Autorizada",
                "verbose_name_plural": "Personas Autorizadas",
                "ordering": ["nombre"],
            },
        ),
        migrations.CreateModel(
            name="VehiculoAutorizado",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("placa", models.CharField(max_length=10, unique=True)),
                ("propietario", models.CharField(max_length=100)),
                (
                    "tipo_vehiculo",
                    models.CharField(
                        choices=[
                            ("auto", "Automóvil"),
                            ("moto", "Motocicleta"),
                            ("camion", "Camión"),
                            ("bus", "Bus"),
                            ("otro", "Otro"),
                        ],
                        default="auto",
                        max_length=20,
                    ),
                ),
                ("marca", models.CharField(blank=True, max_length=50, null=True)),
                ("modelo", models.CharField(blank=True, max_length=50, null=True)),
                ("color", models.CharField(blank=True, max_length=30, null=True)),
                ("activo", models.BooleanField(default=True)),
                ("fecha_registro", models.DateTimeField(auto_now_add=True)),
                ("fecha_actualizacion", models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name": "Vehículo Autorizado",
                "verbose_name_plural": "Vehículos Autorizados",
                "ordering": ["placa"],
            },
        ),
        migrations.CreateModel(
            name="RegistroAcceso",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "tipo_acceso",
                    models.CharField(
                        choices=[("entrada", "Entrada"), ("salida", "Salida")],
                        max_length=20,
                    ),
                ),
                (
                    "resultado",
                    models.CharField(
                        choices=[
                            ("exitoso", "Exitoso"),
                            ("fallido", "Fallido"),
                            ("no_autorizado", "No Autorizado"),
                            ("error", "Error"),
                        ],
                        max_length=20,
                    ),
                ),
                (
                    "confianza",
                    models.FloatField(
                        help_text="Nivel de confianza del reconocimiento (0-100)"
                    ),
                ),
                (
                    "foto_capturada",
                    models.ImageField(
                        blank=True, null=True, upload_to="seguridad/accesos/"
                    ),
                ),
                ("fecha_hora", models.DateTimeField()),
                ("observaciones", models.TextField(blank=True, null=True)),
                ("coordenadas_rostro", models.JSONField(blank=True, null=True)),
                ("calidad_imagen", models.FloatField(blank=True, null=True)),
                (
                    "persona",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        to="seguridad.personaautorizada",
                    ),
                ),
            ],
            options={
                "verbose_name": "Registro de Acceso",
                "verbose_name_plural": "Registros de Acceso",
                "ordering": ["-fecha_hora"],
            },
        ),
        migrations.CreateModel(
            name="RegistroVehiculo",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("placa", models.CharField(max_length=10)),
                (
                    "tipo_vehiculo",
                    models.CharField(
                        blank=True,
                        choices=[
                            ("auto", "Automóvil"),
                            ("moto", "Motocicleta"),
                            ("camion", "Camión"),
                            ("bus", "Bus"),
                            ("otro", "Otro"),
                        ],
                        max_length=20,
                        null=True,
                    ),
                ),
                (
                    "resultado",
                    models.CharField(
                        choices=[
                            ("exitoso", "Exitoso"),
                            ("fallido", "Fallido"),
                            ("no_autorizado", "No Autorizado"),
                            ("error", "Error"),
                        ],
                        max_length=20,
                    ),
                ),
                (
                    "confianza",
                    models.FloatField(help_text="Nivel de confianza del OCR (0-100)"),
                ),
                (
                    "foto_capturada",
                    models.ImageField(
                        blank=True, null=True, upload_to="seguridad/vehiculos/"
                    ),
                ),
                ("fecha_hora", models.DateTimeField()),
                ("observaciones", models.TextField(blank=True, null=True)),
                ("coordenadas_placa", models.JSONField(blank=True, null=True)),
                (
                    "texto_detectado",
                    models.CharField(blank=True, max_length=50, null=True),
                ),
                (
                    "vehiculo",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        to="seguridad.vehiculoautorizado",
                    ),
                ),
            ],
            options={
                "verbose_name": "Registro de Vehículo",
                "verbose_name_plural": "Registros de Vehículos",
                "ordering": ["-fecha_hora"],
            },
        ),
        migrations.CreateModel(
            name="ConfiguracionSeguridad",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("nombre", models.CharField(max_length=100, unique=True)),
                ("descripcion", models.TextField(blank=True, null=True)),
                ("configuracion", models.JSONField(default=dict)),
                ("activo", models.BooleanField(default=True)),
                ("fecha_actualizacion", models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name": "Configuración de Seguridad",
                "verbose_name_plural": "Configuraciones de Seguridad",
            },
        ),
        migrations.CreateModel(
            name="AlertaSeguridad",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "tipo",
                    models.CharField(
                        choices=[
                            ("acceso_no_autorizado", "Acceso No Autorizado"),
                            ("vehiculo_no_autorizado", "Vehículo No Autorizado"),
                            ("comportamiento_sospechoso", "Comportamiento Sospechoso"),
                            ("sistema_error", "Error del Sistema"),
                            ("mantenimiento", "Mantenimiento Requerido"),
                        ],
                        max_length=30,
                    ),
                ),
                (
                    "severidad",
                    models.CharField(
                        choices=[
                            ("baja", "Baja"),
                            ("media", "Media"),
                            ("alta", "Alta"),
                            ("critica", "Crítica"),
                        ],
                        default="media",
                        max_length=10,
                    ),
                ),
                ("titulo", models.CharField(max_length=200)),
                ("descripcion", models.TextField()),
                ("fecha_hora", models.DateTimeField()),
                ("resuelta", models.BooleanField(default=False)),
                ("fecha_resolucion", models.DateTimeField(blank=True, null=True)),
                (
                    "registro_acceso",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        to="seguridad.registroacceso",
                    ),
                ),
                (
                    "registro_vehiculo",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        to="seguridad.registrovehiculo",
                    ),
                ),
                (
                    "resuelta_por",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "Alerta de Seguridad",
                "verbose_name_plural": "Alertas de Seguridad",
                "ordering": ["-fecha_hora"],
            },
        ),
    ]
