import 'package:flutter/material.dart';
import '../../core/theme/ledger_theme.dart';
import '../../core/widgets/ledger_app_bar.dart';
import '../../core/widgets/ledger_bottom_nav.dart';
import '../../core/widgets/ledger_button.dart';
import '../../core/widgets/ledger_kpi_card.dart';
import '../../data/mock_database.dart';
import '../../state/app_state.dart';

class OwnerFlowScreen extends StatefulWidget {
  final AppState appState;

  const OwnerFlowScreen({super.key, required this.appState});

  @override
  State<OwnerFlowScreen> createState() => _OwnerFlowScreenState();
}

class _OwnerFlowScreenState extends State<OwnerFlowScreen> {
  int _tabIndex = 0;
  String _timeRange = 'Today';
  int _omniSubTab = 0; // 0: Live Board, 1: Scorecard

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: LedgerColors.neutral,
      appBar: LedgerAppBar(
        title: _getAppBarTitle(),
        syncStatus: widget.appState.syncStatusText,
        isSyncUrgent: false,
        impersonatingTenant: widget.appState.impersonatingTenant.isNotEmpty
            ? widget.appState.impersonatingTenant
            : null,
        onEndImpersonation: widget.appState.stopImpersonation,
      ),
      body: SafeArea(
        child: IndexedStack(
          index: _tabIndex,
          children: [
            _buildDashboardTab(),
            _buildOmniTab(),
            _buildOpsTab(),
            _buildLocationsTab(),
            _buildTeamSettingsTab(),
          ],
        ),
      ),
      bottomNavigationBar: LedgerBottomNav(
        currentIndex: _tabIndex,
        onTap: (i) => setState(() => _tabIndex = i),
        items: const [
          NavItemData(label: 'Home', icon: Icons.dashboard_outlined),
          NavItemData(label: 'Omni', icon: Icons.alt_route),
          NavItemData(label: 'Ops', icon: Icons.swap_horiz),
          NavItemData(label: 'Locations', icon: Icons.storefront),
          NavItemData(label: 'Team', icon: Icons.people_outline),
        ],
      ),
    );
  }

  String _getAppBarTitle() {
    switch (_tabIndex) {
      case 0:
        return 'Ashva Apparel';
      case 1:
        return 'Omni Stock';
      case 2:
        return 'Operations';
      case 3:
        return 'Locations (41)';
      case 4:
        return 'Team & Plan';
      default:
        return 'Ledger';
    }
  }

  Widget _buildDashboardTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(LedgerSpacing.screenGutter),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Time range segmented pill
          Row(
            children: ['Today', '7d', '30d'].map((r) {
              final isSel = _timeRange == r;
              return GestureDetector(
                onTap: () => setState(() => _timeRange = r),
                child: Container(
                  margin: const EdgeInsets.only(right: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: isSel ? LedgerColors.primary : LedgerColors.surfaceVariant,
                    borderRadius: BorderRadius.circular(LedgerRadius.full),
                  ),
                  child: Text(
                    r,
                    style: LedgerTypography.labelMd(
                      color: isSel ? LedgerColors.onPrimary : LedgerColors.onSurfaceVariant,
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: LedgerSpacing.md),
          // 2x2 Founders KPI Grid
          GridView.count(
            crossAxisCount: 2,
            crossAxisSpacing: LedgerSpacing.gridGap,
            mainAxisSpacing: LedgerSpacing.gridGap,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            childAspectRatio: 1.15,
            children: const [
              LedgerKpiCard(
                value: '148',
                label: 'Orders Shipped',
                delta: '12.4% vs yesterday',
                isPositive: true,
                sparklineData: [40, 55, 68, 72, 90, 110, 148],
              ),
              LedgerKpiCard(
                value: '9',
                label: 'Stuck Orders',
                delta: '3 vs yesterday',
                isPositive: true, // fewer stuck is positive
                note: '6 awaiting store · 3 short',
              ),
              LedgerKpiCard(
                value: '2.1%',
                label: 'Jump Rate',
                delta: '0.4pp',
                isPositive: false,
                note: '₹18.6 L re-routed this wk',
              ),
              LedgerKpiCard(
                value: '₹21.4 Cr',
                label: 'Stock On Hand',
                note: '647k units · 41 locations',
              ),
            ],
          ),
          const SizedBox(height: LedgerSpacing.lg),
          // Chart Card: Inbound vs Outbound
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
                    Text('Inbound vs outbound · units', style: LedgerTypography.headlineMd()),
                    Row(
                      children: [
                        Container(width: 8, height: 2, color: LedgerColors.data1),
                        const SizedBox(width: 4),
                        Text('Out', style: LedgerTypography.labelSm()),
                        const SizedBox(width: 8),
                        Container(width: 8, height: 2, color: LedgerColors.data3),
                        const SizedBox(width: 4),
                        Text('In', style: LedgerTypography.labelSm()),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: LedgerSpacing.md),
                SizedBox(
                  height: 90,
                  child: CustomPaint(
                    size: const Size(double.infinity, 90),
                    painter: _DualChartPainter(),
                  ),
                ),
                const SizedBox(height: LedgerSpacing.xs),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today']
                      .map((d) => Text(d, style: LedgerTypography.labelSm()))
                      .toList(),
                ),
              ],
            ),
          ),
          const SizedBox(height: LedgerSpacing.lg),
          // 41 Locations Health Strip
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
                    Text('Location health', style: LedgerTypography.headlineMd()),
                    Text('37 live · 3 stale · 1 quarantined', style: LedgerTypography.bodySm()),
                  ],
                ),
                const SizedBox(height: LedgerSpacing.md),
                Wrap(
                  spacing: 4,
                  runSpacing: 4,
                  children: List.generate(41, (index) {
                    Color dotColor = LedgerColors.data1;
                    if (index >= 37 && index < 40) {
                      dotColor = LedgerColors.data3; // Stale
                    } else if (index == 40) {
                      dotColor = LedgerColors.error; // Quarantined (Model Town)
                    }
                    return Container(
                      width: 14,
                      height: 14,
                      decoration: BoxDecoration(
                        color: dotColor,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    );
                  }),
                ),
              ],
            ),
          ),
          const SizedBox(height: LedgerSpacing.lg),
          // Needs You Now Alert Card
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
                _buildAlertRow(
                  'Approve +200 unit adjustment',
                  'Bhiwandi DC · Ravi · WH1-B-01-04',
                  true,
                  () => widget.appState.switchRole(UserRole.manager),
                ),
                const Divider(color: LedgerColors.outline),
                _buildAlertRow(
                  'Model Town POS stale 47 min',
                  'Stock went negative on 2 SKUs · Excluded',
                  true,
                  () => setState(() => _tabIndex = 3),
                ),
                const Divider(color: LedgerColors.outline),
                _buildAlertRow(
                  'PO-2026-0091 awaiting approval',
                  'Tirupur Knits · ₹4.2 L · 12 lines',
                  false,
                  () => setState(() => _tabIndex = 2),
                ),
              ],
            ),
          ),
          const SizedBox(height: LedgerSpacing.xxl),
        ],
      ),
    );
  }

  Widget _buildOmniTab() {
    return Column(
      children: [
        // Sub-tabs: Live Board vs Scorecard
        Padding(
          padding: const EdgeInsets.all(LedgerSpacing.screenGutter),
          child: Row(
            children: [
              Expanded(
                child: LedgerButton(
                  text: 'Live Board (14)',
                  style: _omniSubTab == 0 ? LedgerButtonStyle.primary : LedgerButtonStyle.secondary,
                  height: 40,
                  onPressed: () => setState(() => _omniSubTab = 0),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: LedgerButton(
                  text: 'Omni Scorecard',
                  style: _omniSubTab == 1 ? LedgerButtonStyle.primary : LedgerButtonStyle.secondary,
                  height: 40,
                  onPressed: () => setState(() => _omniSubTab = 1),
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: _omniSubTab == 0 ? _buildOmniLiveBoard() : _buildOmniScorecard(),
        ),
      ],
    );
  }

  Widget _buildOmniLiveBoard() {
    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: LedgerSpacing.screenGutter),
      children: [
        ...widget.appState.orders.map((order) {
          final isExhausted = order.status == 'exhausted';
          return Container(
            margin: const EdgeInsets.only(bottom: LedgerSpacing.md),
            padding: const EdgeInsets.all(LedgerSpacing.cardPadding),
            decoration: BoxDecoration(
              color: LedgerColors.surface,
              borderRadius: BorderRadius.circular(LedgerRadius.lg),
              border: Border.all(
                color: isExhausted ? LedgerColors.error : LedgerColors.outline,
                width: isExhausted ? 1.5 : 1,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '${order.id} · ${order.itemCount} items · ₹${order.totalAmount}',
                      style: LedgerTypography.mono(fontWeight: FontWeight.w600),
                    ),
                    if (order.remainingSeconds > 0)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: LedgerColors.errorSoft,
                          borderRadius: BorderRadius.circular(LedgerRadius.sm),
                        ),
                        child: Text(
                          '${(order.remainingSeconds ~/ 60).toString().padLeft(2, '0')}:${(order.remainingSeconds % 60).toString().padLeft(2, '0')}',
                          style: LedgerTypography.mono(color: LedgerColors.error, fontWeight: FontWeight.w700),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  '${order.customerArea}, ${order.customerCity} · ${order.distanceKm} km · ${order.source}',
                  style: LedgerTypography.bodySm(),
                ),
                const SizedBox(height: LedgerSpacing.md),
                Text('ATTEMPT CHAIN & ROUTING', style: LedgerTypography.labelSm()),
                const SizedBox(height: 6),
                // Horizontal attempt chain chips
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: order.attemptChain.map((att) {
                      Color chipBg = LedgerColors.surfaceVariant;
                      Color borderColor = LedgerColors.outline;
                      Color textColor = LedgerColors.onSurface;

                      if (att.outcome == 'offered') {
                        chipBg = LedgerColors.primary;
                        textColor = LedgerColors.onPrimary;
                        borderColor = LedgerColors.primary;
                      } else if (att.outcome == 'rejected' || att.outcome == 'timed_out') {
                        chipBg = LedgerColors.errorSoft;
                        textColor = LedgerColors.error;
                        borderColor = LedgerColors.error;
                      } else if (att.outcome == 'accepted') {
                        chipBg = LedgerColors.positiveSoft;
                        textColor = LedgerColors.positive;
                      }

                      return Container(
                        margin: const EdgeInsets.only(right: 6),
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: chipBg,
                          borderRadius: BorderRadius.circular(LedgerRadius.sm),
                          border: Border.all(color: borderColor),
                        ),
                        child: Text(
                          '${att.step}. ${att.locationName} ${att.reason != null ? "(${att.reason})" : ""}',
                          style: LedgerTypography.labelMd(color: textColor),
                        ),
                      );
                    }).toList(),
                  ),
                ),
                if (isExhausted) ...[
                  const SizedBox(height: LedgerSpacing.md),
                  LedgerButton(
                    text: 'Assign Location Manually',
                    style: LedgerButtonStyle.primary,
                    height: 40,
                    onPressed: () {
                      widget.appState.acceptOrder(order.id);
                    },
                  ),
                ],
              ],
            ),
          );
        }),
      ],
    );
  }

  Widget _buildOmniScorecard() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: LedgerSpacing.screenGutter),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          GridView.count(
            crossAxisCount: 2,
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            childAspectRatio: 1.25,
            children: const [
              LedgerKpiCard(
                value: '88%',
                label: 'First-Attempt Acceptance',
                delta: '4pp',
                isPositive: true,
              ),
              LedgerKpiCard(
                value: '₹18.6 L',
                label: 'Cost of Jumps',
                note: '142 hrs delayed',
              ),
              LedgerKpiCard(
                value: '2.1%',
                label: 'Jump Rate',
                delta: '0.4pp',
                isPositive: false,
              ),
              LedgerKpiCard(
                value: '3',
                label: 'Oversells',
                note: '0.2% vs 0.5% target',
              ),
            ],
          ),
          const SizedBox(height: LedgerSpacing.lg),
          // Why locations reject breakdown
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
                Text('Why locations reject online orders', style: LedgerTypography.headlineMd()),
                const SizedBox(height: LedgerSpacing.md),
                _buildBarRow("Can't find the item", 41, 0.65),
                _buildBarRow('Stock number wrong in POS', 12, 0.20),
                _buildBarRow('No staff capacity on floor', 9, 0.14),
                _buildBarRow('Past dispatch cut-off time', 6, 0.10),
                _buildBarRow('No response before timer', 4, 0.06),
              ],
            ),
          ),
          const SizedBox(height: LedgerSpacing.lg),
          // Locations by trust table
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
                Text('Locations ranked by trust score', style: LedgerTypography.headlineMd()),
                const SizedBox(height: LedgerSpacing.sm),
                const Divider(color: LedgerColors.outline),
                ...MockDatabase.locations.map((loc) {
                  final isLow = loc.trustScore < 0.6;
                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(loc.name, style: LedgerTypography.labelLg()),
                              Text(loc.city, style: LedgerTypography.bodySm()),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: isLow ? LedgerColors.errorSoft : LedgerColors.surfaceVariant,
                            borderRadius: BorderRadius.circular(LedgerRadius.sm),
                          ),
                          child: Text(
                            'Trust: ${(loc.trustScore * 100).toInt()}%',
                            style: LedgerTypography.mono(
                              color: isLow ? LedgerColors.error : LedgerColors.onSurface,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                }),
              ],
            ),
          ),
          const SizedBox(height: LedgerSpacing.xl),
        ],
      ),
    );
  }

  Widget _buildOpsTab() {
    return ListView(
      padding: const EdgeInsets.all(LedgerSpacing.screenGutter),
      children: [
        Text('Sales & Purchase Orders', style: LedgerTypography.headlineLg()),
        const SizedBox(height: LedgerSpacing.md),
        _buildOpsCard('SO-2026-0417', 'Shopify · 3 lines · ₹4,197', 'Picking', 'Bhiwandi DC · Ravi · Cut-off 16:00'),
        _buildOpsCard('SO-2026-0416', 'Myntra · 1 line · ₹1,299', 'Dispatched', 'Delhivery AWB 289177432210'),
        _buildOpsCard('PO-2026-0091', 'Tirupur Knits · 12 lines · ₹4.2 L', 'Awaiting Approval', 'Expected 14 Sep · Bhiwandi DC'),
        _buildOpsCard('TR-0088', 'Bhiwandi DC → Phoenix Palassio · 120 units', 'In Transit', 'Dispatched 7 Sep · ETA Today'),
      ],
    );
  }

  Widget _buildLocationsTab() {
    return ListView.separated(
      padding: const EdgeInsets.all(LedgerSpacing.screenGutter),
      itemCount: MockDatabase.locations.length,
      separatorBuilder: (_, _) => const SizedBox(height: 10),
      itemBuilder: (context, index) {
        final loc = MockDatabase.locations[index];
        Color statusBg = LedgerColors.positiveSoft;
        Color statusColor = LedgerColors.positive;
        String statusLabel = 'LIVE';

        if (loc.status == 'stale') {
          statusBg = LedgerColors.surfaceVariant;
          statusColor = LedgerColors.onSurfaceVariant;
          statusLabel = 'STALE';
        } else if (loc.status == 'quarantined') {
          statusBg = LedgerColors.errorSoft;
          statusColor = LedgerColors.error;
          statusLabel = 'QUARANTINED';
        }

        return Container(
          padding: const EdgeInsets.all(LedgerSpacing.cardPadding),
          decoration: BoxDecoration(
            color: LedgerColors.surface,
            borderRadius: BorderRadius.circular(LedgerRadius.lg),
            border: Border.all(color: LedgerColors.outline),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(
                loc.type == 'warehouse' ? Icons.warehouse_outlined : Icons.store_mall_directory_outlined,
                size: 28,
                color: LedgerColors.primary,
              ),
              const SizedBox(width: LedgerSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(loc.name, style: LedgerTypography.headlineMd()),
                    const SizedBox(height: 2),
                    Text('${loc.city} · ${loc.details ?? ""}', style: LedgerTypography.bodySm()),
                    const SizedBox(height: 4),
                    Text(loc.syncAge, style: LedgerTypography.labelSm(color: LedgerColors.onSurfaceMuted)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: statusBg,
                  borderRadius: BorderRadius.circular(LedgerRadius.sm),
                ),
                child: Text(statusLabel, style: LedgerTypography.labelSm(color: statusColor)),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildTeamSettingsTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(LedgerSpacing.screenGutter),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Plan Card
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
                    Text('Growth Plan', style: LedgerTypography.headlineLg()),
                    Text('₹12,000 / mo', style: LedgerTypography.headlineMd()),
                  ],
                ),
                const SizedBox(height: LedgerSpacing.md),
                _buildUsageBar('Staff Seats', '14 / 25', 14 / 25),
                _buildUsageBar('Locations', '41 / 50', 41 / 50),
                _buildUsageBar('SKU Limit', '4,120 / 10,000', 4120 / 10000),
                _buildUsageBar('Monthly Orders', '3,812 / 5,000', 3812 / 5000),
              ],
            ),
          ),
          const SizedBox(height: LedgerSpacing.lg),
          Text('Team & Access Control', style: LedgerTypography.headlineLg()),
          const SizedBox(height: LedgerSpacing.sm),
          _buildTeamMemberRow('Aarav Shah (You)', 'OWNER', 'All locations', true),
          _buildTeamMemberRow('Meena Sharma', 'MANAGER', 'Bhiwandi DC', false),
          _buildTeamMemberRow('Priya Nair', 'STORE MANAGER', 'Phoenix Palassio, Lucknow', false),
          _buildTeamMemberRow('Ravi Kumar', 'OPERATOR', 'Bhiwandi DC', false),
          _buildTeamMemberRow('Karan Verma', 'STORE ASSOCIATE', 'Phoenix Palassio', false),
        ],
      ),
    );
  }

  Widget _buildAlertRow(String title, String subtitle, bool isUrgent, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: Row(
          children: [
            Container(
              width: 6,
              height: 6,
              decoration: BoxDecoration(
                color: isUrgent ? LedgerColors.error : LedgerColors.primary,
                shape: BoxShape.circle,
              ),
            ),
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

  Widget _buildBarRow(String label, int count, double fraction) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label, style: LedgerTypography.bodySm()),
              Text('$count', style: LedgerTypography.mono(fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 3),
          ClipRRect(
            borderRadius: BorderRadius.circular(2),
            child: LinearProgressIndicator(
              value: fraction,
              backgroundColor: LedgerColors.surfaceVariant,
              valueColor: const AlwaysStoppedAnimation<Color>(LedgerColors.primary),
              minHeight: 6,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOpsCard(String code, String desc, String status, String note) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
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
              Text(code, style: LedgerTypography.mono(fontWeight: FontWeight.w600)),
              Text(status, style: LedgerTypography.labelMd(color: LedgerColors.positive)),
            ],
          ),
          const SizedBox(height: 4),
          Text(desc, style: LedgerTypography.bodyMd()),
          const SizedBox(height: 2),
          Text(note, style: LedgerTypography.bodySm(color: LedgerColors.onSurfaceMuted)),
        ],
      ),
    );
  }

  Widget _buildUsageBar(String label, String fractionText, double progress) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label, style: LedgerTypography.bodySm()),
              Text(fractionText, style: LedgerTypography.mono(fontSize: 12)),
            ],
          ),
          const SizedBox(height: 4),
          ClipRRect(
            borderRadius: BorderRadius.circular(2),
            child: LinearProgressIndicator(
              value: progress,
              backgroundColor: LedgerColors.surfaceVariant,
              valueColor: const AlwaysStoppedAnimation<Color>(LedgerColors.primary),
              minHeight: 5,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTeamMemberRow(String name, String role, String scope, bool isOwner) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: LedgerColors.surface,
        borderRadius: BorderRadius.circular(LedgerRadius.md),
        border: Border.all(color: LedgerColors.outline),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(name, style: LedgerTypography.labelLg()),
              Text(scope, style: LedgerTypography.bodySm()),
            ],
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: isOwner ? LedgerColors.primary : LedgerColors.surfaceVariant,
              borderRadius: BorderRadius.circular(LedgerRadius.sm),
            ),
            child: Text(
              role,
              style: LedgerTypography.labelSm(
                color: isOwner ? LedgerColors.onPrimary : LedgerColors.onSurface,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _DualChartPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final outboundPaint = Paint()
      ..color = LedgerColors.data1
      ..strokeWidth = 2.4
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final inboundPaint = Paint()
      ..color = LedgerColors.data3
      ..strokeWidth = 1.6
      ..style = PaintingStyle.stroke;

    final outboundData = [30.0, 45.0, 60.0, 50.0, 75.0, 90.0, 110.0];
    final inboundData = [40.0, 50.0, 40.0, 65.0, 55.0, 80.0, 70.0];

    final pathOut = Path();
    final pathIn = Path();

    for (int i = 0; i < 7; i++) {
      final x = (i / 6) * size.width;
      final yOut = size.height - (outboundData[i] / 120.0) * size.height;
      final yIn = size.height - (inboundData[i] / 120.0) * size.height;

      if (i == 0) {
        pathOut.moveTo(x, yOut);
        pathIn.moveTo(x, yIn);
      } else {
        pathOut.lineTo(x, yOut);
        pathIn.lineTo(x, yIn);
      }
    }

    canvas.drawPath(pathIn, inboundPaint);
    canvas.drawPath(pathOut, outboundPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
