import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { type AreaComun } from "@/types";
import {
  type CategoriaInventario,
  type EstadoInventario,
  estadoInventarioLabels,
  categoriaInventarioLabels,
  type Inventario,
  type InventarioForm
} from "@/types/inventario";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import type { InventarioApiResponse } from "@/services/inventario.api";

// Usamos as any para evitar problemas con TypeScript y configuración de exactOptionalPropertyTypes
const inventarioSchema = z.object({
  nombre: z.string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .nonempty("El nombre es requerido"),
  categoria: z.enum(["MOBILIARIO", "ELECTRODOMESTICO", "EQUIPO_TECNOLOGICO", "HERRAMIENTA", "DECORACION", "OTRO"] as const),
  estado: z.enum(["ACTIVO", "INACTIVO", "EN_REPARACION", "DADO_DE_BAJA"] as const),
  area_comun: z.number().nullable(),
  valor_estimado: z.union([z.string(), z.number()]),
  ubicacion: z.string()
    .min(2, "La ubicación debe tener al menos 2 caracteres")
    .nonempty("La ubicación es requerida"),
  fecha_adquisicion: z.string().nonempty("La fecha de adquisición es requerida"),
  descripcion: z.string().nullable().optional(),
}) as any;

// Tipo derivado del esquema Zod
type FormValues = z.infer<typeof inventarioSchema>;

interface InventarioStoreProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: InventarioForm) => Promise<InventarioApiResponse<Inventario>>;
  item?: Inventario | null;
  isEdit?: boolean;
  loading?: boolean;
  areasComunes: AreaComun[];
}

export function InventarioStore({
  open,
  onClose,
  onSubmit,
  item,
  isEdit = false,
  loading = false,
  areasComunes,
}: InventarioStoreProps) {
  // Utilizamos any para evitar problemas de compatibilidad de tipos
  const form = useForm<FormValues>({
    resolver: zodResolver(inventarioSchema) as any,
    defaultValues: {
      nombre: "",
      categoria: "MOBILIARIO",
      estado: "ACTIVO",
      area_comun: null,
      valor_estimado: "0", // Usamos string para cumplir con el esquema
      ubicacion: "",
      fecha_adquisicion: new Date().toISOString().split("T")[0],
      descripcion: null,
    },
  });

  const [error, setError] = React.useState<string | null>(null);

  // Actualizar el formulario cuando cambia el item o se abre el modal
  useEffect(() => {
    if (item && open) {
      // Usar as any para evitar problemas de tipos
      const updatedValues = {
        nombre: item.nombre || "",
        categoria: item.categoria,
        estado: item.estado,
        area_comun: typeof item.area_comun === 'number' ? item.area_comun : null,
        valor_estimado: typeof item.valor_estimado === 'number' ? 
          item.valor_estimado.toString() : 
          (item.valor_estimado || "0"),
        ubicacion: item.ubicacion || "",
        fecha_adquisicion: item.fecha_adquisicion || new Date().toISOString().split("T")[0],
        descripcion: item.descripcion || null
      } as any;
      
      // Resetear el formulario con los valores actualizados
      form.reset(updatedValues);
    } else if (!isEdit) {
      // Resetear a valores predeterminados para crear nuevo item
      form.reset({
        nombre: "",
        categoria: "MOBILIARIO",
        estado: "ACTIVO",
        area_comun: null,
        valor_estimado: "0",
        ubicacion: "",
        fecha_adquisicion: new Date().toISOString().split("T")[0],
        descripcion: null
      } as any);
    }
  }, [item, open, isEdit, form]);

  const handleSubmit = async (data: FormValues) => {
    setError(null);
    try {
      // Usamos as para forzar el tipo correcto
      const formData = {
        nombre: data.nombre,
        categoria: data.categoria,
        estado: data.estado,
        area_comun: data.area_comun,
        valor_estimado: data.valor_estimado,
        ubicacion: data.ubicacion,
        fecha_adquisicion: data.fecha_adquisicion || new Date().toISOString().split("T")[0],
        descripcion: data.descripcion === undefined ? null : data.descripcion
      } as InventarioForm;
      
      const response = await onSubmit(formData);
      
      if (response.success) {
        form.reset();
        onClose();
      } else {
        setError(response.error || "Error al guardar el elemento");
      }
    } catch (err: any) {
      setError(err.message || "Error inesperado");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar" : "Crear"} Inventario</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modifica la información del elemento del inventario."
              : "Agrega un nuevo elemento al inventario."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit as any)} className="space-y-5 py-2">
            <FormField
              control={form.control as any}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del elemento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="categoria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(categoriaInventarioLabels)
                        .filter(([key]) => key !== "all")
                        .map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="estado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(estadoInventarioLabels)
                        .filter(([key]) => key !== "all")
                        .map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="area_comun"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Área Común</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === "null" ? null : parseInt(value))}
                    value={field.value?.toString() ?? "null"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un área común" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="null">Ninguna</SelectItem>
                      {areasComunes.map((area) => (
                        <SelectItem key={area.id} value={area.id.toString()}>
                          {area.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="valor_estimado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Estimado</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Valor estimado"
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                      value={field.value || 0}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="ubicacion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ubicación</FormLabel>
                  <FormControl>
                    <Input placeholder="Ubicación del elemento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="fecha_adquisicion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Adquisición</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                      value={field.value || ''} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción del elemento"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <div className="text-red-500 text-sm mt-2">{error}</div>
            )}

            <DialogFooter className="mt-5">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="mr-2"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "Actualizar" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}