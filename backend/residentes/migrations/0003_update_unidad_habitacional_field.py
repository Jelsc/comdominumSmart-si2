from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('residentes', '0001_initial'),
        ('unidades', '0001_initial'),
    ]

    operations = [
        # Actualizar campo unidad_habitacional para asegurar que tiene el formato correcto
        migrations.AlterField(
            model_name='residente',
            name='unidad_habitacional',
            field=models.CharField(
                blank=True,
                help_text='Código de la unidad (ej: A-101, B-202)',
                max_length=10,
                null=True,
                verbose_name='Código de Unidad Habitacional'
            ),
        ),
    ]