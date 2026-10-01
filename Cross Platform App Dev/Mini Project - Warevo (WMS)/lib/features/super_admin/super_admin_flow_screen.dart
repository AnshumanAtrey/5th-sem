import 'package:flutter/material.dart';
import '../../core/theme/ledger_theme.dart';
import '../../core/widgets/ledger_app_bar.dart';
import '../../core/widgets/ledger_bottom_nav.dart';
import '../../core/widgets/ledger_button.dart';
import '../../core/widgets/ledger_kpi_card.dart';
import '../../data/mock_database.dart';
import '../../state/app_state.dart';

class SuperAdminFlowScreen extends StatefulWidget {
  final AppState appState;

  const SuperAdminFlowScreen({super.key, required this.appState});

  @override
  State<SuperAdminFlowScreen> createState() => _SuperAdminFlowScreenState();
}

class _SuperAdminFlowScreenState extends State<SuperAdminFlowScreen> {
  int _tabIndex = 0;
  String _tenantFilter = 'All';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: LedgerColors.neutral,
      appBar: LedgerAppBar(
        title: _getTitle(),
        syncStatus: 'as of 6 min ago',
      ),
      body: SafeArea(
        child: IndexedStack(
          index: _tabIndex,
          children: [
            _buildHomeTab(),
            _buildTenantsTab(),
            _buildHealthTab(),
          ],
        ),
      ),
      bottomNavigationBar: LedgerBottomNav(
        currentIndex: _tabIndex,
        onTap: (i) => setState(() => _tabIndex = i),
        items: const [
          NavItemData(label: 'Platform', icon: Icons.insights_outlined),
          NavItemData(label: 'Tenants', icon: Icons.business_outlined),
          NavItemData(label: 'Health', icon: Icons.health_and_safety_outlined),
        ],
      ),
    );
  }

  String _getTitle() {
    switch (_tabIndex) {
      case 0:
        return 'Ledger · Platform';
      case 1:
        return 'Tenants (41)';
      case 2:
        return 'Platform Health';
      default:
        return 'Super Admin';
    }
  }

  Widget _buildHomeTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(LedgerSpacing.screenGutter),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Founders SaaS KPI Grid
          GridView.count(
            crossAxisCount: 2,
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            childAspectRatio: 1.15,
            children: const [
              LedgerKpiCard(
                value: '₹4.82 L',
                label: 'Monthly Recurring Revenue',
                delta: '8.3% vs last mo',
                isPositive: true,
                sparklineData: [2.8, 3.2, 3.6, 4.1, 4.4, 4.82],
              ),
              LedgerKpiCard(
                value: '₹57.8 L',
                label: 'ARR Run Rate',
                note: 'at current MRR',
              ),
              LedgerKpiCard(
                value: '₹38,000',
                label: 'Net New MRR',
                note: '+₹52K new · −₹23K churn',
                isPositive: true,
              ),
              LedgerKpiCard(
                value: '41',
                label: 'Active Tenants',
                note: '6 on trial · 2 past due',
              ),
            ],
          ),
          const SizedBox(height: LedgerSpacing.lg),
          // Costing more than they pay alert
          Container(
            padding: const EdgeInsets.all(LedgerSpacing.cardPadding),
            decoration: BoxDecoration(
              color: LedgerColors.surface,
              borderRadius: BorderRadius.circular(LedgerRadius.lg),
              border: Border.all(color: LedgerColors.error, width: 1.5),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text('COSTING MORE THAN THEY PAY',
                          style: LedgerTypography.labelSm(color: LedgerColors.error),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: LedgerColors.errorSoft,
                        borderRadius: BorderRadius.circular(LedgerRadius.sm),
                      ),
                      child: Text('−19% Gross Margin', style: LedgerTypography.mono(color: LedgerColors.error, fontSize: 11)),
                    ),
                  ],
                ),
                const SizedBox(height: LedgerSpacing.sm),
                Text('Ashva Apparel · Pays ₹12,000 · Firebase ₹14,300', style: LedgerTypography.headlineMd()),
                const SizedBox(height: 2),
                Text(
                  '1.6M location_stock docs · 48M reads/mo from 15-min POS polling across 40 stores.',
                  style: LedgerTypography.bodySm(color: LedgerColors.onSurfaceVariant),
                ),
                const SizedBox(height: LedgerSpacing.md),
                Row(
                  children: [
                    Expanded(
                      child: LedgerButton(
                        text: 'Economics',
                        style: LedgerButtonStyle.secondary,
                        height: 38,
                        onPressed: () => _showEconomicsDialog(),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: LedgerButton(
                        text: 'Impersonate',
                        style: LedgerButtonStyle.primary,
                        height: 38,
                        onPressed: () {
                          widget.appState.startImpersonation('Ashva Apparel');
                        },
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: LedgerSpacing.lg),
          // Trials expiring this week
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
                Text('Trials expiring this week', style: LedgerTypography.headlineMd()),
                const SizedBox(height: LedgerSpacing.sm),
                _buildTrialRow('Bloom Kids', '3 days left', '18 users · 1,200 SKUs · 41 locations'),
                const Divider(color: LedgerColors.outline),
                _buildTrialRow('Trail & Co', '5 days left', '6 users · 420 SKUs · 8 locations'),
              ],
            ),
          ),
          const SizedBox(height: LedgerSpacing.xxl),
        ],
      ),
    );
  }

  Widget _buildTenantsTab() {
    return ListView(
      padding: const EdgeInsets.all(LedgerSpacing.screenGutter),
      children: [
        Row(
          children: ['All (41)', 'Trial (6)', 'Active (33)', 'Past due (2)'].map((f) {
            final isSel = _tenantFilter == f.split(' ').first;
            return GestureDetector(
              onTap: () => setState(() => _tenantFilter = f.split(' ').first),
              child: Container(
                margin: const EdgeInsets.only(right: 8),
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: isSel ? LedgerColors.primary : LedgerColors.surfaceVariant,
                  borderRadius: BorderRadius.circular(LedgerRadius.full),
                ),
                child: Text(
                  f,
                  style: LedgerTypography.labelSm(
                    color: isSel ? LedgerColors.onPrimary : LedgerColors.onSurface,
                  ),
                ),
              ),
            );
          }).toList(),
        ),
        const SizedBox(height: LedgerSpacing.md),
        ...MockDatabase.superAdminTenants.map((t) {
          final isNegative = t.marginPercent < 0;
          return Container(
            margin: const EdgeInsets.only(bottom: 10),
            padding: const EdgeInsets.all(LedgerSpacing.cardPadding),
            decoration: BoxDecoration(
              color: LedgerColors.surface,
              borderRadius: BorderRadius.circular(LedgerRadius.lg),
              border: Border.all(
                color: isNegative ? LedgerColors.error : LedgerColors.outline,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(t.name, style: LedgerTypography.headlineMd()),
                    Text(
                      '₹${t.mrr} / mo',
                      style: LedgerTypography.mono(fontWeight: FontWeight.w700),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  '${t.plan} · ${t.users} users · ${t.locations} locations · Margin ${t.marginPercent}%',
                  style: LedgerTypography.bodySm(
                    color: isNegative ? LedgerColors.error : LedgerColors.onSurfaceVariant,
                  ),
                ),
                if (t.alert != null) ...[
                  const SizedBox(height: 4),
                  Text(t.alert!, style: LedgerTypography.bodySm(color: LedgerColors.error)),
                ],
                const SizedBox(height: LedgerSpacing.md),
                Row(
                  children: [
                    ActionChip(
                      label: Text('Extend Trial', style: LedgerTypography.labelSm()),
                      onPressed: () {},
                    ),
                    const SizedBox(width: 8),
                    ActionChip(
                      label: Text('Impersonate', style: LedgerTypography.labelSm()),
                      onPressed: () {
                        widget.appState.startImpersonation(t.name);
                      },
                    ),
                  ],
                ),
              ],
            ),
          );
        }),
      ],
    );
  }

  Widget _buildHealthTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(LedgerSpacing.screenGutter),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          GridView.count(
            crossAxisCount: 2,
            crossAxisSpacing: 8,
            mainAxisSpacing: 8,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            childAspectRatio: 1.25,
            children: const [
              LedgerKpiCard(value: '412 / 430', label: 'Connectors Live', delta: '18 stale', isPositive: false),
              LedgerKpiCard(value: '7', label: 'Oversell Events 24h', delta: '3 vs yest', isPositive: false),
              LedgerKpiCard(value: '0.2%', label: 'Cloud Function Errors', delta: '0.1pp', isPositive: true),
              LedgerKpiCard(value: '6 min', label: 'Sync Lag P95', note: 'Target under 15m'),
            ],
          ),
          const SizedBox(height: LedgerSpacing.lg),
          Text('FAILING POS CONNECTORS', style: LedgerTypography.labelSm(color: LedgerColors.error)),
          const SizedBox(height: LedgerSpacing.sm),
          _buildFailingConnectorCard('Kora Beauty · Indiranagar', 'Shopify POS · failing 2h 14m · 401 Unauthorized', 'Credential rotated · Ask tenant to reconnect'),
          _buildFailingConnectorCard('Model Town · Ghaziabad', 'Ginesys POS · failing 47m · Negative Stock Violation', 'Auto-quarantined from omni router'),
        ],
      ),
    );
  }

  void _showEconomicsDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => Container(
        padding: const EdgeInsets.all(LedgerSpacing.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Ashva Apparel · Unit Economics', style: LedgerTypography.headlineLg()),
            const SizedBox(height: 4),
            Text('Subscription: ₹12,000 / mo · Cloud Cost: ₹14,300 / mo', style: LedgerTypography.bodyMd(color: LedgerColors.error)),
            const SizedBox(height: LedgerSpacing.md),
            Text('COST DRIVERS', style: LedgerTypography.labelSm()),
            const SizedBox(height: 4),
            _buildCostRow('Firestore reads (48M reads)', '₹9,800', 0.68),
            _buildCostRow('Firestore writes (12M writes)', '₹3,100', 0.22),
            _buildCostRow('Cloud Functions invocation', '₹900', 0.06),
            _buildCostRow('Cloud Storage (photos)', '₹500', 0.04),
            const SizedBox(height: LedgerSpacing.lg),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: LedgerColors.surfaceVariant,
                borderRadius: BorderRadius.circular(LedgerRadius.md),
              ),
              child: Text(
                'Recommendation: Raise POS sync interval from 15m to 30m to reduce reads by 38% (save ₹3,700/mo) or upgrade them to Scale Plan (₹25,000).',
                style: LedgerTypography.bodySm(),
              ),
            ),
            const SizedBox(height: LedgerSpacing.lg),
            LedgerButton(
              text: 'Propose Scale Plan Upgrade',
              onPressed: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Proposal sent to Aarav Shah')));
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTrialRow(String name, String daysLeft, String usage) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(name, style: LedgerTypography.headlineMd()),
              Text(usage, style: LedgerTypography.bodySm(color: LedgerColors.onSurfaceMuted)),
            ],
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: LedgerColors.surfaceVariant,
              borderRadius: BorderRadius.circular(LedgerRadius.sm),
            ),
            child: Text(daysLeft, style: LedgerTypography.labelSm()),
          ),
        ],
      ),
    );
  }

  Widget _buildCostRow(String title, String cost, double fraction) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: LedgerTypography.bodySm()),
              Text(cost, style: LedgerTypography.mono(fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 2),
          ClipRRect(
            borderRadius: BorderRadius.circular(2),
            child: LinearProgressIndicator(
              value: fraction,
              backgroundColor: LedgerColors.surfaceVariant,
              valueColor: const AlwaysStoppedAnimation<Color>(LedgerColors.primary),
              minHeight: 5,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFailingConnectorCard(String title, String err, String action) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
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
          Text(err, style: LedgerTypography.bodySm(color: LedgerColors.error)),
          const SizedBox(height: 4),
          Text(action, style: LedgerTypography.bodySm(color: LedgerColors.onSurfaceMuted)),
        ],
      ),
    );
  }
}
