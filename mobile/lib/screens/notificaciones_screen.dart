import 'package:flutter/material.dart';
import '../services/notificacion_service.dart';
import '../models/notificacion.dart';
import 'detalle_notificacion_screen.dart';

class NotificacionesScreen extends StatefulWidget {
  const NotificacionesScreen({super.key});

  @override
  State<NotificacionesScreen> createState() => _NotificacionesScreenState();
}

class _NotificacionesScreenState extends State<NotificacionesScreen>
    with SingleTickerProviderStateMixin {
  final NotificacionService _notificacionService = NotificacionService();
  late TabController _tabController;
  
  List<Notificacion> _notificaciones = [];
  List<Notificacion> _notificacionesNoLeidas = [];
  List<Notificacion> _notificacionesLeidas = [];
  bool _isLoading = true;
  String? _error;
  NotificacionEstadisticas? _estadisticas;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _inicializarYcargarNotificaciones();
  }
  
  Future<void> _inicializarYcargarNotificaciones() async {
    _cargarNotificaciones();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _cargarNotificaciones() async {
    try {
      setState(() {
        _isLoading = true;
        _error = null;
      });

      final notificaciones = await _notificacionService.getNotificaciones();
      final noLeidas = await _notificacionService.getNotificaciones(noLeidas: true);
      
      // Intentar cargar estadísticas, pero no fallar si no hay permisos
      NotificacionEstadisticas? estadisticas;
      try {
        estadisticas = await _notificacionService.getEstadisticas();
      } catch (e) {
        // Si no hay permisos para estadísticas, continuar sin ellas
        print('No se pudieron cargar estadísticas: $e');
      }

      setState(() {
        _notificaciones = notificaciones;
        _notificacionesNoLeidas = noLeidas;
        _notificacionesLeidas = notificaciones.where((n) => n.estado == 'leida').toList();
        _estadisticas = estadisticas;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _marcarComoLeida(Notificacion notificacion) async {
    try {
      await _notificacionService.marcarComoLeida(notificacion.id);
      await _cargarNotificaciones(); // Recargar para actualizar estados
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error al marcar como leída: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notificaciones'),
        backgroundColor: Colors.blue[600],
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _cargarNotificaciones,
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          indicatorColor: Colors.white,
          tabs: [
            Tab(
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text('Todas'),
                  if (_estadisticas != null && _estadisticas!.total > 0)
                    Container(
                      margin: const EdgeInsets.only(left: 8),
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        '${_estadisticas!.total}',
                        style: TextStyle(
                          color: Colors.blue[600],
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                ],
              ),
            ),
            Tab(
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text('No leídas'),
                  if (_estadisticas != null && _estadisticas!.noLeidas > 0)
                    Container(
                      margin: const EdgeInsets.only(left: 8),
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.red,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Text(
                        'N',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                ],
              ),
            ),
            Tab(
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text('Leídas'),
                  if (_notificacionesLeidas.isNotEmpty)
                    Container(
                      margin: const EdgeInsets.only(left: 8),
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.green,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        '${_notificacionesLeidas.length}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? _buildErrorWidget()
              : TabBarView(
                  controller: _tabController,
                  children: [
                    _buildNotificacionesList(_notificaciones),
                    _buildNotificacionesList(_notificacionesNoLeidas),
                    _buildNotificacionesList(_notificacionesLeidas),
                  ],
                ),
    );
  }

  Widget _buildErrorWidget() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.error_outline,
            size: 64,
            color: Colors.red[300],
          ),
          const SizedBox(height: 16),
          Text(
            'Error al cargar notificaciones',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 8),
          Text(
            _error ?? 'Error desconocido',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: _cargarNotificaciones,
            child: const Text('Reintentar'),
          ),
        ],
      ),
    );
  }

  Widget _buildNotificacionesList(List<Notificacion> notificaciones) {
    if (notificaciones.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.notifications_none,
              size: 64,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 16),
            Text(
              'No hay notificaciones',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Las notificaciones aparecerán aquí cuando estén disponibles',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Colors.grey[500],
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _cargarNotificaciones,
      child: ListView.builder(
        itemCount: notificaciones.length,
        itemBuilder: (context, index) {
          final notificacion = notificaciones[index];
          return _buildNotificacionCard(notificacion);
        },
      ),
    );
  }

  Widget _buildNotificacionCard(Notificacion notificacion) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      elevation: notificacion.estado == 'leida' ? 1 : 3,
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: _getTipoColor(notificacion.tipo),
          child: Icon(
            _getTipoIcon(notificacion.tipo),
            color: Colors.white,
            size: 20,
          ),
        ),
        title: Text(
          notificacion.nombre,
          style: TextStyle(
            fontWeight: notificacion.estado == 'leida' ? FontWeight.normal : FontWeight.bold,
            color: notificacion.estado == 'leida' ? Colors.grey[600] : Colors.black87,
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text(
              notificacion.descripcion,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: notificacion.estado == 'leida' ? Colors.grey[500] : Colors.grey[700],
              ),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                _buildChip(notificacion.tipoDisplay, _getTipoColor(notificacion.tipo)),
                const SizedBox(width: 8),
                _buildChip(notificacion.prioridadDisplay, _getPrioridadColor(notificacion.prioridad)),
                const Spacer(),
                Text(
                  '${_formatearFecha(notificacion.fechaCreacion)}',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[500],
                  ),
                ),
              ],
            ),
          ],
        ),
        trailing: notificacion.estado == 'leida'
            ? const Icon(Icons.check_circle, color: Colors.green)
            : IconButton(
                icon: const Icon(Icons.mark_email_read),
                onPressed: () => _marcarComoLeida(notificacion),
                tooltip: 'Marcar como leída',
              ),
        onTap: () async {
          // Marcar como leída si no lo está
          if (notificacion.estado != 'leida') {
            await _marcarComoLeida(notificacion);
          }
          
          // Navegar al detalle
          if (mounted) {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => DetalleNotificacionScreen(notificacion: notificacion),
              ),
            );
          }
        },
      ),
    );
  }

  Widget _buildChip(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.w500,
        ),
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

  String _formatearFecha(String fecha) {
    try {
      final dateTime = DateTime.parse(fecha);
      final now = DateTime.now();
      final difference = now.difference(dateTime);
      
      if (difference.inDays == 0) {
        return 'Hoy ${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')}';
      } else if (difference.inDays == 1) {
        return 'Ayer ${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')}';
      } else if (difference.inDays < 7) {
        return '${difference.inDays} días atrás';
      } else {
        return '${dateTime.day}/${dateTime.month}/${dateTime.year}';
      }
    } catch (e) {
      return fecha;
    }
  }
}
