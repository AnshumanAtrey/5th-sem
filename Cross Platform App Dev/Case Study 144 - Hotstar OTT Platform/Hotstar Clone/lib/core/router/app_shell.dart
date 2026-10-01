import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../widgets/brand.dart';

/// Bottom navigation on phones. Side rail on tablets and TVs (840dp and
/// wider, Material 3's "expanded" size class).
class AppShell extends StatelessWidget {
  const AppShell({super.key, required this.shell});

  final StatefulNavigationShell shell;

  static const _destinations = [
    (Icons.home_outlined, Icons.home_rounded, 'Home'),
    (Icons.search_rounded, Icons.search_rounded, 'Search'),
    (Icons.sensors_outlined, Icons.sensors_rounded, 'Live'),
    (Icons.download_outlined, Icons.download_rounded, 'Downloads'),
    (Icons.person_outline_rounded, Icons.person_rounded, 'My Space'),
  ];

  void _go(int i) => shell.goBranch(i, initialLocation: i == shell.currentIndex);

  @override
  Widget build(BuildContext context) {
    final wide = MediaQuery.sizeOf(context).width >= 840;
    if (wide) {
      return Scaffold(
        body: Row(
          children: [
            NavigationRail(
              selectedIndex: shell.currentIndex,
              onDestinationSelected: _go,
              labelType: NavigationRailLabelType.all,
              leading: const Padding(padding: EdgeInsets.symmetric(vertical: 16), child: BrandMark(size: 16)),
              destinations: [
                for (final (icon, selected, label) in _destinations)
                  NavigationRailDestination(icon: Icon(icon), selectedIcon: Icon(selected), label: Text(label)),
              ],
            ),
            const VerticalDivider(width: 1),
            Expanded(child: shell),
          ],
        ),
      );
    }
    return Scaffold(
      body: shell,
      bottomNavigationBar: NavigationBar(
        selectedIndex: shell.currentIndex,
        onDestinationSelected: _go,
        destinations: [
          for (final (icon, selected, label) in _destinations)
            NavigationDestination(icon: Icon(icon), selectedIcon: Icon(selected), label: label),
        ],
      ),
    );
  }
}
