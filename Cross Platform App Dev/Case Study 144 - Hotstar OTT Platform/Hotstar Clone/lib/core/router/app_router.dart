import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/data/auth_repository.dart';
import '../../features/auth/presentation/sign_in_screen.dart';
import '../../features/catalog/presentation/detail_screen.dart';
import '../../features/catalog/presentation/home_screen.dart';
import '../../features/catalog/presentation/person_screen.dart';
import '../../features/catalog/presentation/search_screen.dart';
import '../../features/downloads/presentation/downloads_screen.dart';
import '../../features/live/presentation/live_room_screen.dart';
import '../../features/live/presentation/live_screen.dart';
import '../../features/parental/presentation/parental_screen.dart';
import '../../features/player/presentation/player_screen.dart';
import '../../features/profile/presentation/profile_screen.dart';
import '../../features/subscription/presentation/plans_screen.dart';
import '../widgets/brand.dart';
import 'app_shell.dart';

final _rootKey = GlobalKey<NavigatorState>();

final routerProvider = Provider<GoRouter>((ref) {
  // go_router re-runs `redirect` whenever this notifier changes.
  final auth = ValueNotifier<AsyncValue<AppUser?>>(const AsyncLoading());
  ref.listen(authStateProvider, (_, next) => auth.value = next, fireImmediately: true);
  ref.onDispose(auth.dispose);

  return GoRouter(
    navigatorKey: _rootKey,
    initialLocation: '/',
    refreshListenable: auth,
    redirect: (context, state) {
      final loc = state.matchedLocation;
      if (auth.value.isLoading && !auth.value.hasValue) return loc == '/splash' ? null : '/splash';
      final signedIn = auth.value.value != null;
      if (!signedIn) return loc == '/sign-in' ? null : '/sign-in';
      if (loc == '/sign-in' || loc == '/splash') return '/';
      return null;
    },
    routes: [
      GoRoute(path: '/splash', builder: (_, _) => const _Splash()),
      GoRoute(path: '/sign-in', builder: (_, _) => const SignInScreen()),
      StatefulShellRoute.indexedStack(
        builder: (context, state, shell) => AppShell(shell: shell),
        branches: [
          StatefulShellBranch(
            routes: [GoRoute(path: '/', builder: (_, _) => const HomeScreen())],
          ),
          StatefulShellBranch(
            routes: [GoRoute(path: '/search', builder: (_, _) => const SearchScreen())],
          ),
          StatefulShellBranch(
            routes: [GoRoute(path: '/live', builder: (_, _) => const LiveScreen())],
          ),
          StatefulShellBranch(
            routes: [GoRoute(path: '/downloads', builder: (_, _) => const DownloadsScreen())],
          ),
          StatefulShellBranch(
            routes: [GoRoute(path: '/me', builder: (_, _) => const ProfileScreen())],
          ),
        ],
      ),
      GoRoute(
        path: '/title/:id',
        parentNavigatorKey: _rootKey,
        builder: (_, s) => DetailScreen(contentId: s.pathParameters['id']!),
      ),
      GoRoute(
        path: '/person/:id',
        parentNavigatorKey: _rootKey,
        builder: (_, s) => PersonScreen(personId: s.pathParameters['id']!),
      ),
      GoRoute(
        path: '/watch/:id',
        parentNavigatorKey: _rootKey,
        builder: (_, s) =>
            PlayerScreen(contentId: s.pathParameters['id']!, offline: s.uri.queryParameters['offline'] == '1'),
      ),
      GoRoute(
        path: '/live/:id',
        parentNavigatorKey: _rootKey,
        builder: (_, s) => LiveRoomScreen(channelId: s.pathParameters['id']!),
      ),
      GoRoute(path: '/plans', parentNavigatorKey: _rootKey, builder: (_, _) => const PlansScreen()),
      GoRoute(path: '/parental', parentNavigatorKey: _rootKey, builder: (_, _) => const ParentalScreen()),
    ],
  );
});

class _Splash extends StatelessWidget {
  const _Splash();

  @override
  Widget build(BuildContext context) => const Scaffold(body: Center(child: BrandMark(size: 30)));
}
