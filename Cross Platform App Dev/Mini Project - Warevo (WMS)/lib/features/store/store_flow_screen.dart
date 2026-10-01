import 'package:flutter/material.dart';
import '../../core/theme/ledger_theme.dart';
import '../../core/widgets/ledger_app_bar.dart';
import '../../core/widgets/ledger_bottom_nav.dart';
import '../../core/widgets/ledger_button.dart';
import '../../core/widgets/ledger_kpi_card.dart';
import '../../core/widgets/ledger_scanner_dialog.dart';
import '../../data/mock_database.dart';
import '../../state/app_state.dart';

class StoreFlowScreen extends StatefulWidget {
  final AppState appState;

  const StoreFlowScreen({super.key, required this.appState});

  @override
  State<StoreFlowScreen> createState() => _StoreFlowScreenState();
}

class _StoreFlowScreenState extends State<StoreFlowScreen> {
  int _tabIndex = 0;
  String _orderSegment = 'Offered';
  String _selectedRejectReason = "Can't find the item";

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: LedgerColors.neutral,
      appBar: const LedgerAppBar(
        title: 'Phoenix Palassio',
        syncStatus: 'POS synced 3m ago',
      ),
      body: SafeArea(
        child: IndexedStack(
          index: _tabIndex,
          children: [
            _buildOrdersTab(),
            _buildStockTab(),
            _buildStoreTab(),
          ],
        ),
      ),
      bottomNavigationBar: LedgerBottomNav(
        currentIndex: _tabIndex,
        onTap: (i) => setState(() => _tabIndex = i),
        items: const [
          NavItemData(label: 'Orders', icon: Icons.shopping_bag_outlined),
          NavItemData(label: 'Stock', icon: Icons.inventory_2_outlined),
          NavItemData(label: 'Store', icon: Icons.storefront_outlined),
        ],
      ),
      floatingActionButton: (_tabIndex == 0 || _tabIndex == 1)
          ? FloatingActionButton(
              backgroundColor: LedgerColors.primary,
              foregroundColor: LedgerColors.onPrimary,
              shape: const CircleBorder(),
              onPressed: () {
                LedgerScannerDialog.show(
                  context,
                  title: 'Scan Item / Order QR',
                  onScanned: (val) {
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Scanned: $val')));
                  },
                );
              },
              child: const Icon(Icons.qr_code_scanner, size: 28),
            )
          : null,
    );
  }

  Widget _buildOrdersTab() {
    final offeredOrders = widget.appState.orders.where((o) => o.status == 'offered').toList();
    final readyOrders = widget.appState.orders.where((o) => o.status == 'ready_pickup').toList();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(LedgerSpacing.screenGutter),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.check_circle, size: 14, color: LedgerColors.positive),
              const SizedBox(width: 4),
              Text(
                '12 of 14 orders accepted first time today',
                style: LedgerTypography.labelMd(color: LedgerColors.positive),
              ),
            ],
          ),
          const SizedBox(height: LedgerSpacing.md),
          // Segmented Control
          Row(
            children: ['Offered', 'Picking', 'Ready', 'Done'].map((seg) {
              final isSel = _orderSegment == seg;
              return GestureDetector(
                onTap: () => setState(() => _orderSegment = seg),
                child: Container(
                  margin: const EdgeInsets.only(right: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: isSel ? LedgerColors.primary : LedgerColors.surfaceVariant,
                    borderRadius: BorderRadius.circular(LedgerRadius.full),
                  ),
                  child: Text(
                    seg,
                    style: LedgerTypography.labelMd(
                      color: isSel ? LedgerColors.onPrimary : LedgerColors.onSurfaceVariant,
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: LedgerSpacing.lg),
          // Live Offer Cards with Countdown Timers
          Text('NEW ORDERS OFFERED TO THIS STORE', style: LedgerTypography.labelSm()),
          const SizedBox(height: LedgerSpacing.sm),
          ...offeredOrders.map((order) {
            final isUrgent = order.remainingSeconds < 240;
            final mins = (order.remainingSeconds ~/ 60).toString().padLeft(2, '0');
            final secs = (order.remainingSeconds % 60).toString().padLeft(2, '0');

            return Container(
              margin: const EdgeInsets.only(bottom: LedgerSpacing.md),
              padding: const EdgeInsets.all(LedgerSpacing.cardPadding),
              decoration: BoxDecoration(
                color: LedgerColors.surface,
                borderRadius: BorderRadius.circular(LedgerRadius.lg),
                border: Border.all(
                  color: isUrgent ? LedgerColors.error : LedgerColors.outlineStrong,
                  width: isUrgent ? 1.5 : 1,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(order.id, style: LedgerTypography.mono(fontSize: 15, fontWeight: FontWeight.w700)),
                      Text(
                        'Accept within $mins:$secs',
                        style: LedgerTypography.headlineMd(
                          color: isUrgent ? LedgerColors.error : LedgerColors.onSurface,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${order.itemCount} items · Deliver to ${order.customerArea} (${order.distanceKm} km)',
                    style: LedgerTypography.bodyMd(),
                  ),
                  const SizedBox(height: LedgerSpacing.md),
                  ...order.items.map((item) => Padding(
                        padding: const EdgeInsets.symmetric(vertical: 2),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(item['name'], style: LedgerTypography.bodySm()),
                            Text('In stock: ${item['inStock']} (POS 94%)', style: LedgerTypography.labelSm()),
                          ],
                        ),
                      )),
                  const SizedBox(height: LedgerSpacing.lg),
                  Row(
                    children: [
                      Expanded(
                        child: LedgerButton(
                          text: 'Reject',
                          style: LedgerButtonStyle.secondary,
                          height: 44,
                          onPressed: () => _showRejectSheet(order.id),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: LedgerButton(
                          text: 'Accept Order',
                          style: LedgerButtonStyle.primary,
                          height: 44,
                          onPressed: () {
                            widget.appState.acceptOrder(order.id);
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text('Accepted ${order.id}! Karan can now pick from Men\'s wall.')),
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          }),
          const SizedBox(height: LedgerSpacing.md),
          Text('READY FOR CUSTOMER PICKUP', style: LedgerTypography.labelSm()),
          const SizedBox(height: LedgerSpacing.sm),
          ...readyOrders.map((order) => Container(
                margin: const EdgeInsets.only(bottom: LedgerSpacing.md),
                padding: const EdgeInsets.all(LedgerSpacing.cardPadding),
                decoration: BoxDecoration(
                  color: LedgerColors.surface,
                  borderRadius: BorderRadius.circular(LedgerRadius.lg),
                  border: Border.all(color: LedgerColors.outline),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(order.id, style: LedgerTypography.mono(fontWeight: FontWeight.w600)),
                        Text('Ananya S. · 2 items · Paid', style: LedgerTypography.bodySm()),
                        Text('Waiting since 11:20', style: LedgerTypography.labelSm(color: LedgerColors.onSurfaceMuted)),
                      ],
                    ),
                    LedgerButton(
                      text: 'Hand over',
                      style: LedgerButtonStyle.primary,
                      height: 38,
                      fullWidth: false,
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Customer QR verified & handed over!')),
                        );
                      },
                    ),
                  ],
                ),
              )),
          const SizedBox(height: LedgerSpacing.xxl),
        ],
      ),
    );
  }

  Widget _buildStockTab() {
    return ListView(
      padding: const EdgeInsets.all(LedgerSpacing.screenGutter),
      children: [
        Text('Store Stock (POS Feed)', style: LedgerTypography.headlineLg()),
        const SizedBox(height: LedgerSpacing.md),
        ...MockDatabase.products.map((sku) {
          final storeQty = sku.storeStock['Phoenix Palassio'] ?? 0;
          return Container(
            margin: const EdgeInsets.only(bottom: 10),
            padding: const EdgeInsets.all(LedgerSpacing.cardPadding),
            decoration: BoxDecoration(
              color: LedgerColors.surface,
              borderRadius: BorderRadius.circular(LedgerRadius.lg),
              border: Border.all(color: LedgerColors.outline),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(sku.name, style: LedgerTypography.labelLg()),
                      Text(sku.code, style: LedgerTypography.mono(fontSize: 11, color: LedgerColors.onSurfaceVariant)),
                      const SizedBox(height: 2),
                      Text('Last sold: 14:10 · Ginesys POS', style: LedgerTypography.labelSm(color: LedgerColors.onSurfaceMuted)),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text('$storeQty', style: LedgerTypography.floorValue(fontSize: 24)),
                    Text('on shelf', style: LedgerTypography.labelSm()),
                  ],
                ),
              ],
            ),
          );
        }),
      ],
    );
  }

  Widget _buildStoreTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(LedgerSpacing.screenGutter),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Store Performance', style: LedgerTypography.headlineLg()),
          const SizedBox(height: LedgerSpacing.md),
          GridView.count(
            crossAxisCount: 2,
            crossAxisSpacing: 8,
            mainAxisSpacing: 8,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            childAspectRatio: 1.25,
            children: const [
              LedgerKpiCard(value: '91%', label: 'First-Attempt Accept', delta: '3pp', isPositive: true),
              LedgerKpiCard(value: '6', label: 'Orders Jumped Away', isPositive: false),
              LedgerKpiCard(value: '0.94', label: 'Location Trust Score'),
              LedgerKpiCard(value: '94%', label: 'Stock Confidence'),
            ],
          ),
          const SizedBox(height: LedgerSpacing.lg),
          Text('Endless Aisle (Sell from DC / Other Stores)', style: LedgerTypography.headlineMd()),
          const SizedBox(height: 6),
          Container(
            padding: const EdgeInsets.all(LedgerSpacing.cardPadding),
            decoration: BoxDecoration(
              color: LedgerColors.surfaceVariant,
              borderRadius: BorderRadius.circular(LedgerRadius.md),
            ),
            child: Row(
              children: [
                const Icon(Icons.travel_explore, size: 24, color: LedgerColors.primary),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Size not in Lucknow? Place order from Phoenix Citadel (7 available) or Bhiwandi DC (48 available) with store credit.',
                    style: LedgerTypography.bodySm(),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showRejectSheet(String orderId) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => StatefulBuilder(
        builder: (context, setSheetState) => Container(
          padding: const EdgeInsets.all(LedgerSpacing.xl),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text("Why can't this store fulfil it?", style: LedgerTypography.headlineLg()),
              const SizedBox(height: 4),
              Text(
                'The order will jump to Phoenix Citadel automatically. This logs on store trust score.',
                style: LedgerTypography.bodySm(color: LedgerColors.onSurfaceMuted),
              ),
              const SizedBox(height: LedgerSpacing.md),
              ...[
                "Can't find the item",
                'Item is damaged',
                'Stock number is wrong in POS',
                'No staff capacity right now',
                'Past dispatch cut-off time',
              ].map((reason) {
                return InkWell(
                  onTap: () => setSheetState(() => _selectedRejectReason = reason),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    child: Row(
                      children: [
                        Icon(
                          _selectedRejectReason == reason
                              ? Icons.radio_button_checked
                              : Icons.radio_button_unchecked,
                          color: _selectedRejectReason == reason
                              ? LedgerColors.primary
                              : LedgerColors.onSurfaceMuted,
                          size: 20,
                        ),
                        const SizedBox(width: 10),
                        Text(reason, style: LedgerTypography.bodyMd()),
                      ],
                    ),
                  ),
                );
              }),
              const SizedBox(height: LedgerSpacing.lg),
              LedgerButton(
                text: 'Reject and re-route',
                style: LedgerButtonStyle.destructive,
                onPressed: () {
                  widget.appState.rejectOrder(orderId, _selectedRejectReason);
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Order re-routed to Phoenix Citadel (Reason: $_selectedRejectReason)')),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
