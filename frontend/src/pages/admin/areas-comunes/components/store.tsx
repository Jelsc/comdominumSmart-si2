import { useEffect, useMemo, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type {
  AreaComun,
  AreaComunForm,
  EstadoArea,
} from "@/types/areas-comunes";
import type { AreasComunesApiResponse } from "@/services/areas-comunes.api";

const estadoValues = ["ACTIVO", "INACTIVO", "MANTENIMIENTO"] as const;

const schema = z.object({
  nombre: z
    .string()
    .trim()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(120, "El nombre debe tener máximo 120 caracteres"),
  monto_hora: z.coerce.number().min(0, "Ingresa un monto válido y mayor o igual a 0"),
  estado: z.enum(estadoValues),
});

export type AreaComunFormValues = z.infer<typeof schema>;

interface AreaComunStoreProps {
  open: boolean;
  onClose: () => void;
  initialData?: AreaComun | null;
  onSubmit: (
    values: AreaComunFormValues
  ) => Promise<AreasComunesApiResponse<AreaComun>>;
  loading?: boolean;
}

const defaultValues: AreaComunFormValues = {
  nombre: "",
  monto_hora: 0,
  estado: "ACTIVO",
};

const estadoOptions: { value: EstadoArea; label: string }[] = estadoValues.map(
  (value) => ({
    value: value as EstadoArea,
    label:
      value === "ACTIVO"
        ? "Activo"
        : value === "INACTIVO"
          ? "Inactivo"
          : "Mantenimiento",
  })
);

const normalizeMonto = (value: number) => Number(value.toFixed(2));

const mapToFormValues = (area?: AreaComun | null): AreaComunFormValues => {
  // Convertir monto_hora a número independientemente de si es string o number
  const monto = area?.monto_hora ? Number(area.monto_hora) : 0;
  return {
    nombre: area?.nombre ?? "",
    monto_hora: Number.isNaN(monto) ? 0 : monto,
    estado: (area?.estado as EstadoArea) ?? "ACTIVO",
  };
};

const mapToPayload = (values: AreaComunFormValues): AreaComunForm => ({
  nombre: values.nombre.trim(),
  monto_hora: normalizeMonto(values.monto_hora),
  estado: values.estado,
});

export function AreaComunStore({
  open,
  onClose,
  initialData,
  onSubmit,
  loading = false,
}: AreaComunStoreProps) {
  const [submitting, setSubmitting] = useState(false);
  const isEdit = useMemo(() => Boolean(initialData), [initialData]);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      form.reset(mapToFormValues(initialData));
    }
  }, [form, initialData, open]);

  const handleSubmit: SubmitHandler<AreaComunFormValues> = async (values) => {
    setSubmitting(true);
    form.clearErrors();
    const response = await onSubmit(values);
    setSubmitting(false);

    if (response.success) {
      form.reset(defaultValues);
      onClose();
      return;
    }

    if (response.errors && typeof response.errors === "object") {
      Object.entries(response.errors).forEach(([field, message]) => {
        if (field in values) {
          const errorMessage = Array.isArray(message)
            ? message.join(" ")
            : String(message);
          form.setError(field as keyof AreaComunFormValues, {
            type: "server",
            message: errorMessage,
          });
        } else if (field === "non_field_errors") {
          form.setError("root", {
            type: "server",
            message: Array.isArray(message)
              ? message.join(" ")
              : String(message),
          });
        }
      });
    } else if (typeof response.errors === "string") {
      form.setError("root", { type: "server", message: response.errors });
    } else if (response.error) {
      form.setError("root", { type: "server", message: response.error });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar área común" : "Registrar área común"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Actualiza la información del área común seleccionada"
              : "Completa los campos para registrar una nueva área común"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ej. Sala de reuniones"
                      disabled={loading || submitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="monto_hora"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto por hora (Bs.)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...field}
                      value={Number.isNaN(field.value as number) ? "" : (field.value as number)}
                      onChange={(event) => field.onChange(event.target.value)}
                      disabled={loading || submitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={loading || submitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {estadoOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <p className="text-sm text-destructive">
                {form.formState.errors.root.message}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading || submitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || submitting}>
                {(loading || submitting) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEdit ? "Guardar cambios" : "Crear área"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default AreaComunStore;
