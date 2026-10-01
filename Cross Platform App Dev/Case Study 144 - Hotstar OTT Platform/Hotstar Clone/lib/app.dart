import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';
import 'core/widgets/brand.dart';
import 'features/account/data/account_repository.dart';
import 'features/auth/data/auth_repository.dart';

class HotstarCloneApp extends ConsumerWidget {
  const HotstarCloneApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Every signed-in user gets a Firestore profile (plan, family, parental settings).
    ref.listen(currentUserProvider, (previous, next) {
      if (next != null && previous?.uid != next.uid) {
        ref
            .read(accountRepositoryProvider)
            .ensureProfile(next)
            .catchError((Object e) => debugPrint('ensureProfile failed (offline?): $e'));
      }
    });

    return MaterialApp.router(
      title: Brand.name,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.dark(),
      darkTheme: AppTheme.dark(),
      themeMode: ThemeMode.dark,
      routerConfig: ref.watch(routerProvider),
    );
  }
}
