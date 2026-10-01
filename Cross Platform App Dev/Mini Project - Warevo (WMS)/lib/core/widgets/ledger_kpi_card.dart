import 'package:flutter/material.dart';
import '../theme/ledger_theme.dart';

class LedgerKpiCard extends StatelessWidget {
  final String value;
  final String label;
  final String? delta;
  final bool? isPositive; // true: green ▲, false: red ▼
  final String? note;
  final List<double>? sparklineData;
  final VoidCallback? onTap;

  const LedgerKpiCard({
    super.key,
    required this.value,
    required this.label,
    this.delta,
    this.isPositive,
    this.note,
    this.sparklineData,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(LedgerRadius.lg),
      child: Container(
        padding: const EdgeInsets.all(LedgerSpacing.cardPadding),
        decoration: BoxDecoration(
          color: LedgerColors.surface,
          borderRadius: BorderRadius.circular(LedgerRadius.lg),
          border: Border.all(color: LedgerColors.outline, width: 1),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Value gets the full card width so the number never clips. On a narrow
            // two-column card, a "12% vs yest" badge beside a big number does not fit,
            // so the delta sits on its own line just under the value instead.
            FittedBox(
              fit: BoxFit.scaleDown,
              alignment: Alignment.centerLeft,
              child: Text(value, style: LedgerTypography.headlineDisplay(), maxLines: 1),
            ),
            if (delta != null) ...[
              const SizedBox(height: LedgerSpacing.xs),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: isPositive == true
                      ? LedgerColors.positiveSoft
                      : (isPositive == false ? LedgerColors.errorSoft : LedgerColors.surfaceVariant),
                  borderRadius: BorderRadius.circular(LedgerRadius.sm),
                ),
                child: Text(
                  '${isPositive == true ? "▲ " : (isPositive == false ? "▼ " : "")}$delta',
                  style: LedgerTypography.labelMd(
                    color: isPositive == true
                        ? LedgerColors.positive
                        : (isPositive == false ? LedgerColors.error : LedgerColors.onSurfaceVariant),
                  ),
                ),
              ),
            ],
            const SizedBox(height: LedgerSpacing.xs),
            // Uppercase Label
            Text(
              label.toUpperCase(),
              style: LedgerTypography.labelSm(),
            ),
            // Sparkline band if available
            if (sparklineData != null && sparklineData!.isNotEmpty) ...[
              const SizedBox(height: LedgerSpacing.sm),
              SizedBox(
                height: 20,
                child: CustomPaint(
                  size: const Size(double.infinity, 20),
                  painter: _SparklinePainter(
                    data: sparklineData!,
                    color: isPositive == true ? LedgerColors.positive : LedgerColors.data1,
                  ),
                ),
              ),
            ],
            // Note
            if (note != null) ...[
              const SizedBox(height: LedgerSpacing.xs),
              Text(
                note!,
                style: LedgerTypography.bodySm(),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _SparklinePainter extends CustomPainter {
  final List<double> data;
  final Color color;

  _SparklinePainter({required this.data, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    if (data.length < 2) return;

    final paint = Paint()
      ..color = color
      ..strokeWidth = 1.8
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final double minVal = data.reduce((a, b) => a < b ? a : b);
    final double maxVal = data.reduce((a, b) => a > b ? a : b);
    final double range = (maxVal - minVal) == 0 ? 1.0 : (maxVal - minVal);

    final path = Path();
    for (int i = 0; i < data.length; i++) {
      final double x = (i / (data.length - 1)) * size.width;
      final double y = size.height - ((data[i] - minVal) / range) * (size.height - 4) - 2;
      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant _SparklinePainter oldDelegate) => true;
}
