import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { DatePicker } from '@/components/date-picker';
import { Loader2 } from 'lucide-react';
import type { Residente, ResidenteFormData } from '@/types';
import { toast } from 'sonner';

// Esquema de validación para residentes
const residenteSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  telefono: z.string().min(8, 'El teléfono debe tener al menos 8 caracteres'),
  email: z.string().email('Email inválido'),
  ci: z.string().min(7, 'La CI debe tener al menos 7 caracteres'),
  unidad_habitacional: z.string().min(1, 'La unidad habitacional es requerida'),
  tipo: z.enum(['propietario', 'inquilino']),
  fecha_ingreso: z.date().nullable(),
  estado: z.enum(['activo', 'inactivo', 'suspendido', 'en_proceso']),
  usuario: z.number().optional(),
}) satisfies z.ZodType<ResidenteFormData>;

interface ResidenteStoreProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ResidenteFormData) => Promise<boolean>;
  initialData?: Residente | null;
  loading?: boolean;
}

export function ResidenteStore({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  loading = false 
}: ResidenteStoreProps) {
  const isEdit = !!initialData;
  const title = isEdit ? 'Editar Residente' : 'Crear Residente';
  const description = isEdit 
    ? 'Modifica la información del residente seleccionado' 
    : 'Agrega un nuevo residente';

  const form = useForm<ResidenteFormData>({
    resolver: zodResolver(residenteSchema),
    defaultValues: {
      nombre: '',
      apellido: '',
      telefono: '',
      email: '',
      ci: '',
      unidad_habitacional: '',
      tipo: 'propietario',
      fecha_ingreso: null,
      estado: 'activo',
    },
  });

  // Cargar datos iniciales cuando se abre el modal en modo edición
  useEffect(() => {
    if (isOpen && initialData) {
      form.reset({
        nombre: initialData.nombre,
        apellido: initialData.apellido,
        telefono: initialData.telefono,
        email: initialData.email,
        ci: initialData.ci,
        unidad_habitacional: initialData.unidad_habitacional,
        tipo: initialData.tipo,
        fecha_ingreso: initialData.fecha_ingreso ? new Date(initialData.fecha_ingreso) : null,
        estado: initialData.estado,
        usuario: initialData.usuario,
      });
    } else if (isOpen && !initialData) {
      // Resetear formulario para crear nuevo
      form.reset({
        nombre: '',
        apellido: '',
        telefono: '',
        email: '',
        ci: '',
        unidad_habitacional: '',
        tipo: 'propietario',
        fecha_ingreso: null,
        estado: 'activo',
      });
    }
  }, [isOpen, initialData, form]);

  const handleSubmit = async (data: ResidenteFormData) => {
    // Requerir fecha_ingreso solo en creación; en edición (PATCH) puede omitirse
    if (!isEdit && !data.fecha_ingreso) {
      form.setError('fecha_ingreso', { type: 'required', message: 'La fecha de ingreso es requerida' });
      return;
    }
    const success = await onSubmit(data);
    if (success) {
      form.reset();
      onClose();
    } else {
      // Feedback si no se pudo guardar
      toast.error('No se pudo guardar los cambios. Revisa los campos y vuelve a intentar.');
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(async (values) => {
              console.log('[ResidenteStore] Submit iniciado', { isEdit, values });
              await handleSubmit(values);
              console.log('[ResidenteStore] Submit finalizado');
            })}
            className="space-y-6"
          >
            {/* Información Personal */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información Personal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nombre */}
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Apellido */}
                <FormField
                  control={form.control}
                  name="apellido"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellido *</FormLabel>
                      <FormControl>
                        <Input placeholder="Apellido" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Teléfono */}
                <FormField
                  control={form.control}
                  name="telefono"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono *</FormLabel>
                      <FormControl>
                        <Input placeholder="Teléfono" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* CI */}
                <FormField
                  control={form.control}
                  name="ci"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cédula de Identidad *</FormLabel>
                      <FormControl>
                        <Input placeholder="CI" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Unidad Habitacional */}
                <FormField
                  control={form.control}
                  name="unidad_habitacional"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unidad Habitacional *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: A-101, B-205" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Información de Residencia */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información de Residencia</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tipo de Residente */}
                <FormField
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Residente *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="propietario">Propietario</SelectItem>
                          <SelectItem value="inquilino">Inquilino</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Fecha de Ingreso */}
                <FormField
                  control={form.control}
                  name="fecha_ingreso"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Ingreso *</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value ?? null}
                          onChange={field.onChange}
                          placeholder="Seleccionar fecha"
                          maxDate={new Date()}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Estado */}
            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="inactivo">Inactivo</SelectItem>
                      <SelectItem value="suspendido">Suspendido</SelectItem>
                      <SelectItem value="en_proceso">En Proceso</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || form.formState.isSubmitting}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
