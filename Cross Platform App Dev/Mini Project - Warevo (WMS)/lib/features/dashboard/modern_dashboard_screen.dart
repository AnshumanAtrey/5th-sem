import 'package:flutter/material.dart';
import '../../core/theme/ledger_theme.dart';
import '../../state/app_state.dart';

class ModernDashboardScreen extends StatefulWidget {
  final AppState appState;
  final VoidCallback onOpenScanner;

  const ModernDashboardScreen({
    super.key,
    required this.appState,
    required this.onOpenScanner,
  });

  @override
  State<ModernDashboardScreen> createState() => _ModernDashboardScreenState();
}

class _ModernDashboardScreenState extends State<ModernDashboardScreen> {
  String _timeRange = 'Today';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F8FA),
      body: SafeArea(
        bottom: false,
        child: CustomScrollView(
          physics: const BouncingScrollPhysics(),
          slivers: [
            // Top App Bar with modern avatar and status
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 42,
                          height: 42,
                          decoration: BoxDecoration(
                            color: LedgerColors.primary,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Center(
                            child: Text(
                              'AA',
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Ashva Apparel',
                              style: LedgerTypography.headlineMd(fontSize: 16),
                            ),
                            Row(
                              children: [
                                Container(
                                  width: 6,
                                  height: 6,
                                  decoration: const BoxDecoration(
                                    color: LedgerColors.positive,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  '41 Locations Active · Real-time',
                                  style: LedgerTypography.bodySm(fontSize: 11.5),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ],
                    ),
                    Row(
                      children: [
                        IconButton(
                          onPressed: widget.onOpenScanner,
                          icon: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: LedgerColors.outline),
                            ),
                            child: const Icon(Icons.qr_code_scanner, size: 20, color: LedgerColors.onSurface),
                          ),
                        ),
                        IconButton(
                          onPressed: () {
                            _showNotificationsDialog(context);
                          },
                          icon: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: LedgerColors.outline),
                            ),
                            child: const Badge(
                              smallSize: 8,
                              backgroundColor: Color(0xFFF59E0B),
                              child: Icon(Icons.notifications_none_outlined, size: 20, color: LedgerColors.onSurface),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            // Time range selector
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Row(
                  children: [
                    _buildRangePill('Today'),
                    const SizedBox(width: 8),
                    _buildRangePill('7 Days'),
                    const SizedBox(width: 8),
                    _buildRangePill('30 Days'),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: LedgerColors.outline),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.sync, size: 13, color: LedgerColors.positive),
                          const SizedBox(width: 4),
                          Text('Synced 2m ago', style: LedgerTypography.labelSm(fontSize: 10.5)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Main Visual KPI Cards
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: GridView.count(
                  crossAxisCount: 2,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  childAspectRatio: 1.12,
                  children: [
                    _buildVisualCard(
                      title: 'ORDERS SHIPPED',
                      value: '148',
                      subText: '12.4% vs yest',
                      isPositive: true,
                      progressFraction: 0.78,
                      accentColor: const Color(0xFF12994F),
                      icon: Icons.local_shipping_outlined,
                    ),
                    _buildVisualCard(
                      title: 'JUMP RATE',
                      value: '2.1%',
                      subText: '₹18.6 L rerouted',
                      isPositive: false,
                      progressFraction: 0.28,
                      accentColor: const Color(0xFFE01824),
                      icon: Icons.alt_route,
                    ),
                    _buildVisualCard(
                      title: 'STOCK ON HAND',
                      value: '₹21.4 Cr',
                      subText: '647,200 units',
                      isPositive: true,
                      progressFraction: 0.92,
                      accentColor: const Color(0xFF2563EB),
                      icon: Icons.warehouse_outlined,
                    ),
                    _buildVisualCard(
                      title: 'STUCK ORDERS',
                      value: '9',
                      subText: '3 short · 6 store wait',
                      isPositive: true, // Fewer is good
                      progressFraction: 0.15,
                      accentColor: const Color(0xFFF59E0B),
                      icon: Icons.warning_amber_rounded,
                    ),
                  ],
                ),
              ),
            ),

            // Interactive Stock Inbound vs Outbound Visual Chart
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: LedgerColors.outline),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.02),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Expanded so the title yields room to the legend on narrow phones
                          // instead of overflowing the row.
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Inventory Velocity', style: LedgerTypography.headlineMd(fontSize: 16)),
                                Text('Daily Inflow vs Outflow movement',
                                    style: LedgerTypography.bodySm(),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis),
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),
                          Row(
                            children: [
                              _buildChartDot(const Color(0xFF0F1117), 'Outbound'),
                              const SizedBox(width: 10),
                              _buildChartDot(const Color(0xFF94A3B8), 'Inbound'),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      // Visual Bar & Trend Chart
                      SizedBox(
                        height: 120,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            _buildBarColumn('Mon', 42, 60),
                            _buildBarColumn('Tue', 55, 45),
                            _buildBarColumn('Wed', 70, 50),
                            _buildBarColumn('Thu', 65, 80),
                            _buildBarColumn('Fri', 90, 75),
                            _buildBarColumn('Sat', 110, 65),
                            _buildBarColumn('Today', 148, 85, isHighlighted: true),
                          ],
                        ),
                      ),
                      const SizedBox(height: 12),
                      const Divider(color: LedgerColors.outline),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Net Daily Movement: +63 units', style: LedgerTypography.labelMd(color: LedgerColors.positive)),
                          Text('Target: 120 units/day', style: LedgerTypography.labelSm()),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // Live Omni Routing Radar Card
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: LedgerColors.outline),
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
                                width: 8,
                                height: 8,
                                decoration: const BoxDecoration(
                                  color: Color(0xFFF59E0B),
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Text('Live Store Order Routing', style: LedgerTypography.headlineMd(fontSize: 15)),
                            ],
                          ),
                          Text('14 Active', style: LedgerTypography.mono(fontSize: 12, fontWeight: FontWeight.w600)),
                        ],
                      ),
                      const SizedBox(height: 14),
                      ...widget.appState.orders.take(2).map((order) {
                        return Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF8FAFC),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: LedgerColors.outline),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(order.id, style: LedgerTypography.mono(fontWeight: FontWeight.w700)),
                                  Text(
                                    order.remainingSeconds > 0
                                        ? '${order.remainingSeconds ~/ 60}:${(order.remainingSeconds % 60).toString().padLeft(2, '0')}'
                                        : 'Accepted',
                                    style: LedgerTypography.mono(
                                      color: order.remainingSeconds > 0 ? const Color(0xFFE01824) : LedgerColors.positive,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '${order.itemCount} items · ${order.customerArea} (${order.distanceKm} km)',
                                style: LedgerTypography.bodySm(),
                              ),
                              const SizedBox(height: 8),
                              // Visual Attempt Flow Pill
                              SingleChildScrollView(
                                scrollDirection: Axis.horizontal,
                                child: Row(
                                  children: [
                                    _buildStepPill('1. Phoenix Palassio', true, true),
                                    const Icon(Icons.arrow_forward_ios, size: 10, color: Colors.grey),
                                    _buildStepPill('2. Phoenix Citadel', false, false),
                                    const Icon(Icons.arrow_forward_ios, size: 10, color: Colors.grey),
                                    _buildStepPill('3. Bhiwandi DC', false, false),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        );
                      }),
                    ],
                  ),
                ),
              ),
            ),

            // Quick Floor Actions Grid
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Quick Operations', style: LedgerTypography.labelSm()),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        _buildQuickAction('Receive PO', Icons.input, () {
                          widget.appState.switchRole(UserRole.floor);
                        }),
                        const SizedBox(width: 8),
                        _buildQuickAction('Pick List', Icons.playlist_add_check, () {
                          widget.appState.switchRole(UserRole.floor);
                        }),
                        const SizedBox(width: 8),
                        _buildQuickAction('Store Handover', Icons.qr_code, widget.onOpenScanner),
                        const SizedBox(width: 8),
                        _buildQuickAction('Approve Adj', Icons.verified, () {
                          widget.appState.switchRole(UserRole.manager);
                        }),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            // Bottom space to prevent bottom navigation overlap
            const SliverToBoxAdapter(
              child: SizedBox(height: 100),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRangePill(String title) {
    final bool isSelected = _timeRange == title;
    return GestureDetector(
      onTap: () => setState(() => _timeRange = title),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? LedgerColors.primary : Colors.white,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: isSelected ? LedgerColors.primary : LedgerColors.outline),
        ),
        child: Text(
          title,
          style: TextStyle(
            fontFamily: LedgerTypography.fontSans,
            fontSize: 12,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
            color: isSelected ? Colors.white : LedgerColors.onSurfaceVariant,
          ),
        ),
      ),
    );
  }

  Widget _buildVisualCard({
    required String title,
    required String value,
    required String subText,
    required bool isPositive,
    required double progressFraction,
    required Color accentColor,
    required IconData icon,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: LedgerColors.outline),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: LedgerTypography.labelSm(fontSize: 10.5)),
              Icon(icon, size: 18, color: accentColor),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(value, style: LedgerTypography.headlineDisplay(fontSize: 22)),
              const SizedBox(height: 2),
              Row(
                children: [
                  Icon(
                    isPositive ? Icons.arrow_upward : Icons.arrow_downward,
                    size: 11,
                    color: isPositive ? LedgerColors.positive : LedgerColors.error,
                  ),
                  const SizedBox(width: 2),
                  Text(
                    subText,
                    style: TextStyle(
                      fontFamily: LedgerTypography.fontSans,
                      fontSize: 11,
                      color: isPositive ? LedgerColors.positive : LedgerColors.error,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ],
          ),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: progressFraction,
              backgroundColor: const Color(0xFFF1F5F9),
              valueColor: AlwaysStoppedAnimation<Color>(accentColor),
              minHeight: 5,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChartDot(Color color, String label) {
    return Row(
      children: [
        Container(width: 8, height: 8, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 4),
        Text(label, style: LedgerTypography.labelSm(fontSize: 11)),
      ],
    );
  }

  Widget _buildBarColumn(String label, double outVal, double inVal, {bool isHighlighted = false}) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Container(
              width: 8,
              height: (outVal / 150) * 80,
              decoration: BoxDecoration(
                color: isHighlighted ? const Color(0xFFFFAE19) : const Color(0xFF0F1117),
                borderRadius: const BorderRadius.vertical(top: Radius.circular(3)),
              ),
            ),
            const SizedBox(width: 3),
            Container(
              width: 8,
              height: (inVal / 150) * 80,
              decoration: BoxDecoration(
                color: const Color(0xFFCBD5E1),
                borderRadius: const BorderRadius.vertical(top: Radius.circular(3)),
              ),
            ),
          ],
        ),
        const SizedBox(height: 6),
        Text(
          label,
          style: TextStyle(
            fontSize: 10,
            fontWeight: isHighlighted ? FontWeight.bold : FontWeight.normal,
            color: isHighlighted ? LedgerColors.onSurface : LedgerColors.onSurfaceMuted,
          ),
        ),
      ],
    );
  }

  Widget _buildStepPill(String name, bool isDone, bool isActive) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 2),
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
      decoration: BoxDecoration(
        color: isActive
            ? const Color(0xFF0F1117)
            : (isDone ? const Color(0xFFE2E8F0) : Colors.transparent),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        name,
        style: TextStyle(
          fontFamily: LedgerTypography.fontMono,
          fontSize: 9.5,
          color: isActive ? Colors.white : Colors.black87,
          fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
        ),
      ),
    );
  }

  Widget _buildQuickAction(String title, IconData icon, VoidCallback onTap) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: LedgerColors.outline),
          ),
          child: Column(
            children: [
              Icon(icon, size: 20, color: LedgerColors.primary),
              const SizedBox(height: 6),
              Text(
                title,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showNotificationsDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(22))),
      builder: (context) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Notifications', style: LedgerTypography.headlineMd(fontSize: 18)),
                TextButton(onPressed: () => Navigator.pop(context), child: const Text('Mark Read')),
              ],
            ),
            const SizedBox(height: 10),
            _buildNotificationRow('Short pick reported', 'SO-2026-0417 · Line 5 · 2 missing at Bhiwandi DC', true),
            _buildNotificationRow('POS Sync Alert', 'Model Town store POS sync delayed by 47 mins', true),
            _buildNotificationRow('PO Arrived at Dock', 'PO-2026-0089 · Tirupur Knits ready for receive', false),
          ],
        ),
      ),
    );
  }

  Widget _buildNotificationRow(String title, String desc, bool isUrgent) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            isUrgent ? Icons.error_outline : Icons.check_circle_outline,
            size: 18,
            color: isUrgent ? const Color(0xFFE01824) : LedgerColors.positive,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                Text(desc, style: const TextStyle(color: Colors.black54, fontSize: 11.5)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
