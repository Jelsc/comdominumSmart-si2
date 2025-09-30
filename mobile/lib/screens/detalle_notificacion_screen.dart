import 'package:flutter/material.dart';
import '../services/notificacion_service.dart';

class DetalleNotificacionScreen extends StatefulWidget {
  final Notificacion notificacion;

  const DetalleNotificacionScreen({
    super.key,
    required this.notificacion,
  });

  @override
  State<DetalleNotificacionScreen> createState() => _DetalleNotificacionScreenState();
}

class _DetalleNotificacionScreenState extends State<DetalleNotificacionScreen> {
  final NotificacionService _notificacionService = NotificacionService();
  bool _isLoading = false;

  Future<void> _marcarComoLeida() async {
    if (widget.notificacion.esLeida) return;

    setState(() {
      _isLoading = true;
    });

    try {
      await _notificacionService.marcarComoLeida(widget.notificacion.id);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Notificación marcada como leída'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pop(context, true); // Retornar true para indicar que se marcó como leída
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al marcar como leída: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Detalle de Notificación'),
        backgroundColor: _getTipoColor(widget.notificacion.tipo),
        foregroundColor: Colors.white,
        actions: [
          if (!widget.notificacion.esLeida)
            IconButton(
              icon: _isLoading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                      ),
                    )
                  : const Icon(Icons.mark_email_read),
              onPressed: _marcarComoLeida,
              tooltip: 'Marcar como leída',
            ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header con información principal
            Card(
              elevation: 4,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        CircleAvatar(
                          backgroundColor: _getTipoColor(widget.notificacion.tipo),
                          child: Icon(
                            _getTipoIcon(widget.notificacion.tipo),
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                widget.notificacion.nombre,
                                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                widget.notificacion.tipoDisplay,
                                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  color: _getTipoColor(widget.notificacion.tipo),
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ),
                        if (widget.notificacion.esLeida)
                          const Icon(
                            Icons.check_circle,
                            color: Colors.green,
                            size: 24,
                          ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        _buildInfoChip(
                          'Prioridad',
                          widget.notificacion.prioridadDisplay,
                          _getPrioridadColor(widget.notificacion.prioridad),
                        ),
                        const SizedBox(width: 8),
                        _buildInfoChip(
                          'Estado',
                          widget.notificacion.estadoDisplay,
                          _getEstadoColor(widget.notificacion.estado),
                        ),
                        if (widget.notificacion.esIndividual) ...[
                          const SizedBox(width: 8),
                          _buildInfoChip(
                            'Individual',
                            'Sí',
                            Colors.purple,
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 16),
            
            // Descripción
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Descripción',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      widget.notificacion.descripcion,
                      style: Theme.of(context).textTheme.bodyLarge,
                    ),
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 16),
            
            // Información adicional
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Información Adicional',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    _buildInfoRow(
                      'Fecha de Creación',
                      '${widget.notificacion.fechaCreacionFormateada} ${widget.notificacion.horaCreacionFormateada}',
                      Icons.calendar_today,
                    ),
                    if (widget.notificacion.fechaProgramada != null)
                      _buildInfoRow(
                        'Fecha Programada',
                        '${widget.notificacion.fechaProgramada!.day}/${widget.notificacion.fechaProgramada!.month}/${widget.notificacion.fechaProgramada!.year} ${widget.notificacion.fechaProgramada!.hour.toString().padLeft(2, '0')}:${widget.notificacion.fechaProgramada!.minute.toString().padLeft(2, '0')}',
                        Icons.schedule,
                      ),
                    if (widget.notificacion.fechaExpiracion != null)
                      _buildInfoRow(
                        'Fecha de Expiración',
                        '${widget.notificacion.fechaExpiracion!.day}/${widget.notificacion.fechaExpiracion!.month}/${widget.notificacion.fechaExpiracion!.year}',
                        Icons.event_busy,
                      ),
                    if (widget.notificacion.creadoPor != null)
                      _buildInfoRow(
                        'Creado por',
                        widget.notificacion.creadoPor!,
                        Icons.person,
                      ),
                    _buildInfoRow(
                      'Requiere Confirmación',
                      widget.notificacion.requiereConfirmacion ? 'Sí' : 'No',
                      Icons.check_circle_outline,
                    ),
                    _buildInfoRow(
                      'Activa',
                      widget.notificacion.activa ? 'Sí' : 'No',
                      Icons.power_settings_new,
                    ),
                  ],
                ),
              ),
            ),
            
            if (widget.notificacion.rolesDestinatarios.isNotEmpty) ...[
              const SizedBox(height: 16),
              
              // Roles destinatarios
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Roles Destinatarios',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: widget.notificacion.rolesDestinatarios
                            .map((rol) => Chip(
                                  label: Text(rol.nombre),
                                  backgroundColor: Colors.blue.withOpacity(0.1),
                                  side: BorderSide(color: Colors.blue.withOpacity(0.3)),
                                ))
                            .toList(),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
      bottomNavigationBar: !widget.notificacion.esLeida
          ? Container(
              padding: const EdgeInsets.all(16),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _isLoading ? null : _marcarComoLeida,
                  icon: _isLoading
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : const Icon(Icons.mark_email_read),
                  label: Text(_isLoading ? 'Marcando...' : 'Marcar como Leída'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                ),
              ),
            )
          : null,
    );
  }

  Widget _buildInfoChip(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Text(
        '$label: $value',
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, IconData icon) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, size: 20, color: Colors.grey[600]),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.grey[600],
                    fontWeight: FontWeight.w500,
                  ),
                ),
                Text(
                  value,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Color _getTipoColor(String tipo) {
    switch (tipo) {
      case 'general':
        return Colors.blue;
      case 'mantenimiento':
        return Colors.orange;
      case 'reunion':
        return Colors.purple;
      case 'aviso':
        return Colors.cyan;
      case 'emergencia':
        return Colors.red;
      case 'pagos':
        return Colors.green;
      case 'evento':
        return Colors.pink;
      default:
        return Colors.grey;
    }
  }

  IconData _getTipoIcon(String tipo) {
    switch (tipo) {
      case 'general':
        return Icons.info;
      case 'mantenimiento':
        return Icons.build;
      case 'reunion':
        return Icons.people;
      case 'aviso':
        return Icons.campaign;
      case 'emergencia':
        return Icons.warning;
      case 'pagos':
        return Icons.payment;
      case 'evento':
        return Icons.event;
      default:
        return Icons.notifications;
    }
  }

  Color _getPrioridadColor(String prioridad) {
    switch (prioridad) {
      case 'baja':
        return Colors.grey;
      case 'normal':
        return Colors.blue;
      case 'alta':
        return Colors.orange;
      case 'urgente':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  Color _getEstadoColor(String estado) {
    switch (estado) {
      case 'borrador':
        return Colors.grey;
      case 'programada':
        return Colors.blue;
      case 'enviada':
        return Colors.green;
      case 'cancelada':
        return Colors.red;
      case 'leida':
        return Colors.green;
      default:
        return Colors.grey;
    }
  }
}
