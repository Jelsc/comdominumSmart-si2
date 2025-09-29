import re
from decimal import Decimal, ROUND_HALF_UP

from rest_framework import serializers

from .models import AreaComun


class AreaComunSerializer(serializers.ModelSerializer):
    monto_hora = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        coerce_to_string=True,
    )

    class Meta:
        model = AreaComun
        fields = (
            "id",
            "nombre",
            "monto_hora",
            "estado",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    @staticmethod
    def _normalize_nombre(nombre: str) -> str:
        return re.sub(r"\s+", " ", nombre or "").strip()

    def validate_nombre(self, value: str) -> str:
        normalized = self._normalize_nombre(value)
        if not normalized:
            raise serializers.ValidationError("El nombre es obligatorio.")

        queryset = AreaComun.objects.all()
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.filter(nombre__iexact=normalized).exists():
            raise serializers.ValidationError(
                "Ya existe un área común con este nombre."
            )

        return normalized

    def validate_monto_hora(self, value: Decimal) -> Decimal:
        if value < 0:
            raise serializers.ValidationError(
                "El monto por hora debe ser mayor o igual a 0."
            )
        return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    def validate_estado(self, value: str) -> str:
        valid_states = {choice for choice, _ in AreaComun.ESTADO_CHOICES}
        if value not in valid_states:
            raise serializers.ValidationError("Estado inválido.")
        return value

    def create(self, validated_data):
        validated_data["nombre"] = self._normalize_nombre(
            validated_data.get("nombre", "")
        )
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if "nombre" in validated_data:
            validated_data["nombre"] = self._normalize_nombre(
                validated_data.get("nombre", "")
            )
        return super().update(instance, validated_data)
