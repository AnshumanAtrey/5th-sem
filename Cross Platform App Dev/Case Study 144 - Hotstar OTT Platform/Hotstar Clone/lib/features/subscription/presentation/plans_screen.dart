import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/badges.dart';
import '../../account/data/account_repository.dart';
import '../../auth/data/auth_repository.dart';
import '../domain/plan.dart';
import 'upgrade_sheet.dart';

class PlansScreen extends ConsumerWidget {
  const PlansScreen({super.key});

  Future<void> _choose(BuildContext context, WidgetRef ref, Plan plan) async {
    final current = ref.read(profileProvider).value?.plan ?? Plan.free;
    final ok = await showModalBottomSheet<bool>(
      context: context,
      builder: (sheetContext) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              TierBadge(plan, large: true),
              const SizedBox(height: 12),
              Text(
                plan == Plan.free ? 'Switch to Free?' : '${plan.label} · ${plan.priceLabel}',
                style: Theme.of(sheetContext).textTheme.titleLarge,
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.gold.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.gold.withValues(alpha: 0.4)),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.science_outlined, color: AppColors.gold, size: 20),
                    SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Demo checkout: no payment is taken. The plan changes right away, so you can try each tier.',
                      ),
                    ),
                  ],
                ),
              ),
              if (current.familySharing && !plan.familySharing) ...[
                const SizedBox(height: 10),
                const Text(
                  'Your family members lose Premium access.',
                  style: TextStyle(color: AppColors.live, fontWeight: FontWeight.w600),
                ),
              ],
              const SizedBox(height: 18),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: () => Navigator.pop(sheetContext, true),
                  child: Text(plan == Plan.free ? 'Switch to Free' : 'Confirm ${plan.label}'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
    if (ok != true) return;
    final uid = ref.read(currentUserProvider)?.uid;
    if (uid == null) return;
    await ref.read(accountRepositoryProvider).setPlan(uid, plan);
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('You’re on ${plan.label} now')));
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final own = ref.watch(profileProvider).value?.plan ?? Plan.free;
    final viaFamily = ref.watch(isFamilyMemberProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Choose your plan')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 32),
        children: [
          if (viaFamily)
            Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(12)),
              child: const Text('You have Premium through a family plan. Your own plan is shown below.'),
            ),
          for (final plan in Plan.values)
            _PlanCard(
              plan: plan,
              current: plan == own,
              onChoose: plan == own ? null : () => _choose(context, ref, plan),
            ),
          const SizedBox(height: 16),
          Text('Compare plans', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 10),
          const _CompareTable(),
        ],
      ),
    );
  }
}

class _PlanCard extends StatelessWidget {
  const _PlanCard({required this.plan, required this.current, required this.onChoose});

  final Plan plan;
  final bool current;
  final VoidCallback? onChoose;

  @override
  Widget build(BuildContext context) {
    final colors = TierBadge.colors(plan);
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(18),
        color: AppColors.surface,
        border: Border.all(color: current ? colors.first : AppColors.outline, width: current ? 2 : 1),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                TierBadge(plan, large: true),
                const Spacer(),
                if (current)
                  const Text(
                    'Your plan',
                    style: TextStyle(fontWeight: FontWeight.w800, color: AppColors.teal),
                  ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  plan.pricePerYear == 0 ? '₹0' : '₹${plan.pricePerYear}',
                  style: Theme.of(context).textTheme.headlineMedium,
                ),
                Padding(
                  padding: const EdgeInsets.only(bottom: 5, left: 4),
                  child: Text(
                    plan.pricePerYear == 0 ? 'forever' : '/year · about ₹${(plan.pricePerYear / 12).round()}/month',
                    style: const TextStyle(color: AppColors.textMuted),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            for (final b in plan.benefits) BenefitRow(b),
            if (onChoose != null) ...[
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: plan == Plan.free
                    ? OutlinedButton(onPressed: onChoose, child: const Text('Switch to Free'))
                    : FilledButton(onPressed: onChoose, child: Text('Get ${plan.label}')),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _CompareTable extends StatelessWidget {
  const _CompareTable();

  @override
  Widget build(BuildContext context) {
    Widget cell(String text, {bool header = false}) => Padding(
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 6),
      child: Text(
        text,
        textAlign: TextAlign.center,
        style: TextStyle(
          fontWeight: header ? FontWeight.w800 : FontWeight.w600,
          fontSize: 12.5,
          color: header ? Colors.white : Colors.white70,
        ),
      ),
    );

    String yes(bool v) => v ? '✓' : '—';

    final rows = <(String, String Function(Plan))>[
      ('Price', (p) => p.pricePerYear == 0 ? 'Free' : '₹${p.pricePerYear}'),
      ('Quality', (p) => p.qualityLabel),
      ('Ads', (p) => p.showsAds ? 'Yes' : 'No'),
      ('Downloads', (p) => yes(p.allowsDownloads)),
      ('TV & tablet', (p) => yes(p.allowsLargeScreens)),
      ('Screens', (p) => '${p.screens}'),
      ('Family', (p) => yes(p.familySharing)),
    ];

    return Container(
      decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(14)),
      padding: const EdgeInsets.all(8),
      child: Table(
        columnWidths: const {0: FlexColumnWidth(1.4)},
        defaultVerticalAlignment: TableCellVerticalAlignment.middle,
        children: [
          TableRow(children: [cell('', header: true), for (final p in Plan.values) cell(p.label, header: true)]),
          for (final (label, value) in rows)
            TableRow(
              decoration: const BoxDecoration(
                border: Border(top: BorderSide(color: AppColors.outline)),
              ),
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 6),
                  child: Text(
                    label,
                    style: const TextStyle(color: AppColors.textMuted, fontWeight: FontWeight.w600),
                  ),
                ),
                for (final p in Plan.values) cell(value(p)),
              ],
            ),
        ],
      ),
    );
  }
}
