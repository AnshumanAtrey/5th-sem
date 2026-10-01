import 'package:flutter/material.dart';
import '../theme/ledger_theme.dart';

class LedgerScannerDialog extends StatefulWidget {
  final String title;
  final String? subtitle;
  final ValueChanged<String> onScanned;

  const LedgerScannerDialog({
    super.key,
    this.title = 'Scan Barcode / QR',
    this.subtitle = 'Align barcode within the target frame',
    required this.onScanned,
  });

  static Future<String?> show(
    BuildContext context, {
    String title = 'Scan Barcode / QR',
    String? subtitle,
    required ValueChanged<String> onScanned,
  }) {
    return showModalBottomSheet<String>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => LedgerScannerDialog(
        title: title,
        subtitle: subtitle,
        onScanned: onScanned,
      ),
    );
  }

  @override
  State<LedgerScannerDialog> createState() => _LedgerScannerDialogState();
}

class _LedgerScannerDialogState extends State<LedgerScannerDialog>
    with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  late Animation<double> _laserAnimation;
  bool _torchOn = false;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1600),
    )..repeat(reverse: true);
    _laserAnimation = Tween<double>(begin: 0.1, end: 0.9).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  void _triggerScan(String code) {
    widget.onScanned(code);
    Navigator.of(context).pop(code);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: LedgerColors.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(LedgerRadius.xl)),
      ),
      padding: const EdgeInsets.all(LedgerSpacing.xl),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Drag handle
          Container(
            width: 36,
            height: 4,
            decoration: BoxDecoration(
              color: LedgerColors.outlineStrong,
              borderRadius: BorderRadius.circular(LedgerRadius.full),
            ),
          ),
          const SizedBox(height: LedgerSpacing.md),
          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(widget.title, style: LedgerTypography.headlineLg()),
                  if (widget.subtitle != null) ...[
                    const SizedBox(height: 2),
                    Text(widget.subtitle!, style: LedgerTypography.bodySm()),
                  ],
                ],
              ),
              IconButton(
                onPressed: () {
                  setState(() {
                    _torchOn = !_torchOn;
                  });
                },
                icon: Icon(
                  _torchOn ? Icons.flash_on : Icons.flash_off,
                  color: _torchOn ? LedgerColors.positive : LedgerColors.onSurfaceVariant,
                ),
              ),
            ],
          ),
          const SizedBox(height: LedgerSpacing.lg),
          // Scanner Box
          Container(
            height: 180,
            width: double.infinity,
            decoration: BoxDecoration(
              color: const Color(0xFF141416),
              borderRadius: BorderRadius.circular(LedgerRadius.lg),
              border: Border.all(color: LedgerColors.outlineStrong),
            ),
            child: Stack(
              alignment: Alignment.center,
              children: [
                // Corner markings
                Positioned(
                  top: 20,
                  left: 20,
                  child: Container(
                    width: 24,
                    height: 24,
                    decoration: const BoxDecoration(
                      border: Border(
                        top: BorderSide(color: Colors.white, width: 3),
                        left: BorderSide(color: Colors.white, width: 3),
                      ),
                    ),
                  ),
                ),
                Positioned(
                  top: 20,
                  right: 20,
                  child: Container(
                    width: 24,
                    height: 24,
                    decoration: const BoxDecoration(
                      border: Border(
                        top: BorderSide(color: Colors.white, width: 3),
                        right: BorderSide(color: Colors.white, width: 3),
                      ),
                    ),
                  ),
                ),
                Positioned(
                  bottom: 20,
                  left: 20,
                  child: Container(
                    width: 24,
                    height: 24,
                    decoration: const BoxDecoration(
                      border: Border(
                        bottom: BorderSide(color: Colors.white, width: 3),
                        left: BorderSide(color: Colors.white, width: 3),
                      ),
                    ),
                  ),
                ),
                Positioned(
                  bottom: 20,
                  right: 20,
                  child: Container(
                    width: 24,
                    height: 24,
                    decoration: const BoxDecoration(
                      border: Border(
                        bottom: BorderSide(color: Colors.white, width: 3),
                        right: BorderSide(color: Colors.white, width: 3),
                      ),
                    ),
                  ),
                ),
                // Laser animation
                AnimatedBuilder(
                  animation: _laserAnimation,
                  builder: (context, child) {
                    return Positioned(
                      top: 180 * _laserAnimation.value,
                      left: 30,
                      right: 30,
                      child: Container(
                        height: 2,
                        decoration: BoxDecoration(
                          color: LedgerColors.positive,
                          boxShadow: [
                            BoxShadow(
                              color: LedgerColors.positive.withValues(alpha: 0.8),
                              blurRadius: 6,
                              spreadRadius: 2,
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
                const Icon(Icons.qr_code_scanner, size: 48, color: Colors.white24),
              ],
            ),
          ),
          const SizedBox(height: LedgerSpacing.lg),
          // Simulation Barcode Quick Triggers
          Align(
            alignment: Alignment.centerLeft,
            child: Text(
              'OR SIMULATE SCAN HARDWARE INPUT',
              style: LedgerTypography.labelSm(),
            ),
          ),
          const SizedBox(height: LedgerSpacing.sm),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _buildScanChip('WH1-A-03-02 (Target Bin)', 'WH1-A-03-02'),
              _buildScanChip('WH1-A-03-05 (Wrong Bin)', 'WH1-A-03-05'),
              _buildScanChip('ASH-TEE-OVS-BLK-M (SKU)', 'ASH-TEE-OVS-BLK-M'),
              _buildScanChip('#ORD-88190 (Customer QR)', '#ORD-88190'),
              _buildScanChip('AWB 2891 7743 2210', '289177432210'),
            ],
          ),
          const SizedBox(height: LedgerSpacing.lg),
        ],
      ),
    );
  }

  Widget _buildScanChip(String label, String code) {
    return ActionChip(
      label: Text(label, style: LedgerTypography.mono(fontSize: 11)),
      backgroundColor: LedgerColors.surfaceVariant,
      side: const BorderSide(color: LedgerColors.outline),
      onPressed: () => _triggerScan(code),
    );
  }
}
