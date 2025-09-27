import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Calendar,
  Users,
  Save,
  X,
  Bell,
  AlertTriangle,
  Clock,
} from "lucide-react";

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import type { Notificacion, NotificacionFormData, RolOption } from "@/types";
import { notificacionesService } from "@/services/notificacionesService";

const notificacionSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  descripcion: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres"),
  tipo: z.enum([
    "general",
    "mantenimiento",
    "reunion",
    "emergencia",
    "evento",
    "cobranza",
  ]),
  estado: z.enum(["borrador", "programada"]),
  roles_destinatarios: z
    .array(z.number())
    .min(1, "Debe seleccionar al menos un rol destinatario"),
  es_individual: z.boolean(),
  usuarios_seleccionados: z.array(z.number()).optional(),
  fecha_programada: z.date().nullable(),
  fecha_expiracion: z.date().nullable(),
  prioridad: z.enum(["baja", "normal", "alta", "urgente"]),
  requiere_confirmacion: z.boolean(),
  activa: z.boolean(),
});

type NotificacionSchemaType = z.infer<typeof notificacionSchema>;

interface NotificacionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notificacion?: Notificacion | null;
  roles: RolOption[];
  onSubmit: (data: NotificacionFormData) => Promise<void>;
  loading?: boolean;
}

const tiposNotificacion = [
  { value: "general", label: "General", icon: Bell },
  { value: "mantenimiento", label: "Mantenimiento", icon: AlertTriangle },
  { value: "reunion", label: "Reunión", icon: Users },
  { value: "emergencia", label: "Emergencia", icon: AlertTriangle },
  { value: "evento", label: "Evento", icon: Calendar },
  { value: "cobranza", label: "Cobranza", icon: Clock },
];

const prioridades = [
  { value: "baja", label: "Baja", color: "bg-gray-500" },
  { value: "normal", label: "Normal", color: "bg-yellow-500" },
  { value: "alta", label: "Alta", color: "bg-orange-500" },
  { value: "urgente", label: "Urgente", color: "bg-red-500" },
];

export function NotificacionForm({
  open,
  onOpenChange,
  notificacion,
  roles,
  onSubmit,
  loading = false,
}: NotificacionFormProps) {
  const form = useForm<NotificacionSchemaType>({
    resolver: zodResolver(notificacionSchema),
    defaultValues: {
      nombre: "",
      descripcion: "",
      tipo: "general",
      estado: "borrador",
      roles_destinatarios: [],
      es_individual: false,
      usuarios_seleccionados: [],
      fecha_programada: null,
      fecha_expiracion: null,
      prioridad: "normal",
      requiere_confirmacion: false,
      activa: true,
    },
  });

  // Estado para usuarios por rol
  const [usuariosPorRol, setUsuariosPorRol] = useState<
    {
      rol_id: number;
      rol_nombre: string;
      usuarios: Array<{
        id: number;
        first_name: string;
        last_name: string;
        email: string;
        nombre_completo: string;
      }>;
      total_usuarios: number;
    }[]
  >([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);

  // Cargar datos del formulario cuando se edita
  useEffect(() => {
    if (notificacion) {
      form.reset({
        nombre: notificacion.nombre,
        descripcion: notificacion.descripcion,
        tipo: notificacion.tipo,
        estado:
          notificacion.estado === "enviada" ||
          notificacion.estado === "cancelada"
            ? "programada"
            : (notificacion.estado as "borrador" | "programada"),
        roles_destinatarios: notificacion.roles_destinatarios,
        es_individual: notificacion.es_individual,
        usuarios_seleccionados: [], // TODO: obtener usuarios seleccionados si los hay
        fecha_programada: notificacion.fecha_programada
          ? new Date(notificacion.fecha_programada)
          : null,
        fecha_expiracion: notificacion.fecha_expiracion
          ? new Date(notificacion.fecha_expiracion)
          : null,
        prioridad: notificacion.prioridad,
        requiere_confirmacion: notificacion.requiere_confirmacion,
        activa: notificacion.activa,
      });
    } else {
      form.reset({
        nombre: "",
        descripcion: "",
        tipo: "general",
        estado: "borrador",
        roles_destinatarios: [],
        es_individual: false,
        usuarios_seleccionados: [],
        fecha_programada: null,
        fecha_expiracion: null,
        prioridad: "normal",
        requiere_confirmacion: false,
        activa: true,
      });
    }
  }, [notificacion, form]);

  // Cargar usuarios cuando cambian los roles seleccionados y es notificación individual
  useEffect(() => {
    const rolesSeleccionados = form.watch("roles_destinatarios");
    const esIndividual = form.watch("es_individual");

    if (esIndividual && rolesSeleccionados && rolesSeleccionados.length > 0) {
      const loadUsuarios = async () => {
        setLoadingUsuarios(true);
        try {
          const usuarios = await notificacionesService.getUsuariosPorRol(
            rolesSeleccionados
          );
          setUsuariosPorRol(usuarios);
        } catch (error) {
          console.error("Error cargando usuarios:", error);
          setUsuariosPorRol([]);
        } finally {
          setLoadingUsuarios(false);
        }
      };

      loadUsuarios();
    } else {
      setUsuariosPorRol([]);
      form.setValue("usuarios_seleccionados", []);
    }
  }, [form.watch("roles_destinatarios"), form.watch("es_individual"), form]);

  const handleSubmit = async (data: NotificacionSchemaType) => {
    const formData: NotificacionFormData = {
      nombre: data.nombre,
      descripcion: data.descripcion,
      tipo: data.tipo,
      estado: data.estado,
      roles_destinatarios: data.roles_destinatarios,
      es_individual: data.es_individual,
      usuarios_seleccionados: data.usuarios_seleccionados || [],
      fecha_programada: data.fecha_programada,
      fecha_expiracion: data.fecha_expiracion,
      prioridad: data.prioridad,
      requiere_confirmacion: data.requiere_confirmacion,
      activa: data.activa,
    };

    await onSubmit(formData);
    onOpenChange(false);
  };

  const formatFecha = (fecha: Date) => {
    return fecha.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getRolesBadges = (rolesSeleccionados: number[]) => {
    return roles
      .filter((rol) => rolesSeleccionados.includes(rol.id))
      .map((rol) => (
        <Badge key={rol.id} variant="secondary" className="mr-1 mb-1">
          {rol.nombre}
        </Badge>
      ));
  };

  const getTotalDestinatarios = (rolesSeleccionados: number[]) => {
    return roles
      .filter((rol) => rolesSeleccionados.includes(rol.id))
      .reduce((total, rol) => total + rol.total_usuarios, 0);
  };

  const getUsuariosPorRoles = (rolesSeleccionados: number[]) => {
    if (!roles || rolesSeleccionados.length === 0) return [];

    return roles
      .filter((rol) => rolesSeleccionados.includes(rol.id))
      .map((rol) => ({
        rolId: rol.id,
        rolNombre: rol.nombre,
        totalUsuarios: rol.total_usuarios,
      }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {notificacion ? "Editar Notificación" : "Nueva Notificación"}
          </DialogTitle>
          <DialogDescription>
            {notificacion
              ? "Modifica la información de la notificación"
              : "Completa los datos para crear una nueva notificación"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Información básica */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información Básica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Nombre */}
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la notificación</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: Mantenimiento del ascensor"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Descripción */}
                <FormField
                  control={form.control}
                  name="descripcion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe el contenido de la notificación..."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tipo y Prioridad */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tipo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {tiposNotificacion.map((tipo) => {
                              const Icon = tipo.icon;
                              return (
                                <SelectItem key={tipo.value} value={tipo.value}>
                                  <div className="flex items-center gap-2">
                                    <Icon className="h-4 w-4" />
                                    {tipo.label}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="prioridad"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prioridad</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar prioridad" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {prioridades.map((prioridad) => (
                              <SelectItem
                                key={prioridad.value}
                                value={prioridad.value}
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-3 h-3 rounded-full ${prioridad.color}`}
                                  />
                                  {prioridad.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Estado */}
                <FormField
                  control={form.control}
                  name="estado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado inicial</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="borrador">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-gray-500" />
                              Borrador
                            </div>
                          </SelectItem>
                          <SelectItem value="programada">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-blue-500" />
                              Programada
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Las notificaciones en borrador no se enviarán
                        automáticamente
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Destinatarios */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Destinatarios
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Roles destinatarios */}
                <FormField
                  control={form.control}
                  name="roles_destinatarios"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Roles destinatarios</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          {roles.map((rol) => (
                            <div
                              key={rol.id}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                checked={field.value?.includes(rol.id) || false}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([
                                      ...(field.value || []),
                                      rol.id,
                                    ]);
                                  } else {
                                    field.onChange(
                                      (field.value || []).filter(
                                        (id) => id !== rol.id
                                      )
                                    );
                                  }
                                }}
                              />
                              <div className="flex-1 flex items-center justify-between">
                                <span className="font-medium">
                                  {rol.nombre}
                                </span>
                                <Badge variant="outline">
                                  {rol.total_usuarios} usuarios
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Selecciona a qué roles se enviará la notificación
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Resumen de destinatarios */}
                {form.watch("roles_destinatarios")?.length > 0 && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">
                      Resumen de destinatarios:
                    </h4>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {getRolesBadges(form.watch("roles_destinatarios") || [])}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Total de destinatarios:{" "}
                      {getTotalDestinatarios(
                        form.watch("roles_destinatarios") || []
                      )}{" "}
                      usuarios
                    </p>
                  </div>
                )}

                {/* Notificación individual */}
                <FormField
                  control={form.control}
                  name="es_individual"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Notificación individual
                        </FormLabel>
                        <FormDescription>
                          Se enviará una notificación personalizada a cada
                          destinatario según su rol
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Información adicional cuando es individual */}
                {form.watch("es_individual") && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
                    <div className="flex items-start gap-2">
                      <Bell className="h-4 w-4 text-blue-600 mt-1" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-900">
                          Notificación Individual Activada
                        </h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Esta notificación se personalizará automáticamente
                          para cada usuario según su rol y preferencias. Se
                          enviará de forma individual a cada destinatario en los
                          roles seleccionados.
                        </p>
                      </div>
                    </div>

                    {/* Lista de usuarios por rol cuando hay roles seleccionados */}
                    {form.watch("roles_destinatarios") &&
                      form.watch("roles_destinatarios").length > 0 && (
                        <div className="border-t border-blue-200 pt-3">
                          <h5 className="text-sm font-medium text-blue-900 mb-2">
                            Seleccionar usuarios individuales:
                          </h5>

                          {loadingUsuarios ? (
                            <div className="text-sm text-blue-600 py-2">
                              Cargando usuarios...
                            </div>
                          ) : (
                            <FormField
                              control={form.control}
                              name="usuarios_seleccionados"
                              render={({ field }) => (
                                <FormItem>
                                  <div className="space-y-3 max-h-60 overflow-y-auto">
                                    {usuariosPorRol.map((rolData) => (
                                      <div
                                        key={rolData.rol_id}
                                        className="bg-white rounded-md border border-blue-100"
                                      >
                                        <div className="p-2 bg-blue-25 border-b border-blue-100">
                                          <div className="flex items-center justify-between">
                                            <h6 className="text-sm font-medium text-blue-900">
                                              {rolData.rol_nombre}
                                            </h6>
                                            <Badge
                                              variant="outline"
                                              className="text-blue-700 border-blue-300"
                                            >
                                              {rolData.total_usuarios} usuarios
                                            </Badge>
                                          </div>
                                        </div>
                                        <div className="p-2 space-y-2">
                                          {rolData.usuarios.map((usuario) => (
                                            <div
                                              key={usuario.id}
                                              className="flex items-center space-x-2"
                                            >
                                              <Checkbox
                                                checked={
                                                  field.value?.includes(
                                                    usuario.id
                                                  ) || false
                                                }
                                                onCheckedChange={(checked) => {
                                                  const currentSelection =
                                                    field.value || [];
                                                  if (checked) {
                                                    field.onChange([
                                                      ...currentSelection,
                                                      usuario.id,
                                                    ]);
                                                  } else {
                                                    field.onChange(
                                                      currentSelection.filter(
                                                        (id) =>
                                                          id !== usuario.id
                                                      )
                                                    );
                                                  }
                                                }}
                                              />
                                              <label className="text-sm text-gray-700 cursor-pointer flex-1">
                                                {usuario.nombre_completo}
                                                <span className="text-xs text-gray-500 ml-1">
                                                  ({usuario.email})
                                                </span>
                                              </label>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        </div>
                      )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Programación */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Programación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Fechas */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fecha_programada"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha programada</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={`pl-3 text-left font-normal ${
                                  !field.value && "text-muted-foreground"
                                }`}
                              >
                                {field.value
                                  ? formatFecha(field.value)
                                  : "Seleccionar fecha"}
                                <Calendar className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto p-0 z-50"
                            align="start"
                          >
                            <div className="p-3 bg-white border rounded-md shadow-lg">
                              <CalendarComponent
                                mode="single"
                                selected={field.value || undefined}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < new Date("2025-01-01")
                                }
                                initialFocus
                              />
                            </div>
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Cuándo se enviará la notificación
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fecha_expiracion"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha de expiración</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={`pl-3 text-left font-normal ${
                                  !field.value && "text-muted-foreground"
                                }`}
                              >
                                {field.value
                                  ? formatFecha(field.value)
                                  : "Seleccionar fecha"}
                                <Calendar className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto p-0 z-50"
                            align="start"
                          >
                            <div className="p-3 bg-white border rounded-md shadow-lg">
                              <CalendarComponent
                                mode="single"
                                selected={field.value || undefined}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < new Date("2025-01-01")
                                }
                                initialFocus
                              />
                            </div>
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Cuándo dejará de mostrarse la notificación
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Opciones adicionales */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Opciones adicionales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="requiere_confirmacion"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Requiere confirmación
                        </FormLabel>
                        <FormDescription>
                          Los destinatarios deberán confirmar que recibieron la
                          notificación
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="activa"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Notificación activa
                        </FormLabel>
                        <FormDescription>
                          Define si la notificación estará disponible para envío
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading
                  ? "Guardando..."
                  : notificacion
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
