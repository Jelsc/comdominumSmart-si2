import React, { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ESTADOS_UNIDAD } from "@/types/unidades";
import type { Unidad, UnidadForm } from "@/types/unidades";
import { createUnidad, updateUnidad } from "@/services/unidadesService";

interface StoreProps {
  open: boolean;
  onClose: () => void;
  unidad: Unidad | null;
  onSuccess: () => void;
}

// Definimos nuestro esquema de formulario
const formSchema = z.object({
  codigo: z.string()
    .min(1, { message: "El código es requerido" })
    .regex(/^[A-Z]-\d{3}$/, { 
      message: "El código debe tener el formato A-101, B-202, etc. (letra mayúscula, guion, tres dígitos)" 
    }),
  direccion: z.string().min(1, { message: "La dirección es requerida" }),
  estado: z.enum(["OCUPADA", "DESOCUPADA", "MANTENIMIENTO"]),
  cantidad_vehiculos: z.number().min(0, { message: "Debe ser un número positivo" })
});

type FormValues = z.infer<typeof formSchema>;

export default function Store({ open, onClose, unidad, onSuccess }: StoreProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!unidad;

  // Usamos FormValues como tipo genérico para useForm
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      codigo: "",
      direccion: "",
      estado: "DESOCUPADA",
      cantidad_vehiculos: 0
    },
  });

  // Cargar datos si estamos editando
  useEffect(() => {
    if (unidad) {
      form.reset({
        codigo: unidad.codigo || "",
        direccion: unidad.direccion || "",
        estado: unidad.estado || "DESOCUPADA",
        cantidad_vehiculos: unidad.cantidad_vehiculos || 0
      });
    } else {
      form.reset({
        codigo: "",
        direccion: "",
        estado: "DESOCUPADA",
        cantidad_vehiculos: 0
      });
    }
  }, [unidad, form]);

  // Especificamos explícitamente el tipo FormValues para onSubmit
  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      // Convertimos los valores del formulario al formato esperado por la API
      const unidadData: UnidadForm = {
        codigo: values.codigo,
        direccion: values.direccion,
        estado: values.estado,
        cantidad_vehiculos: values.cantidad_vehiculos,
        residente_ids: null
      };

      if (isEditing && unidad) {
        await updateUnidad(unidad.id, unidadData);
        toast.success("Unidad habitacional actualizada correctamente");
      } else {
        await createUnidad(unidadData);
        toast.success("Unidad habitacional creada correctamente");
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      // Mostrar el error detallado del backend si existe
      let errorMsg = `Error al ${isEditing ? "actualizar" : "crear"} la unidad habitacional.`;
      if (error?.data) {
        if (typeof error.data === 'object') {
          // Si el backend devuelve un dict de errores, lo mostramos
          errorMsg += '\n';
          errorMsg += Object.entries(error.data)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
            .join('\n');
        } else {
          errorMsg += `\n${error.data}`;
        }
      } else if (error?.message) {
        errorMsg += `\n${error.message}`;
      }
      console.error("Error al guardar la unidad:", error);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar" : "Crear"} Unidad Habitacional
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Modifica los datos de la unidad habitacional" 
              : "Ingresa los datos para la nueva unidad habitacional (formato de código: A-101)"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="codigo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={loading} placeholder="A-101" />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      Formato requerido: letra mayúscula, guion, tres dígitos (ej: A-101)
                    </p>
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
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ESTADOS_UNIDAD.map((estado) => (
                          <SelectItem key={estado} value={estado}>
                            {estado === "OCUPADA" 
                              ? "Ocupada" 
                              : estado === "DESOCUPADA" 
                              ? "Desocupada" 
                              : "En Mantenimiento"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="direccion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cantidad_vehiculos"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad de Vehículos</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      disabled={loading} 
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campos eliminados: tamaño, descripción, características, observaciones */}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading
                  ? "Guardando..."
                  : isEditing
                  ? "Actualizar"
                  : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}