import 'package:flutter/material.dart';
import '../theme/ledger_theme.dart';

enum LedgerButtonStyle {
  primary,
  secondary,
  destructive,
  ghost,
}

class LedgerButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final LedgerButtonStyle style;
  final IconData? icon;
  final bool fullWidth;
  final double height;
  final bool isLoading;

  const LedgerButton({
    super.key,
    required this.text,
    this.onPressed,
    this.style = LedgerButtonStyle.primary,
    this.icon,
    this.fullWidth = true,
    this.height = LedgerSpacing.floorTarget, // 56px default
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    Color bgColor;
    Color textColor;
    Border? border;

    switch (style) {
      case LedgerButtonStyle.primary:
        bgColor = LedgerColors.primary;
        textColor = LedgerColors.onPrimary;
        border = null;
        break;
      case LedgerButtonStyle.secondary:
        bgColor = LedgerColors.surface;
        textColor = LedgerColors.onSurface;
        border = Border.all(color: LedgerColors.outlineStrong, width: 1);
        break;
      case LedgerButtonStyle.destructive:
        bgColor = LedgerColors.errorSoft;
        textColor = LedgerColors.error;
        border = Border.all(color: LedgerColors.error, width: 1);
        break;
      case LedgerButtonStyle.ghost:
        bgColor = Colors.transparent;
        textColor = LedgerColors.onSurfaceVariant;
        border = null;
        break;
    }

    if (onPressed == null) {
      bgColor = LedgerColors.surfaceVariant;
      textColor = LedgerColors.onSurfaceMuted;
      border = null;
    }

    Widget content = Row(
      mainAxisAlignment: MainAxisAlignment.center,
      mainAxisSize: fullWidth ? MainAxisSize.max : MainAxisSize.min,
      children: [
        if (isLoading) ...[
          SizedBox(
            width: 18,
            height: 18,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              valueColor: AlwaysStoppedAnimation<Color>(textColor),
            ),
          ),
          const SizedBox(width: LedgerSpacing.sm),
        ] else if (icon != null) ...[
          Icon(icon, size: 20, color: textColor),
          const SizedBox(width: LedgerSpacing.sm),
        ],
        // Flexible + ellipsis so a long label shrinks to its button instead of overflowing.
        Flexible(
          child: Text(
            text,
            style: LedgerTypography.floorAction(color: textColor),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            textAlign: TextAlign.center,
          ),
        ),
      ],
    );

    return InkWell(
      onTap: isLoading ? null : onPressed,
      borderRadius: BorderRadius.circular(LedgerRadius.md),
      child: Container(
        height: height,
        width: fullWidth ? double.infinity : null,
        padding: const EdgeInsets.symmetric(horizontal: LedgerSpacing.lg),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(LedgerRadius.md),
          border: border,
        ),
        alignment: Alignment.center,
        child: content,
      ),
    );
  }
}
