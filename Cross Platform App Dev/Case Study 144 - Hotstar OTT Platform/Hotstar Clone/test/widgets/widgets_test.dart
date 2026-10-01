import 'dart:convert';
import 'dart:io';

import 'package:hotstar_clone/core/theme/app_theme.dart';
import 'package:hotstar_clone/core/widgets/content_cards.dart';
import 'package:hotstar_clone/features/auth/data/auth_repository.dart';
import 'package:hotstar_clone/features/auth/presentation/sign_in_screen.dart';
import 'package:hotstar_clone/features/catalog/domain/content.dart';
import 'package:hotstar_clone/features/parental/domain/parental_settings.dart';
import 'package:hotstar_clone/features/parental/presentation/pin_pad.dart';
import 'package:hotstar_clone/features/reviews/data/reviews_repository.dart';
import 'package:hotstar_clone/features/reviews/presentation/reviews_section.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod/misc.dart' show Override;
import 'package:flutter_test/flutter_test.dart';

/// Stands in for Firebase Auth; records calls and fails sign-in on demand.
class FakeAuth implements AuthRepository {
  final calls = <String>[];

  @override
  Stream<AppUser?> authStateChanges() => Stream.value(null);

  @override
  AppUser? get currentUser => null;

  @override
  Future<AppUser> signIn({required String email, required String password}) async {
    calls.add('signIn:$email');
    throw const AuthFailure('Email or password is incorrect.');
  }

  @override
  Future<AppUser> signUp({required String name, required String email, required String password}) async {
    calls.add('signUp:$email');
    return AppUser(uid: 'u1', email: email, displayName: name);
  }

  @override
  Future<void> sendPasswordReset(String email) async => calls.add('reset:$email');

  @override
  Future<void> signOut() async {}
}

Widget _app(Widget child, {List<Override> overrides = const []}) => ProviderScope(
  overrides: overrides,
  child: MaterialApp(
    theme: AppTheme.dark(),
    home: Scaffold(body: child),
  ),
);

void main() {
  group('Sign-in form', () {
    testWidgets('shows validation errors and never calls the backend when empty', (tester) async {
      final auth = FakeAuth();
      await tester.pumpWidget(_app(const SignInScreen(), overrides: [authRepositoryProvider.overrideWithValue(auth)]));

      await tester.tap(find.widgetWithText(FilledButton, 'Sign in'));
      await tester.pump();

      expect(find.text('Enter your email'), findsOneWidget);
      expect(find.text('Enter your password'), findsOneWidget);
      expect(auth.calls, isEmpty);
    });

    testWidgets('create-account mode enforces the password policy', (tester) async {
      final auth = FakeAuth();
      await tester.pumpWidget(_app(const SignInScreen(), overrides: [authRepositoryProvider.overrideWithValue(auth)]));

      await tester.tap(find.text('Create account').first);
      await tester.pumpAndSettle();
      await tester.enterText(find.widgetWithText(TextFormField, 'Your name'), 'Anshuman');
      await tester.enterText(find.widgetWithText(TextFormField, 'Email'), 'a@atrey.dev');
      await tester.enterText(find.widgetWithText(TextFormField, 'Password'), 'password');
      await tester.tap(find.widgetWithText(FilledButton, 'Create account'));
      await tester.pump();

      expect(find.text('Use both letters and numbers'), findsOneWidget);
      expect(auth.calls, isEmpty);
    });

    testWidgets('shows a friendly error when the backend rejects sign-in', (tester) async {
      final auth = FakeAuth();
      await tester.pumpWidget(_app(const SignInScreen(), overrides: [authRepositoryProvider.overrideWithValue(auth)]));

      await tester.enterText(find.widgetWithText(TextFormField, 'Email'), 'a@atrey.dev');
      await tester.enterText(find.widgetWithText(TextFormField, 'Password'), 'wrong-pass-1');
      await tester.tap(find.widgetWithText(FilledButton, 'Sign in'));
      await tester.pumpAndSettle();

      expect(auth.calls, ['signIn:a@atrey.dev']);
      expect(find.text('Email or password is incorrect.'), findsOneWidget);
    });
  });

  group('Spoiler reviews', () {
    testWidgets('are hidden until tapped', (tester) async {
      final semantics = tester.ensureSemantics();
      final review = Review(
        uid: 'x',
        author: 'Riya',
        stars: 4,
        text: 'The dragon was Scales all along.',
        spoiler: true,
        createdAt: DateTime.now(),
      );
      await tester.pumpWidget(_app(ReviewTile(review: review)));

      expect(find.text('Tap to reveal'), findsOneWidget);
      expect(find.bySemanticsLabel('Spoiler hidden. Double tap to reveal.'), findsOneWidget);

      await tester.tap(find.text('Tap to reveal'));
      await tester.pump();

      expect(find.text('Tap to reveal'), findsNothing);
      expect(find.text('Hide'), findsOneWidget);
      semantics.dispose();
    });

    testWidgets('your own spoiler is never hidden from you', (tester) async {
      final review = Review(
        uid: 'me',
        author: 'Me',
        stars: 5,
        text: 'Big twist!!',
        spoiler: true,
        createdAt: DateTime.now(),
      );
      await tester.pumpWidget(_app(ReviewTile(review: review, isMine: true)));
      expect(find.text('Tap to reveal'), findsNothing);
    });
  });

  group('PIN pad', () {
    Future<void> enter(WidgetTester tester, String pin) async {
      for (final d in pin.split('')) {
        await tester.tap(find.widgetWithText(TextButton, d));
        await tester.pump();
      }
      await tester.pumpAndSettle();
    }

    testWidgets('counts down attempts, then locks', (tester) async {
      final attempts = PinAttempts();
      await tester.pumpWidget(
        _app(
          Center(
            child: PinPad(attempts: attempts, onComplete: (_) => attempts.attempt(false)),
          ),
        ),
      );

      await enter(tester, '1234');
      expect(find.textContaining('4 tries left'), findsOneWidget);

      for (var i = 0; i < 4; i++) {
        await enter(tester, '0000');
      }
      expect(attempts.isLocked, isTrue);
      expect(find.textContaining('Locked'), findsOneWidget);
    });

    testWidgets('accepts the right PIN', (tester) async {
      String? accepted;
      await tester.pumpWidget(
        _app(
          Center(
            child: PinPad(
              onComplete: (pin) {
                accepted = pin;
                return true;
              },
            ),
          ),
        ),
      );
      await enter(tester, '4821');
      expect(accepted, '4821');
    });
  });

  group('Poster card', () {
    late Content sintel;
    setUpAll(() {
      final json = jsonDecode(File('assets/data/catalog.json').readAsStringSync()) as Map<String, dynamic>;
      sintel = Catalog.fromJson(json).byId('sintel')!;
    });

    testWidgets('shows the tier badge and the parental lock', (tester) async {
      final semantics = tester.ensureSemantics();
      await tester.pumpWidget(
        _app(
          Center(
            child: PosterCard(content: sintel, locked: true, onTap: () {}),
          ),
        ),
      );
      expect(find.text('SUPER'), findsOneWidget);
      expect(find.byIcon(Icons.lock_rounded), findsOneWidget);
      expect(find.bySemanticsLabel(RegExp('locked by parental controls')), findsOneWidget);
      semantics.dispose();
    });

    testWidgets('is tappable', (tester) async {
      var taps = 0;
      await tester.pumpWidget(
        _app(
          Center(
            child: PosterCard(content: sintel, onTap: () => taps++),
          ),
        ),
      );
      await tester.tap(find.byType(PosterCard));
      expect(taps, 1);
    });
  });
}
