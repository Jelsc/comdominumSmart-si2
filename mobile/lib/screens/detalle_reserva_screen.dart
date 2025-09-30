import 'package:flutter/material.dart';
import '../models/reserva.dart';
import '../services/reserva_service.dart';

class DetalleReservaScreen extends StatefulWidget {
  final Reserva reserva;

  const DetalleReservaScreen({
    Key? key,
    required this.reserva,
  }) : super(key: key);

  @override
  State<DetalleReservaScreen> createState() => _DetalleReservaScreenState();
}

class _DetalleReservaScreenState extends State<DetalleReservaScreen> {
  final ReservaService _reservaService = ReservaService();
  late Reserva _reserva;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _reserva = widget.reserva;
  }

  Future<void> _actualizarReserva() async {
    final response = await _reservaService.getReserva(_reserva.id);
    if (response.success && response.data != null) {
      setState(() {
        _reserva = response.data!;
      });
    }
  }

  Future<void> _cancelarReserva() async {
    final motivo = await _mostrarDialogoCancelacion();
    if (motivo == null) return;

    setState(() {
      _isLoading = true;
    });

    final response = await _reservaService.cancelarReserva(_reserva.id, motivo: motivo);
    
    setState(() {
      _isLoading = false;
    });

    if (response.success) {
      setState(() {
        _reserva = response.data!;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Reserva cancelada exitosamente'),
          backgroundColor: Colors.green,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(response.error ?? 'Error al cancelar reserva'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<String?> _mostrarDialogoCancelacion() async {
    final motivoController = TextEditingController();
    
    return showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cancelar Reserva'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('¿Estás seguro de que quieres cancelar esta reserva?'),
            const SizedBox(height: 16),
            TextField(
              controller: motivoController,
              decoration: const InputDecoration(
                labelText: 'Motivo de cancelación (opcional)',
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('No'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, motivoController.text.trim()),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Sí, Cancelar'),
          ),
        ],
      ),
    );
  }

  Color _getEstadoColor(String estado) {
    switch (estado) {
      case 'PENDIENTE':
        return Colors.orange;
      case 'CONFIRMADA':
        return Colors.green;
      case 'CANCELADA':
        return Colors.red;
      case 'COMPLETADA':
        return Colors.blue;
      case 'RECHAZADA':
        return Colors.red[800]!;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Detalle de Reserva'),
        backgroundColor: Colors.blue[600],
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _actualizarReserva,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildEstadoCard(),
                  const SizedBox(height: 16),
                  _buildInformacionBasica(),
                  const SizedBox(height: 16),
                  _buildInformacionArea(),
                  const SizedBox(height: 16),
                  _buildInformacionHorario(),
                  const SizedBox(height: 16),
                  _buildInformacionCosto(),
                  if (_reserva.motivo != null && _reserva.motivo!.isNotEmpty) ...[
                    const SizedBox(height: 16),
                    _buildMotivoCard(),
                  ],
                  if (_reserva.observacionesAdmin != null && _reserva.observacionesAdmin!.isNotEmpty) ...[
                    const SizedBox(height: 16),
                    _buildObservacionesCard(),
                  ],
                  const SizedBox(height: 24),
                  _buildAcciones(),
                ],
              ),
            ),
    );
  }

  Widget _buildEstadoCard() {
    return Card(
      color: _getEstadoColor(_reserva.estado).withOpacity(0.1),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Icon(
              _getEstadoIcon(_reserva.estado),
              color: _getEstadoColor(_reserva.estado),
              size: 32,
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Estado de la Reserva',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.grey[600],
                    ),
                  ),
                  Text(
                    _reserva.estadoDisplay,
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      color: _getEstadoColor(_reserva.estado),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  IconData _getEstadoIcon(String estado) {
    switch (estado) {
      case 'PENDIENTE':
        return Icons.schedule;
      case 'CONFIRMADA':
        return Icons.check_circle;
      case 'CANCELADA':
        return Icons.cancel;
      case 'COMPLETADA':
        return Icons.done_all;
      case 'RECHAZADA':
        return Icons.block;
      default:
        return Icons.help;
    }
  }

  Widget _buildInformacionBasica() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Información Básica',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            _buildInfoRow('ID de Reserva', '#${_reserva.id}'),
            _buildInfoRow('Tipo de Reserva', _reserva.tipoReservaDisplay),
            _buildInfoRow('Número de Personas', _reserva.numeroPersonas.toString()),
            _buildInfoRow('Fecha de Creación', _formatearFecha(_reserva.fechaCreacion)),
            if (_reserva.fechaAprobacion != null)
              _buildInfoRow('Fecha de Aprobación', _formatearFecha(_reserva.fechaAprobacion!)),
            if (_reserva.administradorNombre != null)
              _buildInfoRow('Aprobado por', _reserva.administradorNombre!),
          ],
        ),
      ),
    );
  }

  Widget _buildInformacionArea() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Área Común',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            if (_reserva.areaComunInfo != null) ...[
              _buildInfoRow('Nombre', _reserva.areaComunInfo!.nombre),
              _buildInfoRow('Tarifa por Hora', _reserva.areaComunInfo!.montoHoraFormateado),
              _buildInfoRow('Estado', _reserva.areaComunInfo!.estado),
            ] else
              _buildInfoRow('ID del Área', _reserva.areaComun.toString()),
          ],
        ),
      ),
    );
  }

  Widget _buildInformacionHorario() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Horario',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            _buildInfoRow('Fecha', _reserva.fechaFormateada),
            _buildInfoRow('Hora de Inicio', _reserva.horaInicio),
            _buildInfoRow('Hora de Fin', _reserva.horaFin),
            _buildInfoRow('Duración', '${_reserva.duracionHoras.toStringAsFixed(1)} horas'),
          ],
        ),
      ),
    );
  }

  Widget _buildInformacionCosto() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Costo',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Icon(Icons.attach_money, color: Colors.green[600], size: 24),
                const SizedBox(width: 8),
                Text(
                  _reserva.costoFormateado,
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    color: Colors.green[600],
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMotivoCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Motivo',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              _reserva.motivo!,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildObservacionesCard() {
    return Card(
      color: Colors.orange[50],
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.info, color: Colors.orange[600]),
                const SizedBox(width: 8),
                Text(
                  'Observaciones del Administrador',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: Colors.orange[600],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              _reserva.observacionesAdmin!,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAcciones() {
    return Column(
      children: [
        if (_reserva.puedeCancelar) ...[
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _isLoading ? null : _cancelarReserva,
              icon: const Icon(Icons.cancel),
              label: const Text('Cancelar Reserva'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red[600],
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
            ),
          ),
          const SizedBox(height: 8),
        ],
        SizedBox(
          width: double.infinity,
          child: OutlinedButton.icon(
            onPressed: _actualizarReserva,
            icon: const Icon(Icons.refresh),
            label: const Text('Actualizar Información'),
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 16),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              '$label:',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w500,
                color: Colors.grey[600],
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ),
        ],
      ),
    );
  }

  String _formatearFecha(DateTime fecha) {
    final months = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];
    return '${fecha.day} ${months[fecha.month - 1]} ${fecha.year}';
  }
}
