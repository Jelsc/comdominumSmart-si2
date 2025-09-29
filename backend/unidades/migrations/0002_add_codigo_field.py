from django.db import migrations, models
import django.core.validators

class Migration(migrations.Migration):

    dependencies = [
        ('unidades', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='unidadhabitacional',
            name='codigo',
            field=models.CharField(
                default='A-101',  # valor por defecto temporal para las unidades existentes
                max_length=10,
                unique=True,
                validators=[
                    django.core.validators.RegexValidator(
                        regex=r"^[A-Z]-\d{3}$",
                        message="El código debe tener el formato A-101, B-202, etc."
                    )
                ],
                verbose_name="Código de Unidad"
            ),
            preserve_default=False,  # esto hará que Django pida el valor por defecto en la migración
        ),
    ]