import 'package:flutter/material.dart';
import '../theme/ledger_theme.dart';

class LedgerNumpad extends StatelessWidget {
  final ValueChanged<String> onNumberPressed;
  final VoidCallback onDeletePressed;
  final VoidCallback? onSubmitPressed;

  const LedgerNumpad({
    super.key,
    required this.onNumberPressed,
    required this.onDeletePressed,
    this.onSubmitPressed,
  });

  Widget _buildKey(BuildContext context, String value, {bool isAction = false, Widget? customChild}) {
    return Expanded(
      child: InkWell(
        onTap: () {
          if (value == 'DEL') {
            onDeletePressed();
          } else if (value == 'OK') {
            onSubmitPressed?.call();
          } else {
            onNumberPressed(value);
          }
        },
        borderRadius: BorderRadius.circular(LedgerRadius.md),
        child: Container(
          height: 56,
          margin: const EdgeInsets.all(4),
          decoration: BoxDecoration(
            color: isAction ? LedgerColors.surfaceVariant : LedgerColors.surface,
            borderRadius: BorderRadius.circular(LedgerRadius.md),
            border: Border.all(color: LedgerColors.outline, width: 1),
          ),
          alignment: Alignment.center,
          child: customChild ??
              Text(
                value,
                style: LedgerTypography.headlineLg(
                  color: isAction ? LedgerColors.onSurfaceVariant : LedgerColors.onSurface,
                ),
              ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          children: [
            _buildKey(context, '1'),
            _buildKey(context, '2'),
            _buildKey(context, '3'),
          ],
        ),
        Row(
          children: [
            _buildKey(context, '4'),
            _buildKey(context, '5'),
            _buildKey(context, '6'),
          ],
        ),
        Row(
          children: [
            _buildKey(context, '7'),
            _buildKey(context, '8'),
            _buildKey(context, '9'),
          ],
        ),
        Row(
          children: [
            _buildKey(
              context,
              'DEL',
              isAction: true,
              customChild: const Icon(Icons.backspace_outlined, size: 20, color: LedgerColors.onSurfaceVariant),
            ),
            _buildKey(context, '0'),
            _buildKey(
              context,
              'OK',
              isAction: true,
              customChild: const Icon(Icons.check, size: 22, color: LedgerColors.positive),
            ),
          ],
        ),
      ],
    );
  }
}
