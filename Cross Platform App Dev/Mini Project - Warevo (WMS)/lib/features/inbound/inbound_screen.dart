import 'package:flutter/material.dart';
import '../../core/theme/ledger_theme.dart';
import '../../core/widgets/ledger_scanner_dialog.dart';
import '../../state/app_state.dart';

class InboundScreen extends StatefulWidget {
  final AppState appState;

  const InboundScreen({super.key, required this.appState});

  @override
  State<InboundScreen> createState() => _InboundScreenState();
}

class _InboundScreenState extends State<InboundScreen> {
  String _activeFilter = 'All POs';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F8FA),
      body: SafeArea(
        bottom: false,
        child: CustomScrollView(
          physics: const BouncingScrollPhysics(),
          slivers: [
            // Header
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Inbound Shipments', style: LedgerTypography.headlineLg(fontSize: 22)),
                          Text('PO Receipts · GRN Notes · Dock Intake',
                              style: LedgerTypography.bodySm(),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    ElevatedButton.icon(
                      onPressed: () {
                        LedgerScannerDialog.show(
                          context,
                          title: 'Scan Inbound PO / Box',
                          onScanned: (code) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text('PO Identified: $code. Ready to intake.')),
                            );
                          },
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: LedgerColors.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      icon: const Icon(Icons.qr_code_scanner, size: 16),
                      label: const Text('Scan Intake', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600)),
                    ),
                  ],
                ),
              ),
            ),

            // Inbound Status Summary Cards
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                child: Row(
                  children: [
                    _buildDockCard('DOCK 01', 'Arrived', 'PO-2026-0089', 'Tirupur Knits', 0.8, const Color(0xFF12994F)),
                    const SizedBox(width: 10),
                    _buildDockCard('DOCK 02', 'Unloading', 'PO-2026-0091', 'Vardhman Mill', 0.35, const Color(0xFFF59E0B)),
                  ],
                ),
              ),
            ),

            // Filter Chips
            SliverToBoxAdapter(
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                child: Row(
                  children: ['All POs', 'At Dock (2)', 'Putaway Pending (3)', 'Completed (31)'].map((chip) {
                    final isSel = _activeFilter == chip;
                    return GestureDetector(
                      onTap: () => setState(() => _activeFilter = chip),
                      child: Container(
                        margin: const EdgeInsets.only(right: 8),
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: isSel ? LedgerColors.primary : Colors.white,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: isSel ? LedgerColors.primary : LedgerColors.outline),
                        ),
                        child: Text(
                          chip,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: isSel ? FontWeight.w600 : FontWeight.w500,
                            color: isSel ? Colors.white : LedgerColors.onSurfaceVariant,
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
            ),

            // Active Purchase Orders List with Visual Progress
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Column(
                  children: [
                    _buildPoCard(
                      poNumber: 'PO-2026-0089',
                      supplier: 'Tirupur Knits Pvt Ltd',
                      dock: 'Bhiwandi Dock 01',
                      eta: 'Arrived Today · 09:30 AM',
                      unitsReceived: 48,
                      unitsTotal: 60,
                      status: 'Receiving',
                      statusColor: const Color(0xFFF59E0B),
                      onAction: () {
                        widget.appState.switchRole(UserRole.floor);
                      },
                    ),
                    const SizedBox(height: 12),
                    _buildPoCard(
                      poNumber: 'PO-2026-0091',
                      supplier: 'Vardhman Textiles',
                      dock: 'Bhiwandi Dock 02',
                      eta: 'Expected 14 Sep · ₹4.2 L',
                      unitsReceived: 12,
                      unitsTotal: 120,
                      status: 'Unloading',
                      statusColor: const Color(0xFF2563EB),
                      onAction: () {
                        widget.appState.switchRole(UserRole.floor);
                      },
                    ),
                    const SizedBox(height: 12),
                    _buildPoCard(
                      poNumber: 'PO-2026-0085',
                      supplier: 'Arvind Mills Ltd',
                      dock: 'Staging Area A',
                      eta: 'Completed Yesterday · GRN-0142',
                      unitsReceived: 240,
                      unitsTotal: 240,
                      status: 'Verified',
                      statusColor: const Color(0xFF12994F),
                      onAction: () {},
                    ),
                  ],
                ),
              ),
            ),

            const SliverToBoxAdapter(child: SizedBox(height: 100)),
          ],
        ),
      ),
    );
  }

  Widget _buildDockCard(String dock, String state, String po, String vendor, double progress, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: LedgerColors.outline),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.02),
              blurRadius: 6,
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(dock, style: LedgerTypography.mono(fontSize: 12, fontWeight: FontWeight.bold)),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(state, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: color)),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(po, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            Text(vendor, style: const TextStyle(fontSize: 11, color: Colors.grey)),
            const SizedBox(height: 8),
            ClipRRect(
              borderRadius: BorderRadius.circular(3),
              child: LinearProgressIndicator(
                value: progress,
                backgroundColor: const Color(0xFFF1F5F9),
                valueColor: AlwaysStoppedAnimation<Color>(color),
                minHeight: 4,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPoCard({
    required String poNumber,
    required String supplier,
    required String dock,
    required String eta,
    required int unitsReceived,
    required int unitsTotal,
    required String status,
    required Color statusColor,
    required VoidCallback onAction,
  }) {
    final double fraction = unitsTotal > 0 ? (unitsReceived / unitsTotal) : 0.0;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: LedgerColors.outline),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 8,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.inventory_2_outlined, size: 18, color: LedgerColors.primary),
                  ),
                  const SizedBox(width: 10),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(poNumber, style: LedgerTypography.mono(fontSize: 14, fontWeight: FontWeight.bold)),
                      Text(supplier, style: const TextStyle(fontSize: 12, color: Colors.black87)),
                    ],
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  status,
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: statusColor),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(dock, style: LedgerTypography.bodySm(fontSize: 11.5)),
              Text('$unitsReceived / $unitsTotal units (${(fraction * 100).toInt()}%)', style: LedgerTypography.mono(fontSize: 12, fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: fraction,
              backgroundColor: const Color(0xFFF1F5F9),
              valueColor: AlwaysStoppedAnimation<Color>(statusColor),
              minHeight: 6,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(eta, style: const TextStyle(fontSize: 11.5, color: Colors.grey)),
              ElevatedButton(
                onPressed: onAction,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0F1117),
                  foregroundColor: Colors.white,
                  elevation: 0,
                  minimumSize: const Size(90, 32),
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                child: const Text('Open Intake', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
