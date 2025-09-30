import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/reserva.dart';
import '../services/reserva_service.dart';

class CrearReservaScreen extends StatefulWidget {
  const CrearReservaScreen({Key? key}) : super(key: key);

  @override
  State<CrearReservaScreen> createState() => _CrearReservaScreenState();
}

class _CrearReservaScreenState extends State<CrearReservaScreen> {
  final ReservaService _reservaService = ReservaService();
  final _formKey = GlobalKey<FormState>();
  
  // Controladores
  final _motivoController = TextEditingController();
  final _numeroPersonasController = TextEditingController(text: '1');
  
  // Variables de estado
  List<AreaDisponible> _areasDisponibles = [];
  AreaDisponible? _areaSeleccionada;
  DateTime _fechaSeleccionada = DateTime.now().add(const Duration(days: 1));
  String _horaInicio = '09:00';
  String _horaFin = '10:00';
  String _tipoReserva = 'PARTICULAR';
  bool _isLoading = false;
  bool _cargandoAreas = false;
  String? _error;

  final List<String> _tiposReserva = [
    'PARTICULAR',
    'EVENTO',
    'REUNION',
    'DEPORTE',
    'OTRO',
  ];

  final List<String> _horasDisponibles = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
  ];

  int _compararHoras(String hora1, String hora2) {
    final partes1 = hora1.split(':');
    final partes2 = hora2.split(':');
    final minutos1 = int.parse(partes1[0]) * 60 + int.parse(partes1[1]);
    final minutos2 = int.parse(partes2[0]) * 60 + int.parse(partes2[1]);
    return minutos1.compareTo(minutos2);
  }

  @override
  void initState() {
    super.initState();
    _cargarAreasDisponibles();
  }

  @override
  void dispose() {
    _motivoController.dispose();
    _numeroPersonasController.dispose();
    super.dispose();
  }

  Future<void> _cargarAreasDisponibles() async {
    setState(() {
      _cargandoAreas = true;
      _error = null;
    });

    final response = await _reservaService.getAreasDisponibles(_fechaSeleccionada);
    
    setState(() {
      _cargandoAreas = false;
      if (response.success) {
        _areasDisponibles = response.data ?? [];
        _areaSeleccionada = null; // Reset selección
      } else {
        _error = response.error;
      }
    });
  }

  Future<void> _seleccionarFecha() async {
    final fecha = await showDatePicker(
      context: context,
      initialDate: _fechaSeleccionada,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    
    if (fecha != null && fecha != _fechaSeleccionada) {
      setState(() {
        _fechaSeleccionada = fecha;
        _areaSeleccionada = null;
      });
      _cargarAreasDisponibles();
    }
  }

  void _seleccionarHoraInicio() {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        height: 300,
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              child: Text(
                'Seleccionar Hora de Inicio',
                style: Theme.of(context).textTheme.titleMedium,
              ),
            ),
            Expanded(
              child: ListView.builder(
                itemCount: _horasDisponibles.length,
                itemBuilder: (context, index) {
                  final hora = _horasDisponibles[index];
                  return ListTile(
                    title: Text(hora),
                    selected: hora == _horaInicio,
                    onTap: () {
                      setState(() {
                        _horaInicio = hora;
                        // Ajustar hora fin si es menor o igual
                        if (_compararHoras(_horaFin, _horaInicio) <= 0) {
                          final inicioIndex = _horasDisponibles.indexOf(_horaInicio);
                          if (inicioIndex < _horasDisponibles.length - 1) {
                            _horaFin = _horasDisponibles[inicioIndex + 1];
                          }
                        }
                      });
                      Navigator.pop(context);
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _seleccionarHoraFin() {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        height: 300,
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              child: Text(
                'Seleccionar Hora de Fin',
                style: Theme.of(context).textTheme.titleMedium,
              ),
            ),
            Expanded(
              child: ListView.builder(
                itemCount: _horasDisponibles.length,
                itemBuilder: (context, index) {
                  final hora = _horasDisponibles[index];
                  final inicioIndex = _horasDisponibles.indexOf(_horaInicio);
                  final esValida = index > inicioIndex;
                  
                  return ListTile(
                    title: Text(
                      hora,
                      style: TextStyle(
                        color: esValida ? null : Colors.grey,
                      ),
                    ),
                    selected: hora == _horaFin,
                    enabled: esValida,
                    onTap: esValida ? () {
                      setState(() {
                        _horaFin = hora;
                      });
                      Navigator.pop(context);
                    } : null,
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  double _calcularCosto() {
    if (_areaSeleccionada == null) return 0.0;
    
    final inicio = DateTime.parse('2025-01-01 ${_horaInicio}:00');
    final fin = DateTime.parse('2025-01-01 ${_horaFin}:00');
    final duracion = fin.difference(inicio).inHours;
    
    return _areaSeleccionada!.montoHora * duracion;
  }

  Future<void> _crearReserva() async {
    if (!_formKey.currentState!.validate()) return;
    if (_areaSeleccionada == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Por favor selecciona un área común'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    final request = ReservaRequest(
      areaComun: _areaSeleccionada!.id,
      fechaReserva: _fechaSeleccionada,
      horaInicio: _horaInicio,
      horaFin: _horaFin,
      tipoReserva: _tipoReserva,
      motivo: _motivoController.text.trim().isEmpty ? null : _motivoController.text.trim(),
      numeroPersonas: int.parse(_numeroPersonasController.text),
    );

    final response = await _reservaService.crearReserva(request);
    
    setState(() {
      _isLoading = false;
    });

    if (response.success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Reserva creada exitosamente'),
          backgroundColor: Colors.green,
        ),
      );
      Navigator.pop(context, true);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(response.error ?? 'Error al crear reserva'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Crear Reserva'),
        backgroundColor: Colors.blue[600],
        foregroundColor: Colors.white,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFechaSelector(),
                    const SizedBox(height: 16),
                    _buildAreasDisponibles(),
                    const SizedBox(height: 16),
                    _buildHorariosSelector(),
                    const SizedBox(height: 16),
                    _buildTipoReservaSelector(),
                    const SizedBox(height: 16),
                    _buildMotivoField(),
                    const SizedBox(height: 16),
                    _buildNumeroPersonasField(),
                    const SizedBox(height: 24),
                    _buildCostoEstimado(),
                    const SizedBox(height: 24),
                    _buildCrearButton(),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildFechaSelector() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Fecha de Reserva',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            InkWell(
              onTap: _seleccionarFecha,
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey[300]!),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.calendar_today, color: Colors.blue),
                    const SizedBox(width: 8),
                    Text(
                      '${_fechaSeleccionada.day}/${_fechaSeleccionada.month}/${_fechaSeleccionada.year}',
                      style: Theme.of(context).textTheme.bodyLarge,
                    ),
                    const Spacer(),
                    const Icon(Icons.arrow_drop_down),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAreasDisponibles() {
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
            const SizedBox(height: 8),
            if (_cargandoAreas)
              const Center(child: CircularProgressIndicator())
            else if (_error != null)
              Text(
                _error!,
                style: TextStyle(color: Colors.red[600]),
              )
            else if (_areasDisponibles.isEmpty)
              const Text('No hay áreas disponibles para esta fecha')
            else
              ..._areasDisponibles.map((area) => _buildAreaOption(area)),
          ],
        ),
      ),
    );
  }

  Widget _buildAreaOption(AreaDisponible area) {
    final isSelected = _areaSeleccionada?.id == area.id;
    final isDisponible = area.disponible;
    
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      child: InkWell(
        onTap: isDisponible ? () {
          setState(() {
            _areaSeleccionada = area;
          });
        } : null,
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            border: Border.all(
              color: isSelected ? Colors.blue : Colors.grey[300]!,
              width: isSelected ? 2 : 1,
            ),
            borderRadius: BorderRadius.circular(8),
            color: isDisponible 
                ? (isSelected ? Colors.blue[50] : Colors.white)
                : Colors.grey[100],
          ),
          child: Row(
            children: [
              Icon(
                isSelected ? Icons.radio_button_checked : Icons.radio_button_unchecked,
                color: isDisponible ? Colors.blue : Colors.grey,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      area.nombre,
                      style: TextStyle(
                        fontWeight: FontWeight.w500,
                        color: isDisponible ? null : Colors.grey,
                      ),
                    ),
                    Text(
                      area.montoHoraFormateado,
                      style: TextStyle(
                        color: isDisponible ? Colors.green[600] : Colors.grey,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              if (!isDisponible)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.red[100],
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    'Ocupada',
                    style: TextStyle(
                      color: Colors.red[600],
                      fontSize: 10,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHorariosSelector() {
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
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Hora de Inicio'),
                      const SizedBox(height: 4),
                      InkWell(
                        onTap: _seleccionarHoraInicio,
                        child: Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            border: Border.all(color: Colors.grey[300]!),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.access_time, size: 20),
                              const SizedBox(width: 8),
                              Text(_horaInicio),
                              const Spacer(),
                              const Icon(Icons.arrow_drop_down, size: 20),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Hora de Fin'),
                      const SizedBox(height: 4),
                      InkWell(
                        onTap: _seleccionarHoraFin,
                        child: Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            border: Border.all(color: Colors.grey[300]!),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.access_time, size: 20),
                              const SizedBox(width: 8),
                              Text(_horaFin),
                              const Spacer(),
                              const Icon(Icons.arrow_drop_down, size: 20),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTipoReservaSelector() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Tipo de Reserva',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            DropdownButtonFormField<String>(
              value: _tipoReserva,
              decoration: const InputDecoration(
                border: OutlineInputBorder(),
                contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              ),
              items: _tiposReserva.map((tipo) {
                String displayName;
                switch (tipo) {
                  case 'PARTICULAR':
                    displayName = 'Uso Particular';
                    break;
                  case 'EVENTO':
                    displayName = 'Evento';
                    break;
                  case 'REUNION':
                    displayName = 'Reunión';
                    break;
                  case 'DEPORTE':
                    displayName = 'Deporte';
                    break;
                  case 'OTRO':
                    displayName = 'Otro';
                    break;
                  default:
                    displayName = tipo;
                }
                return DropdownMenuItem(
                  value: tipo,
                  child: Text(displayName),
                );
              }).toList(),
              onChanged: (value) {
                setState(() {
                  _tipoReserva = value!;
                });
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMotivoField() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Motivo (Opcional)',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            TextFormField(
              controller: _motivoController,
              decoration: const InputDecoration(
                border: OutlineInputBorder(),
                hintText: 'Describe el motivo de tu reserva',
              ),
              maxLines: 3,
              maxLength: 500,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNumeroPersonasField() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Número de Personas',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            TextFormField(
              controller: _numeroPersonasController,
              decoration: const InputDecoration(
                border: OutlineInputBorder(),
                hintText: '1',
              ),
              keyboardType: TextInputType.number,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Este campo es requerido';
                }
                final numero = int.tryParse(value);
                if (numero == null || numero < 1) {
                  return 'Debe ser un número mayor a 0';
                }
                return null;
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCostoEstimado() {
    final costo = _calcularCosto();
    return Card(
      color: Colors.blue[50],
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Icon(Icons.attach_money, color: Colors.blue[600]),
            const SizedBox(width: 8),
            Text(
              'Costo Estimado: ',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w500,
              ),
            ),
            Text(
              '\$${costo.toStringAsFixed(2)}',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: Colors.blue[600],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCrearButton() {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: _isLoading ? null : _crearReserva,
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.blue[600],
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 16),
        ),
        child: _isLoading
            ? const SizedBox(
                height: 20,
                width: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                ),
              )
            : const Text(
                'Crear Reserva',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
      ),
    );
  }
}
