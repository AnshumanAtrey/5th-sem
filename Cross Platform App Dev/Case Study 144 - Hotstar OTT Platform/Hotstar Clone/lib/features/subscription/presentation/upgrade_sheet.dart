import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/badges.dart';
import '../domain/plan.dart';

Future<void> showUpgradeSheet(BuildContext context, {required Plan required, required String reason}) {
  return showModalBottomSheet<void>(
    context: context,
    builder: (sheetContext) => SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            TierBadge(required, large: true),
            const SizedBox(height: 14),
            Text(reason, style: Theme.of(sheetContext).textTheme.titleLarge),
            const SizedBox(height: 6),
            Text(
              '${required.label} is ${required.priceLabel} and includes:',
              style: const TextStyle(color: AppColors.textMuted),
            ),
            const SizedBox(height: 12),
            for (final b in required.benefits) BenefitRow(b),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: () {
                  Navigator.of(sheetContext).pop();
                  context.push('/plans');
                },
                child: const Text('See plans'),
              ),
            ),
          ],
        ),
      ),
    ),
  );
}

class BenefitRow extends StatelessWidget {
  const BenefitRow(this.text, {super.key});

  final String text;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 4),
    child: Row(
      children: [
        const Icon(Icons.check_circle_rounded, size: 18, color: AppColors.teal),
        const SizedBox(width: 10),
        Expanded(child: Text(text)),
      ],
    ),
  );
}
