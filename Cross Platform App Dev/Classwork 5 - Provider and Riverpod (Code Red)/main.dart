// Classwork 5 - Provider & Riverpod: Mission Code Red ("The Undercover Agent Switcher")
// Cross Platform App Development, Sem 5
// Anshuman Atrey
//
// the brief: an intelligence app was leaking "Guest: Alex". fix it. think of a Riverpod provider as
// a single source of truth that any screen can read or change. we:
//   1. start userProvider at 'Agent 007' (not Guest)
//   2. add an "Activate Alias" button in DetailScreen
//   3. tapping it calls ref.read(userProvider.notifier).set('Supreme Ninja')
//   4. the GoRouter detail path is /shell/details/TargetAcquired (was .../Alex)
// expected: before tap -> "Agent 007: TargetAcquired", after tap -> "Supreme Ninja: TargetAcquired".
//
// needs these packages in pubspec.yaml:
//   flutter_riverpod: ^2.5.0
//   go_router: ^14.0.0

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

// the single source of truth for the current agent name, exposing a set() to change it.
class UserNotifier extends Notifier<String> {
  @override
  String build() => 'Agent 007'; // fix #1: initial state is no longer 'Guest'/'Alex'

  void set(String name) => state = name; // fix #3 target
}

final userProvider = NotifierProvider<UserNotifier, String>(UserNotifier.new);

// fix #4: the detail path now carries 'TargetAcquired' instead of 'Alex'.
final router = GoRouter(
  initialLocation: '/shell/details/TargetAcquired',
  routes: [
    GoRoute(
      path: '/shell/details/:target',
      builder: (context, state) =>
          DetailScreen(target: state.pathParameters['target'] ?? ''),
    ),
  ],
);

void main() => runApp(const ProviderScope(child: MyApp()));

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      debugShowCheckedModeBanner: false,
      routerConfig: router,
      theme: ThemeData(primarySwatch: Colors.red, useMaterial3: true),
    );
  }
}

// ConsumerWidget so this screen can watch the provider and rebuild when the name changes.
class DetailScreen extends ConsumerWidget {
  final String target;
  const DetailScreen({super.key, required this.target});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(userProvider); // live value from the provider

    return Scaffold(
      appBar: AppBar(title: const Text('Mission Code Red')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              '$user: $target',
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              // fix #2 + #3: the button flips the alias through the notifier.
              onPressed: () =>
                  ref.read(userProvider.notifier).set('Supreme Ninja'),
              child: const Text('Activate Alias'),
            ),
          ],
        ),
      ),
    );
  }
}
