from django.contrib import admin

from .models import AreaComun


@admin.register(AreaComun)
class AreaComunAdmin(admin.ModelAdmin):
    list_display = ("nombre", "monto_hora", "estado", "created_at")
    search_fields = ("nombre",)
    list_filter = ("estado",)
    ordering = ("nombre",)
