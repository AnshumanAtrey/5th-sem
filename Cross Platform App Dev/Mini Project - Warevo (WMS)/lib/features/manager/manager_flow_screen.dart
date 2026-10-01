import 'package:flutter/material.dart';
import '../../core/theme/ledger_theme.dart';
import '../../core/widgets/ledger_app_bar.dart';
import '../../core/widgets/ledger_bottom_nav.dart';
import '../../core/widgets/ledger_button.dart';
import '../../core/widgets/ledger_kpi_card.dart';
import '../../core/widgets/ledger_scanner_dialog.dart';
import '../../data/mock_database.dart';
import '../../state/app_state.dart';

class ManagerFlowScreen extends StatefulWidget {
  final AppState appState;

  const ManagerFlowScreen({super.key, required this.appState});

  @override
  State<ManagerFlowScreen> createState() => _ManagerFlowScreenState();
}

class _ManagerFlowScreenState extends State<ManagerFlowScreen> {
  int _tabIndex = 0;
  String _selectedOperator = 'Suresh';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: LedgerColors.neutral,
      appBar: LedgerAppBar(
        title: _getTitle(),
        syncStatus: 'Synced 2m ago',
      ),
      body: SafeArea(
        child: IndexedStack(
          index: _tabIndex,
          children: [
            _buildBoardTab(),
            _buildApprovalsTab(),
            _buildLedgerTab(),
            _buildLookupTab(),
          ],
        ),
      ),
      bottomNavigationBar: LedgerBottomNav(
        currentIndex: _tabIndex,
        onTap: (i) => setState(() => _tabIndex = i),
        items: const [
          NavItemData(label: 'Board', icon: Icons.grid_view),
          NavItemData(label: 'Approvals', icon: Icons.approval),
          NavItemData(label: 'Ledger', icon: Icons.receipt_long),
          NavItemData(label: 'Lookup', icon: Icons.search),
        ],
      ),
      floatingActionButton: (_tabIndex == 0 || _tabIndex == 3)
          ? FloatingActionButton(
              backgroundColor: LedgerColors.primary,
              foregroundColor: LedgerColors.onPrimary,
              shape: const CircleBorder(),
              onPressed: () {
                LedgerScannerDialog.show(
                  context,
                  title: 'Lookup Barcode / Bin',
                  onScanned: (val) {
                    setState(() => _tabIndex = 3);
                  },
                );
              },
              child: const Icon(Icons.qr_code_scanner, size: 28),
            )
          : null,
    );
  }

  String _getTitle() {
    switch (_tabIndex) {
      case 0:
        return 'Bhiwandi DC';
      case 1:
        return 'Approvals (2)';
      case 2:
        return 'Stock Ledger';
      case 3:
        return 'SKU Lookup';
      default:
        return 'Manager';
    }
  }

  Widget _buildBoardTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(LedgerSpacing.screenGutter),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Needs you now alert card
          Container(
            padding: const EdgeInsets.all(LedgerSpacing.cardPadding),
            decoration: BoxDecoration(
              color: LedgerColors.surface,
              borderRadius: BorderRadius.circular(LedgerRadius.lg),
              border: Border.all(color: LedgerColors.outline),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('NEEDS YOU NOW · 4', style: LedgerTypography.labelSm(color: LedgerColors.error)),
                const SizedBox(height: LedgerSpacing.sm),
                _buildAlertItem('Approval · +200 units adjustment', 'Ravi · WH1-B-01-04 · Damaged', () => setState(() => _tabIndex = 1)),
                const Divider(color: LedgerColors.outline),
                _buildAlertItem('Short pick · SO-2026-0417 line 5', '2 units missing · Zone A', () {}),
                const Divider(color: LedgerColors.outline),
                _buildAlertItem('Assign picks · 3 pick lists', '18 lines waiting for shift assignment', () => _showAssignPicksDialog()),
              ],
            ),
          ),
          const SizedBox(height: LedgerSpacing.lg),
          // 2x2 KPI Grid
          GridView.count(
            crossAxisCount: 2,
            crossAxisSpacing: LedgerSpacing.gridGap,
            mainAxisSpacing: LedgerSpacing.gridGap,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            childAspectRatio: 1.15,
            children: const [
              LedgerKpiCard(
                value: '320',
                label: 'Inbound Today',
                note: '1 PO open · 48 received',
              ),
              LedgerKpiCard(
                value: '148',
                label: 'Outbound Today',
                delta: '12% vs yest',
                isPositive: true,
              ),
              LedgerKpiCard(
                value: '99.2%',
                label: 'Pick Accuracy',
                delta: '0.3pp',
                isPositive: false,
              ),
              LedgerKpiCard(
                value: '6',
                label: 'Staff on Shift',
                note: '2 pick, 3 putaway, 1 rcv',
              ),
            ],
          ),
          const SizedBox(height: LedgerSpacing.lg),
          // Lines picked per hour chart
          Container(
            padding: const EdgeInsets.all(LedgerSpacing.cardPadding),
            decoration: BoxDecoration(
              color: LedgerColors.surface,
              borderRadius: BorderRadius.circular(LedgerRadius.lg),
              border: Border.all(color: LedgerColors.outline),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Lines picked per hour', style: LedgerTypography.headlineMd()),
                    Text('Today vs Yesterday', style: LedgerTypography.labelSm()),
                  ],
                ),
                const SizedBox(height: LedgerSpacing.md),
                SizedBox(
                  height: 80,
                  child: CustomPaint(
                    size: const Size(double.infinity, 80),
                    painter: _LinesPerHourPainter(),
                  ),
                ),
                const SizedBox(height: LedgerSpacing.xs),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: ['09:00', '11:00', '13:00', '15:00', '17:00']
                      .map((t) => Text(t, style: LedgerTypography.labelSm()))
                      .toList(),
                ),
              ],
            ),
          ),
          const SizedBox(height: LedgerSpacing.xxl),
        ],
      ),
    );
  }

  Widget _buildApprovalsTab() {
    final app = widget.appState;
    return SingleChildScrollView(
      padding: const EdgeInsets.all(LedgerSpacing.screenGutter),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Eyebrow
          Text('STOCK ADJUSTMENT APPROVAL', style: LedgerTypography.labelSm()),
          const SizedBox(height: 4),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Requested by Ravi · 10:42', style: LedgerTypography.headlineMd()),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: LedgerColors.surfaceVariant,
                  borderRadius: BorderRadius.circular(LedgerRadius.sm),
                ),
                child: Text('Damaged', style: LedgerTypography.labelSm()),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text('Bin WH1-B-01-04 · SKU ASH-TEE-OVS-BLK-M', style: LedgerTypography.mono(color: LedgerColors.onSurfaceVariant)),
          const SizedBox(height: LedgerSpacing.lg),
          // Two-column comparison card
          Container(
            padding: const EdgeInsets.all(LedgerSpacing.cardPadding),
            decoration: BoxDecoration(
              color: LedgerColors.surface,
              borderRadius: BorderRadius.circular(LedgerRadius.lg),
              border: Border.all(color: LedgerColors.outline),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                Column(
                  children: [
                    Text('ON HAND NOW', style: LedgerTypography.labelSm()),
                    const SizedBox(height: 4),
                    Text('412', style: LedgerTypography.floorValue()),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: LedgerColors.errorSoft,
                    borderRadius: BorderRadius.circular(LedgerRadius.sm),
                  ),
                  child: Text(
                    '−200 units',
                    style: LedgerTypography.mono(color: LedgerColors.error, fontWeight: FontWeight.w700),
                  ),
                ),
                Column(
                  children: [
                    Text('AFTER APPROVAL', style: LedgerTypography.labelSm()),
                    const SizedBox(height: 4),
                    Text('212', style: LedgerTypography.floorValue()),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: LedgerSpacing.md),
          // Photo Evidence Placeholder
          Row(
            children: [
              Expanded(
                child: Container(
                  height: 100,
                  decoration: BoxDecoration(
                    color: LedgerColors.surfaceVariant,
                    borderRadius: BorderRadius.circular(LedgerRadius.md),
                    border: Border.all(color: LedgerColors.outline),
                  ),
                  child: const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.image_outlined, size: 28, color: LedgerColors.onSurfaceMuted),
                        SizedBox(height: 4),
                        Text('Torn Carton Box', style: TextStyle(fontSize: 11, color: LedgerColors.onSurfaceMuted)),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Container(
                  height: 100,
                  decoration: BoxDecoration(
                    color: LedgerColors.surfaceVariant,
                    borderRadius: BorderRadius.circular(LedgerRadius.md),
                    border: Border.all(color: LedgerColors.outline),
                  ),
                  child: const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.image_outlined, size: 28, color: LedgerColors.onSurfaceMuted),
                        SizedBox(height: 4),
                        Text('Stained Fabric', style: TextStyle(fontSize: 11, color: LedgerColors.onSurfaceMuted)),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: LedgerSpacing.sm),
          Text(
            'Above 20-unit threshold, so it waits for you. Nothing has changed in stock yet.',
            style: LedgerTypography.bodySm(color: LedgerColors.onSurfaceMuted),
          ),
          const SizedBox(height: LedgerSpacing.xl),
          if (app.adjustmentApproved) ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: LedgerColors.positiveSoft,
                borderRadius: BorderRadius.circular(LedgerRadius.md),
              ),
              child: Row(
                children: [
                  const Icon(Icons.check_circle, color: LedgerColors.positive, size: 20),
                  const SizedBox(width: 8),
                  Text('Adjustment approved & posted to Ledger', style: LedgerTypography.bodyMd(color: LedgerColors.positive)),
                ],
              ),
            ),
          ] else ...[
            Row(
              children: [
                Expanded(
                  child: LedgerButton(
                    text: 'Reject',
                    style: LedgerButtonStyle.secondary,
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Adjustment Rejected')));
                    },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: LedgerButton(
                    text: 'Approve −200',
                    style: LedgerButtonStyle.primary,
                    onPressed: () {
                      app.approveStockAdjustment();
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Approved! -200 posted to append-only stock_moves ledger.')),
                      );
                    },
                  ),
                ),
              ],
            ),
          ],
          const SizedBox(height: LedgerSpacing.xxl),
        ],
      ),
    );
  }

  Widget _buildLedgerTab() {
    return ListView(
      padding: const EdgeInsets.all(LedgerSpacing.screenGutter),
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Append-Only Moves', style: LedgerTypography.headlineLg()),
            ActionChip(
              avatar: const Icon(Icons.download, size: 16),
              label: Text('Export CSV', style: LedgerTypography.labelSm()),
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Exported stock_moves.csv')));
              },
            ),
          ],
        ),
        const SizedBox(height: LedgerSpacing.md),
        Text('TODAY · 10:00–11:00', style: LedgerTypography.labelSm()),
        const SizedBox(height: 6),
        ...MockDatabase.ledgerEntries.map((txn) {
          final isNeg = txn.deltaQty < 0;
          final isPos = txn.deltaQty > 0;
          return Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: LedgerColors.surface,
              borderRadius: BorderRadius.circular(LedgerRadius.md),
              border: Border.all(color: LedgerColors.outline),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: LedgerColors.surfaceVariant,
                    borderRadius: BorderRadius.circular(LedgerRadius.sm),
                  ),
                  child: Text(txn.type, style: LedgerTypography.labelSm()),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(txn.sku, style: LedgerTypography.mono(fontSize: 12, fontWeight: FontWeight.w600)),
                      Text('${txn.fromBin} → ${txn.toBin}', style: LedgerTypography.mono(fontSize: 11, color: LedgerColors.onSurfaceVariant)),
                      const SizedBox(height: 2),
                      Text('${txn.operatorName} · ${txn.timestamp} · ${txn.referenceDoc}', style: LedgerTypography.bodySm(color: LedgerColors.onSurfaceMuted)),
                    ],
                  ),
                ),
                Text(
                  '${txn.deltaQty > 0 ? "+" : ""}${txn.deltaQty}',
                  style: LedgerTypography.headlineMd(
                    color: isNeg ? LedgerColors.error : (isPos ? LedgerColors.positive : LedgerColors.onSurface),
                  ),
                ),
              ],
            ),
          );
        }),
      ],
    );
  }

  Widget _buildLookupTab() {
    final sku = widget.appState.selectedSku ?? MockDatabase.products.first;
    return SingleChildScrollView(
      padding: const EdgeInsets.all(LedgerSpacing.screenGutter),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(sku.code, style: LedgerTypography.mono(fontSize: 18, fontWeight: FontWeight.w700)),
          const SizedBox(height: 2),
          Text(sku.name, style: LedgerTypography.headlineLg()),
          Text('Barcode: ${sku.barcode} · MRP ₹${sku.mrp} · Cost ₹${sku.cost}', style: LedgerTypography.bodySm()),
          const SizedBox(height: LedgerSpacing.md),
          // 2x2 KPI Grid
          GridView.count(
            crossAxisCount: 2,
            crossAxisSpacing: 8,
            mainAxisSpacing: 8,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            childAspectRatio: 1.3,
            children: [
              LedgerKpiCard(value: '${sku.onHand}', label: 'On Hand (DC)'),
              LedgerKpiCard(value: '${sku.reserved}', label: 'Reserved'),
              LedgerKpiCard(value: '${sku.available}', label: 'Available'),
              LedgerKpiCard(value: '${sku.inTransit}', label: 'In Transit'),
            ],
          ),
          const SizedBox(height: LedgerSpacing.lg),
          // Warehouse Bins
          Container(
            padding: const EdgeInsets.all(LedgerSpacing.cardPadding),
            decoration: BoxDecoration(
              color: LedgerColors.surface,
              borderRadius: BorderRadius.circular(LedgerRadius.lg),
              border: Border.all(color: LedgerColors.outline),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Warehouse Bins', style: LedgerTypography.headlineMd()),
                const SizedBox(height: LedgerSpacing.sm),
                ...sku.warehouseBins.entries.map((e) => Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(e.key, style: LedgerTypography.mono()),
                          Text('${e.value} units', style: LedgerTypography.headlineMd()),
                        ],
                      ),
                    )),
              ],
            ),
          ),
          const SizedBox(height: LedgerSpacing.md),
          // Stores Stock
          Container(
            padding: const EdgeInsets.all(LedgerSpacing.cardPadding),
            decoration: BoxDecoration(
              color: LedgerColors.surface,
              borderRadius: BorderRadius.circular(LedgerRadius.lg),
              border: Border.all(color: LedgerColors.outline),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Retail Stores Stock', style: LedgerTypography.headlineMd()),
                const SizedBox(height: LedgerSpacing.sm),
                ...sku.storeStock.entries.map((e) => Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(e.key, style: LedgerTypography.bodyMd()),
                          Text('${e.value} units', style: LedgerTypography.headlineMd()),
                        ],
                      ),
                    )),
              ],
            ),
          ),
          const SizedBox(height: LedgerSpacing.xxl),
        ],
      ),
    );
  }

  void _showAssignPicksDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => Container(
        padding: const EdgeInsets.all(LedgerSpacing.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Assign Pick Lists', style: LedgerTypography.headlineLg()),
            const SizedBox(height: 4),
            Text('PL-0931 · 2 orders · 9 lines · ~14 min walk', style: LedgerTypography.bodySm()),
            const SizedBox(height: LedgerSpacing.md),
            Text('SELECT OPERATOR', style: LedgerTypography.labelSm()),
            const SizedBox(height: 8),
            Row(
              children: ['Ravi', 'Suresh', 'Priya'].map((name) {
                final isSel = _selectedOperator == name;
                return GestureDetector(
                  onTap: () => setState(() => _selectedOperator = name),
                  child: Container(
                    margin: const EdgeInsets.only(right: 10),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: isSel ? LedgerColors.primary : LedgerColors.surfaceVariant,
                      borderRadius: BorderRadius.circular(LedgerRadius.md),
                    ),
                    child: Text(
                      name,
                      style: LedgerTypography.labelMd(color: isSel ? LedgerColors.onPrimary : LedgerColors.onSurface),
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: LedgerSpacing.lg),
            LedgerButton(
              text: 'Assign to $_selectedOperator',
              onPressed: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('PL-0931 assigned to $_selectedOperator')));
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAlertItem(String title, String subtitle, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: Row(
          children: [
            const Icon(Icons.circle, size: 8, color: LedgerColors.error),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: LedgerTypography.labelLg()),
                  Text(subtitle, style: LedgerTypography.bodySm()),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, size: 18, color: LedgerColors.onSurfaceMuted),
          ],
        ),
      ),
    );
  }
}

class _LinesPerHourPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final todayPaint = Paint()
      ..color = LedgerColors.data1
      ..strokeWidth = 2.4
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final yestPaint = Paint()
      ..color = LedgerColors.data3
      ..strokeWidth = 1.6
      ..style = PaintingStyle.stroke;

    final todayData = [15.0, 32.0, 48.0, 42.0, 56.0];
    final yestData = [20.0, 28.0, 38.0, 35.0, 40.0];

    final pToday = Path();
    final pYest = Path();

    for (int i = 0; i < 5; i++) {
      final x = (i / 4) * size.width;
      final yT = size.height - (todayData[i] / 60.0) * size.height;
      final yY = size.height - (yestData[i] / 60.0) * size.height;

      if (i == 0) {
        pToday.moveTo(x, yT);
        pYest.moveTo(x, yY);
      } else {
        pToday.lineTo(x, yT);
        pYest.lineTo(x, yY);
      }
    }

    canvas.drawPath(pYest, yestPaint);
    canvas.drawPath(pToday, todayPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
