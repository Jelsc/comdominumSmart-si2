from django.db import migrations, models
import django.db.models.deletion


def migrar_datos_unidades(apps, schema_editor):
    """
    Migra los códigos de unidad_habitacional al campo unidad (relación)
    """
    Residente = apps.get_model('residentes', 'Residente')
    UnidadHabitacional = apps.get_model('unidades', 'UnidadHabitacional')
    
    # Crear un diccionario para buscar unidades por código
    unidades_por_codigo = {}
    for unidad in UnidadHabitacional.objects.all():
        unidades_por_codigo[unidad.codigo] = unidad
    
    # Actualizar cada residente
    for residente in Residente.objects.all():
        codigo_unidad = residente.unidad_habitacional
        if codigo_unidad and codigo_unidad in unidades_por_codigo:
            residente.unidad = unidades_por_codigo[codigo_unidad]
            residente.save(update_fields=['unidad'])


class Migration(migrations.Migration):

    dependencies = [
        ('residentes', '0001_initial'),
        ('unidades', '0001_initial'),
    ]

    operations = [
        # Primero asegurarse de que el campo unidad exista
        migrations.RunPython(migrar_datos_unidades),
        
        # Luego eliminar el campo unidad_habitacional
        migrations.RemoveField(
            model_name='residente',
            name='unidad_habitacional',
        ),
    ]