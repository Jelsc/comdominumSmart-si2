import 'package:flutter/material.dart';
import '../config/app_config.dart';

class ConfigInfoWidget extends StatelessWidget {
  const ConfigInfoWidget({super.key});

  @override
  Widget build(BuildContext context) {
    final config = AppConfig.getConfigInfo();
    
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.blue.shade50,
        border: Border.all(color: Colors.blue.shade200),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              Icon(
                Icons.info_outline,
                color: Colors.blue.shade600,
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                'Configuración de Conexión',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: Colors.blue.shade800,
                  fontSize: 14,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          _buildInfoRow('Entorno', config['environment']),
          _buildInfoRow('Backend', config['apiBaseUrl']),
          if (AppConfig.isDebugMode) ...[
            const Divider(height: 16),
            Text(
              'Modo Debug Activo',
              style: TextStyle(
                fontSize: 12,
                color: Colors.orange.shade700,
                fontStyle: FontStyle.italic,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 70,
            child: Text(
              '$label:',
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 12,
                fontFamily: 'monospace',
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Widget flotante para mostrar información de configuración
class FloatingConfigInfo extends StatefulWidget {
  final Widget child;
  
  const FloatingConfigInfo({
    super.key,
    required this.child,
  });

  @override
  State<FloatingConfigInfo> createState() => _FloatingConfigInfoState();
}

class _FloatingConfigInfoState extends State<FloatingConfigInfo> {
  bool _showConfig = false;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        widget.child,
        if (AppConfig.isDebugMode)
          Positioned(
            top: 50,
            right: 16,
            child: GestureDetector(
              onTap: () {
                setState(() {
                  _showConfig = !_showConfig;
                });
              },
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.blue.shade600,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.2),
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Icon(
                  _showConfig ? Icons.close : Icons.settings,
                  color: Colors.white,
                  size: 20,
                ),
              ),
            ),
          ),
        if (_showConfig && AppConfig.isDebugMode)
          Positioned(
            top: 100,
            right: 16,
            left: 16,
            child: const ConfigInfoWidget(),
          ),
      ],
    );
  }
}
