import 'package:flutter/material.dart';
import '../theme/ledger_theme.dart';

class NavItemData {
  final String label;
  final IconData icon;

  const NavItemData({required this.label, required this.icon});
}

class LedgerBottomNav extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;
  final List<NavItemData> items;

  const LedgerBottomNav({
    super.key,
    required this.currentIndex,
    required this.onTap,
    required this.items,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: LedgerColors.surface,
        border: Border(top: BorderSide(color: LedgerColors.outline, width: 1)),
      ),
      padding: EdgeInsets.only(
        top: 6,
        bottom: MediaQuery.of(context).padding.bottom > 0
            ? MediaQuery.of(context).padding.bottom
            : 8,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: List.generate(items.length, (index) {
          final isSelected = index == currentIndex;
          final item = items[index];
          return Expanded(
            child: InkWell(
              onTap: () => onTap(index),
              splashColor: Colors.transparent,
              highlightColor: Colors.transparent,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    item.icon,
                    size: 22,
                    color: isSelected
                        ? LedgerColors.primary
                        : LedgerColors.onSurfaceMuted,
                  ),
                  const SizedBox(height: 3),
                  Text(
                    item.label,
                    style: LedgerTypography.labelSm(
                      color: isSelected
                          ? LedgerColors.primary
                          : LedgerColors.onSurfaceMuted,
                    ).copyWith(
                      fontWeight:
                          isSelected ? FontWeight.w600 : FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Container(
                    width: 4,
                    height: 4,
                    decoration: BoxDecoration(
                      color: isSelected
                          ? LedgerColors.primary
                          : Colors.transparent,
                      shape: BoxShape.circle,
                    ),
                  ),
                ],
              ),
            ),
          );
        }),
      ),
    );
  }
}
