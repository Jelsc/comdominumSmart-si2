import React from "react";
import {
  Bell,
  Send,
  Clock,
  X,
  Users,
  AlertTriangle,
  CheckCircle,
  FileText,
  TrendingUp,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import type { NotificacionEstadisticas } from "@/types";

interface NotificacionesStatsProps {
  estadisticas?: NotificacionEstadisticas | null;
  loading?: boolean;
}

export function NotificacionesStats({
  estadisticas,
  loading = false,
}: NotificacionesStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!estadisticas) {
    return null;
  }

  const estadisticasCards = [
    {
      title: "Total Notificaciones",
      value: estadisticas.total,
      icon: Bell,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      description: "Todas las notificaciones en el sistema",
    },
    {
      title: "Notificaciones Activas",
      value: estadisticas.activas,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
      description: "Notificaciones disponibles para envío",
      percentage:
        estadisticas.total > 0
          ? ((estadisticas.activas / estadisticas.total) * 100).toFixed(1)
          : "0",
    },
    {
      title: "Individuales",
      value: estadisticas.individuales,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      description: "Notificaciones personalizadas por usuario",
      percentage:
        estadisticas.total > 0
          ? ((estadisticas.individuales / estadisticas.total) * 100).toFixed(1)
          : "0",
    },
    {
      title: "Enviadas",
      value: estadisticas.por_estado.enviada,
      icon: Send,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      description: "Notificaciones ya enviadas a los destinatarios",
      percentage:
        estadisticas.total > 0
          ? (
              (estadisticas.por_estado.enviada / estadisticas.total) *
              100
            ).toFixed(1)
          : "0",
    },
  ];

  const estadoItems = [
    {
      label: "Borradores",
      value: estadisticas.por_estado.borrador,
      icon: FileText,
      color: "text-gray-600",
      badgeVariant: "secondary" as const,
    },
    {
      label: "Programadas",
      value: estadisticas.por_estado.programada,
      icon: Clock,
      color: "text-blue-600",
      badgeVariant: "default" as const,
    },
    {
      label: "Enviadas",
      value: estadisticas.por_estado.enviada,
      icon: Send,
      color: "text-green-600",
      badgeVariant: "default" as const,
    },
    {
      label: "Canceladas",
      value: estadisticas.por_estado.cancelada,
      icon: X,
      color: "text-red-600",
      badgeVariant: "destructive" as const,
    },
  ];

  const prioridadItems = [
    {
      label: "Urgente",
      value: estadisticas.por_prioridad.urgente,
      color: "bg-red-500",
      badgeVariant: "destructive" as const,
    },
    {
      label: "Alta",
      value: estadisticas.por_prioridad.alta,
      color: "bg-orange-500",
      badgeVariant: "secondary" as const,
    },
    {
      label: "Normal",
      value: estadisticas.por_prioridad.normal,
      color: "bg-yellow-500",
      badgeVariant: "secondary" as const,
    },
    {
      label: "Baja",
      value: estadisticas.por_prioridad.baja,
      color: "bg-gray-500",
      badgeVariant: "outline" as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tarjetas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {estadisticasCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <TooltipProvider key={stat.title}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="hover:shadow-md transition-shadow cursor-help">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </CardTitle>
                      <div className={`p-2 rounded-md ${stat.bgColor}`}>
                        <Icon className={`h-4 w-4 ${stat.color}`} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline justify-between">
                        <div className="text-2xl font-bold">{stat.value}</div>
                        {stat.percentage && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {stat.percentage}%
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stat.description}
                      </p>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{stat.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>

      {/* Desglose por estado y prioridad */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Por estado */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Distribución por Estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {estadoItems.map((item) => {
                const Icon = item.icon;
                const percentage =
                  estadisticas.total > 0
                    ? ((item.value / estadisticas.total) * 100).toFixed(1)
                    : "0";

                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 ${item.color}`} />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {percentage}%
                      </span>
                      <Badge variant={item.badgeVariant}>{item.value}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Por prioridad */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Distribución por Prioridad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {prioridadItems.map((item) => {
                const percentage =
                  estadisticas.total > 0
                    ? ((item.value / estadisticas.total) * 100).toFixed(1)
                    : "0";

                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${item.color}`} />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {percentage}%
                      </span>
                      <Badge variant={item.badgeVariant}>{item.value}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Por tipo (si hay datos) */}
      {Object.keys(estadisticas.por_tipo).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Distribución por Tipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(estadisticas.por_tipo).map(([tipo, cantidad]) => {
                const percentage =
                  estadisticas.total > 0
                    ? ((cantidad / estadisticas.total) * 100).toFixed(1)
                    : "0";

                return (
                  <div
                    key={tipo}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <span className="font-medium capitalize">{tipo}</span>
                      <p className="text-sm text-muted-foreground">
                        {percentage}% del total
                      </p>
                    </div>
                    <Badge variant="outline">{cantidad}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
