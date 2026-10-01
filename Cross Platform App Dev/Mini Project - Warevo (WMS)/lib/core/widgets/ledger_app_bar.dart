import 'package:flutter/material.dart';
import '../theme/ledger_theme.dart';

class LedgerAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final String? syncStatus;
  final bool isSyncUrgent;
  final Widget? leading;
  final List<Widget>? actions;
  final bool showDivider;
  final String? impersonatingTenant;
  final VoidCallback? onEndImpersonation;

  const LedgerAppBar({
    super.key,
    required this.title,
    this.syncStatus,
    this.isSyncUrgent = false,
    this.leading,
    this.actions,
    this.showDivider = true,
    this.impersonatingTenant,
    this.onEndImpersonation,
  });

  @override
  Size get preferredSize => Size.fromHeight(impersonatingTenant != null ? 92.0 : 58.0);

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        AppBar(
          toolbarHeight: 56.0,
          backgroundColor: LedgerColors.neutral,
          surfaceTintColor: Colors.transparent,
          elevation: 0,
          scrolledUnderElevation: 0,
          leading: leading,
          titleSpacing: leading != null ? 0 : LedgerSpacing.screenGutter,
          title: Text(
            title,
            style: LedgerTypography.headlineLg(),
          ),
          actions: [
            if (syncStatus != null) ...[
              Container(
                margin: const EdgeInsets.only(right: LedgerSpacing.sm),
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: isSyncUrgent ? LedgerColors.errorSoft : LedgerColors.surfaceVariant,
                  borderRadius: BorderRadius.circular(LedgerRadius.full),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: BoxDecoration(
                        color: isSyncUrgent ? LedgerColors.error : LedgerColors.positive,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      syncStatus!,
                      style: LedgerTypography.labelMd(
                        color: isSyncUrgent ? LedgerColors.error : LedgerColors.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
            ],
            ...?actions,
          ],
        ),
        if (impersonatingTenant != null) ...[
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            color: LedgerColors.primary,
            child: Row(
              children: [
                const Icon(Icons.security, size: 14, color: LedgerColors.onPrimary),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Impersonating $impersonatingTenant as Aarav · 14:37 left',
                    style: LedgerTypography.labelMd(color: LedgerColors.onPrimary),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                if (onEndImpersonation != null)
                  GestureDetector(
                    onTap: onEndImpersonation,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.white24,
                        borderRadius: BorderRadius.circular(LedgerRadius.sm),
                      ),
                      child: Text(
                        'End',
                        style: LedgerTypography.labelMd(color: LedgerColors.onPrimary),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ],
        if (showDivider)
          const Divider(height: 1, thickness: 1, color: LedgerColors.outline),
      ],
    );
  }
}
