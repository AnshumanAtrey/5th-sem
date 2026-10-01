import 'package:flutter/material.dart';
import '../../core/theme/ledger_theme.dart';
import '../../core/widgets/ledger_app_bar.dart';
import '../../core/widgets/ledger_button.dart';
import '../../core/widgets/ledger_numpad.dart';
import '../../core/widgets/ledger_scanner_dialog.dart';
import '../../state/app_state.dart';

enum FloorScreenState {
  myTasks,
  pickSession,
  receivePo,
  syncIssues,
}

class FloorFlowScreen extends StatefulWidget {
  final AppState appState;

  const FloorFlowScreen({super.key, required this.appState});

  @override
  State<FloorFlowScreen> createState() => _FloorFlowScreenState();
}

class _FloorFlowScreenState extends State<FloorFlowScreen> {
  FloorScreenState _currentScreen = FloorScreenState.myTasks;
  String _receiveQty = '12';
  bool _isDamagedSelected = false;
  bool _photoAdded = false;

  @override
  Widget build(BuildContext context) {
    switch (_currentScreen) {
      case FloorScreenState.myTasks:
        return _buildMyTasks();
      case FloorScreenState.pickSession:
        return _buildPickSession();
      case FloorScreenState.receivePo:
        return _buildReceivePo();
      case FloorScreenState.syncIssues:
        return _buildSyncIssues();
    }
  }

  Widget _buildMyTasks() {
    return Scaffold(
      backgroundColor: LedgerColors.neutral,
      appBar: LedgerAppBar(
        title: 'Ravi · Bhiwandi DC',
        syncStatus: 'Synced 2m ago',
        actions: [
          IconButton(
            icon: const Icon(Icons.sync_problem, size: 20),
            onPressed: () => setState(() => _currentScreen = FloorScreenState.syncIssues),
          ),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(LedgerSpacing.screenGutter),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Tuesday · shift 09:00–17:00 · Zone A-B',
                style: LedgerTypography.bodySm(),
              ),
              const SizedBox(height: LedgerSpacing.lg),
              // 4 Stacked 96px Task Cards
              _buildTaskCard(
                'Pick 7',
                '3 orders · Zone A · assigned 09:12',
                '7',
                Icons.shopping_bag_outlined,
                () => setState(() => _currentScreen = FloorScreenState.pickSession),
              ),
              const SizedBox(height: LedgerSpacing.md),
              _buildTaskCard(
                'Put away 12',
                'From GRN-2026-0142 · Dock 2',
                '12',
                Icons.move_to_inbox_outlined,
                () => setState(() => _currentScreen = FloorScreenState.pickSession),
              ),
              const SizedBox(height: LedgerSpacing.md),
              _buildTaskCard(
                'Receive 1',
                'PO-2026-0089 · Tirupur Knits',
                '1',
                Icons.inventory_2_outlined,
                () => setState(() => _currentScreen = FloorScreenState.receivePo),
              ),
              const SizedBox(height: LedgerSpacing.md),
              _buildTaskCard(
                'Count 0',
                'Nothing assigned this shift',
                '0',
                Icons.fact_check_outlined,
                null,
                isMuted: true,
              ),
              const Spacer(),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: LedgerColors.primary,
        foregroundColor: LedgerColors.onPrimary,
        shape: const CircleBorder(),
        onPressed: () {
          LedgerScannerDialog.show(
            context,
            onScanned: (val) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Scanned: $val')),
              );
            },
          );
        },
        child: const Icon(Icons.qr_code_scanner, size: 28),
      ),
    );
  }

  Widget _buildPickSession() {
    final app = widget.appState;
    final hasError = app.binScanError != null;

    return Scaffold(
      backgroundColor: LedgerColors.neutral,
      appBar: LedgerAppBar(
        title: 'Pick · SO-2026-0417',
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => setState(() => _currentScreen = FloorScreenState.myTasks),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: Center(
              child: Text(
                '${app.currentPickStep} / ${app.totalPickSteps}',
                style: LedgerTypography.headlineMd(),
              ),
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // 4px progress line
            ClipRRect(
              child: LinearProgressIndicator(
                value: app.currentPickStep / app.totalPickSteps,
                backgroundColor: LedgerColors.surfaceVariant,
                valueColor: const AlwaysStoppedAnimation<Color>(LedgerColors.primary),
                minHeight: 4,
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(LedgerSpacing.screenGutter),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Card One: GO TO BIN
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(LedgerSpacing.cardPadding),
                      decoration: BoxDecoration(
                        color: LedgerColors.surface,
                        borderRadius: BorderRadius.circular(LedgerRadius.lg),
                        border: Border.all(
                          color: hasError ? LedgerColors.error : (app.scannedCorrectBin ? LedgerColors.positive : LedgerColors.outlineStrong),
                          width: hasError || app.scannedCorrectBin ? 2 : 1,
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('GO TO BIN', style: LedgerTypography.labelSm()),
                          const SizedBox(height: 4),
                          Text(
                            'WH1-A-03-02',
                            style: LedgerTypography.mono(fontSize: 34, fontWeight: FontWeight.w700),
                          ),
                          const SizedBox(height: 4),
                          Text('Zone A · aisle 3 · shelf 2', style: LedgerTypography.bodyMd()),
                          if (hasError) ...[
                            const SizedBox(height: 8),
                            Text(app.binScanError!, style: LedgerTypography.bodySm(color: LedgerColors.error)),
                          ] else if (app.scannedCorrectBin) ...[
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                const Icon(Icons.check_circle, size: 16, color: LedgerColors.positive),
                                const SizedBox(width: 4),
                                Text('Bin verified', style: LedgerTypography.labelMd(color: LedgerColors.positive)),
                              ],
                            ),
                          ],
                        ],
                      ),
                    ),
                    const SizedBox(height: LedgerSpacing.md),
                    // Card Two: PICK SKU
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(LedgerSpacing.cardPadding),
                      decoration: BoxDecoration(
                        color: LedgerColors.surface,
                        borderRadius: BorderRadius.circular(LedgerRadius.lg),
                        border: Border.all(color: LedgerColors.outlineStrong),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('PICK ITEM', style: LedgerTypography.labelSm()),
                          const SizedBox(height: 4),
                          Text('Oversized Tee · Black · M', style: LedgerTypography.headlineLg()),
                          const SizedBox(height: 2),
                          Text('ASH-TEE-OVS-BLK-M', style: LedgerTypography.mono(color: LedgerColors.onSurfaceVariant)),
                          const SizedBox(height: LedgerSpacing.md),
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.baseline,
                            textBaseline: TextBaseline.alphabetic,
                            children: [
                              Text('4', style: LedgerTypography.floorValue()),
                              const SizedBox(width: 8),
                              Text('units', style: LedgerTypography.headlineMd()),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: LedgerSpacing.lg),
                    // Scan bin button
                    LedgerButton(
                      text: app.scannedCorrectBin ? 'Scan SKU barcode' : 'Scan bin to confirm',
                      style: LedgerButtonStyle.secondary,
                      icon: Icons.qr_code_scanner,
                      onPressed: () {
                        LedgerScannerDialog.show(
                          context,
                          title: 'Scan Target Bin',
                          onScanned: (val) {
                            app.simulateScanBin(val);
                          },
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),
            // Bottom Action Bar
            Padding(
              padding: const EdgeInsets.all(LedgerSpacing.screenGutter),
              child: Column(
                children: [
                  LedgerButton(
                    text: "Short, can't find enough",
                    style: LedgerButtonStyle.ghost,
                    height: 44,
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Short pick reported to Supervisor Meena')),
                      );
                    },
                  ),
                  const SizedBox(height: 6),
                  LedgerButton(
                    text: 'Confirm 4 picked',
                    style: LedgerButtonStyle.primary,
                    onPressed: () {
                      app.confirmPickLine();
                      if (app.currentPickStep >= app.totalPickSteps) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Pick list completed! Send to Packing Staging.')),
                        );
                        setState(() => _currentScreen = FloorScreenState.myTasks);
                      }
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReceivePo() {
    return Scaffold(
      backgroundColor: LedgerColors.neutral,
      appBar: LedgerAppBar(
        title: 'Receive · PO-2026-0089',
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => setState(() => _currentScreen = FloorScreenState.myTasks),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: Center(
              child: Text('Line 4 of 9', style: LedgerTypography.labelMd()),
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(LedgerSpacing.screenGutter),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // SKU Line Item
                    Container(
                      padding: const EdgeInsets.all(LedgerSpacing.cardPadding),
                      decoration: BoxDecoration(
                        color: LedgerColors.surface,
                        borderRadius: BorderRadius.circular(LedgerRadius.lg),
                        border: Border.all(color: LedgerColors.outlineStrong, width: 2),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('ASH-LIN-WHT-XL', style: LedgerTypography.mono(fontSize: 15, fontWeight: FontWeight.w600)),
                          const SizedBox(height: 2),
                          Text('Linen Regular Shirt · White · XL', style: LedgerTypography.headlineMd()),
                          const SizedBox(height: LedgerSpacing.md),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('Received / Expected', style: LedgerTypography.labelSm()),
                              Text('$_receiveQty / 40', style: LedgerTypography.mono(fontSize: 16, fontWeight: FontWeight.w700)),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: LedgerSpacing.md),
                    // Damage & Photo chips
                    Row(
                      children: [
                        _buildChoiceChip('Short', false, () {}),
                        const SizedBox(width: 8),
                        _buildChoiceChip('Over', false, () {}),
                        const SizedBox(width: 8),
                        _buildChoiceChip('Damaged', _isDamagedSelected, () {
                          setState(() => _isDamagedSelected = !_isDamagedSelected);
                        }),
                        const SizedBox(width: 8),
                        ActionChip(
                          avatar: Icon(_photoAdded ? Icons.check : Icons.camera_alt, size: 16),
                          label: Text(_photoAdded ? 'Photo added' : 'Add photo', style: LedgerTypography.labelMd()),
                          onPressed: () => setState(() => _photoAdded = !_photoAdded),
                        ),
                      ],
                    ),
                    if (_isDamagedSelected) ...[
                      const SizedBox(height: 6),
                      Text('Photo required for damaged stock', style: LedgerTypography.bodySm(color: LedgerColors.error)),
                    ],
                    const SizedBox(height: LedgerSpacing.lg),
                    // Large Numpad
                    LedgerNumpad(
                      onNumberPressed: (val) {
                        setState(() {
                          if (_receiveQty == '0') {
                            _receiveQty = val;
                          } else if (_receiveQty.length < 3) {
                            _receiveQty += val;
                          }
                        });
                      },
                      onDeletePressed: () {
                        setState(() {
                          if (_receiveQty.length > 1) {
                            _receiveQty = _receiveQty.substring(0, _receiveQty.length - 1);
                          } else {
                            _receiveQty = '0';
                          }
                        });
                      },
                    ),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(LedgerSpacing.screenGutter),
              child: LedgerButton(
                text: 'Confirm Line ($_receiveQty units)',
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Received $_receiveQty units for GRN-2026-0142')),
                  );
                  setState(() => _currentScreen = FloorScreenState.myTasks);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSyncIssues() {
    return Scaffold(
      backgroundColor: LedgerColors.neutral,
      appBar: LedgerAppBar(
        title: 'Sync issues (2)',
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => setState(() => _currentScreen = FloorScreenState.myTasks),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(LedgerSpacing.screenGutter),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'These scans could not be saved. Fix them here. Nothing is lost.',
                style: LedgerTypography.bodyMd(color: LedgerColors.onSurfaceVariant),
              ),
              const SizedBox(height: LedgerSpacing.lg),
              _buildSyncCard(
                'Pick · SO-2026-0417 · line 5',
                'Someone else moved this stock at 10:42',
                'Pick from another bin',
              ),
              const SizedBox(height: LedgerSpacing.md),
              _buildSyncCard(
                'Adjustment · WH1-B-01-04',
                'Needs manager approval (above 20 units)',
                'Send for approval',
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTaskCard(String title, String subtitle, String count, IconData icon, VoidCallback? onTap, {bool isMuted = false}) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(LedgerRadius.lg),
      child: Container(
        height: 96,
        padding: const EdgeInsets.all(LedgerSpacing.cardPadding),
        decoration: BoxDecoration(
          color: isMuted ? LedgerColors.surfaceVariant : LedgerColors.surface,
          borderRadius: BorderRadius.circular(LedgerRadius.lg),
          border: Border.all(color: LedgerColors.outline),
        ),
        child: Row(
          children: [
            Icon(icon, size: 28, color: isMuted ? LedgerColors.onSurfaceMuted : LedgerColors.primary),
            const SizedBox(width: LedgerSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    title,
                    style: LedgerTypography.floorAction(color: isMuted ? LedgerColors.onSurfaceMuted : LedgerColors.onSurface),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: LedgerTypography.bodySm(color: LedgerColors.onSurfaceMuted),
                  ),
                ],
              ),
            ),
            Text(
              count,
              style: LedgerTypography.floorValue(color: isMuted ? LedgerColors.onSurfaceMuted : LedgerColors.onSurface),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildChoiceChip(String label, bool isSelected, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? LedgerColors.primary : LedgerColors.surfaceVariant,
          borderRadius: BorderRadius.circular(LedgerRadius.sm),
        ),
        child: Text(
          label,
          style: LedgerTypography.labelMd(color: isSelected ? LedgerColors.onPrimary : LedgerColors.onSurface),
        ),
      ),
    );
  }

  Widget _buildSyncCard(String title, String subtitle, String actionText) {
    return Container(
      padding: const EdgeInsets.all(LedgerSpacing.cardPadding),
      decoration: BoxDecoration(
        color: LedgerColors.surface,
        borderRadius: BorderRadius.circular(LedgerRadius.lg),
        border: Border.all(color: LedgerColors.outline),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: LedgerTypography.headlineMd()),
          const SizedBox(height: 2),
          Text(subtitle, style: LedgerTypography.bodySm(color: LedgerColors.onSurfaceMuted)),
          const SizedBox(height: LedgerSpacing.md),
          LedgerButton(
            text: actionText,
            style: LedgerButtonStyle.secondary,
            height: 40,
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Resolved: $actionText')),
              );
            },
          ),
        ],
      ),
    );
  }
}
