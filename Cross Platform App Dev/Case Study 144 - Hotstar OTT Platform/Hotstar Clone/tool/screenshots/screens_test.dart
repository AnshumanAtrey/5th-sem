// Renders every screen offscreen with fake repositories and saves PNGs, for
// a visual check without a device (and for the README).
//
//   flutter test tool/screenshots/screens_test.dart --update-goldens
//
// It lives outside test/, so CI doesn't run it: font rendering differs
// between macOS and Linux, which would make golden comparisons flaky.
import 'dart:io';

import 'package:hotstar_clone/app.dart';
import 'package:hotstar_clone/core/router/app_router.dart';
import 'package:hotstar_clone/core/storage/local_storage.dart';
import 'package:hotstar_clone/features/account/data/account_repository.dart';
import 'package:hotstar_clone/features/auth/data/auth_repository.dart';
import 'package:hotstar_clone/features/catalog/data/catalog_repository.dart';
import 'package:hotstar_clone/features/catalog/domain/age_rating.dart';
import 'package:hotstar_clone/features/downloads/domain/download_record.dart';
import 'package:hotstar_clone/features/live/data/live_repository.dart';
import 'package:hotstar_clone/features/parental/domain/parental_settings.dart';
import 'package:hotstar_clone/features/player/presentation/player_controls.dart';
import 'package:hotstar_clone/features/progress/data/progress_repository.dart';
import 'package:hotstar_clone/features/reviews/data/reviews_repository.dart';
import 'package:hotstar_clone/features/subscription/domain/plan.dart';
import 'package:hotstar_clone/core/theme/app_theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hive_ce/hive_ce.dart';

import '../../test/support/fakes.dart';

late Box<dynamic> downloads;
late Box<dynamic> meta;

Future<void> _loadFonts() async {
  for (final family in ['Manrope', 'ManropeExt']) {
    final loader = FontLoader(family);
    for (final w in [400, 500, 600, 700, 800]) {
      loader.addFont(rootBundle.load('assets/fonts/$family-$w.ttf'));
    }
    await loader.load();
  }
  final root = Platform.environment['FLUTTER_ROOT']!;
  final icons = FontLoader('MaterialIcons')
    ..addFont(
      Future.value(
        ByteData.sublistView(
          File('$root/bin/cache/artifacts/material_fonts/MaterialIcons-Regular.otf').readAsBytesSync(),
        ),
      ),
    );
  await icons.load();
}

final _reviews = [
  Review(
    uid: 'r1',
    author: 'Riya',
    stars: 5,
    text: 'Ten minutes of pure joy. The animation still holds up beautifully.',
    spoiler: false,
    createdAt: DateTime.now().subtract(const Duration(hours: 3)),
  ),
  Review(
    uid: 'r2',
    author: 'Kabir',
    stars: 4,
    text: 'The ending where the bunny turns the tables on the bullies is perfect.',
    spoiler: true,
    createdAt: DateTime.now().subtract(const Duration(days: 2)),
  ),
];

final _chat = [
  ChatMessage(id: '3', uid: 'x', author: 'Meera', text: 'this squirrel is so dramatic 😂', sentAt: DateTime.now()),
  ChatMessage(
    id: '2',
    uid: 'u1',
    author: 'Anshuman',
    text: 'Watch party works across devices!',
    sentAt: DateTime.now(),
  ),
  ChatMessage(id: '1', uid: 'y', author: 'Dev', text: 'joined from my tablet', sentAt: DateTime.now()),
];

Future<ProviderContainer> _pumpApp(
  WidgetTester tester, {
  Plan plan = Plan.free,
  bool signedIn = true,
  ParentalSettings parental = const ParentalSettings(),
  Size size = const Size(412, 915),
}) async {
  tester.view.physicalSize = size * 2;
  tester.view.devicePixelRatio = 2;
  addTearDown(tester.view.reset);

  await tester.pumpWidget(
    ProviderScope(
      overrides: [
        authRepositoryProvider.overrideWithValue(FakeAuthRepository(user: signedIn ? testUser : null)),
        accountRepositoryProvider.overrideWithValue(FakeAccountRepository(plan: plan, parental: parental)),
        progressRepositoryProvider.overrideWithValue(
          FakeProgressRepository([
            WatchProgress(
              contentId: 'big-buck-bunny',
              position: const Duration(minutes: 6, seconds: 40),
              duration: const Duration(seconds: 635),
              updatedAt: DateTime.now(),
            ),
            WatchProgress(
              contentId: 'elephants-dream',
              position: const Duration(minutes: 2),
              duration: const Duration(seconds: 658),
              updatedAt: DateTime.now(),
            ),
          ]),
        ),
        reviewsRepositoryProvider.overrideWithValue(FakeReviewsRepository(_reviews)),
        liveRepositoryProvider.overrideWithValue(FakeLiveRepository(_chat)),
        downloadsBoxProvider.overrideWithValue(downloads),
        metaBoxProvider.overrideWithValue(meta),
      ],
      child: const HotstarCloneApp(),
    ),
  );
  final container = ProviderScope.containerOf(tester.element(find.byType(HotstarCloneApp)));
  await tester.runAsync(() => container.read(catalogProvider.future));
  await _settle(tester);
  return container;
}

/// Pumps frames and decodes every visible image (decoding is real async work).
Future<void> _settle(WidgetTester tester) async {
  for (var i = 0; i < 3; i++) {
    await tester.pump(const Duration(milliseconds: 300));
    await tester.runAsync(() async {
      for (final element in find.byType(Image).evaluate()) {
        await precacheImage((element.widget as Image).image, element);
      }
    });
  }
  await tester.pump(const Duration(milliseconds: 300));
}

Future<void> _go(WidgetTester tester, ProviderContainer c, String location) async {
  c.read(routerProvider).go(location);
  await _settle(tester);
}

Future<void> _shot(String name) => expectLater(find.byType(MaterialApp), matchesGoldenFile('shots/$name.png'));

void main() {
  setUpAll(() async {
    await _loadFonts();
    Hive.init(Directory.systemTemp.createTempSync('hotstar_clone').path);
    downloads = await Hive.openBox<dynamic>('downloads');
    meta = await Hive.openBox<dynamic>('meta');
    final now = DateTime.now();
    await downloads.put(
      'big-buck-bunny',
      DownloadRecord(
        contentId: 'big-buck-bunny',
        title: 'Big Buck Bunny',
        quality: '180p',
        filePath: '/nonexistent/bbb.mp4',
        status: DownloadStatus.completed,
        receivedBytes: 64657027,
        totalBytes: 64657027,
        startedAt: now.subtract(const Duration(days: 1)),
        completedAt: now.subtract(const Duration(days: 1)),
      ).toMap(),
    );
    await downloads.put(
      'elephants-dream',
      DownloadRecord(
        contentId: 'elephants-dream',
        title: 'Elephants Dream',
        quality: '480p',
        filePath: '/nonexistent/ed.mov',
        status: DownloadStatus.paused,
        receivedBytes: 41 * 1024 * 1024,
        totalBytes: 104 * 1024 * 1024,
        startedAt: now,
      ).toMap(),
    );
  });

  testWidgets('01 sign in', (tester) async {
    await _pumpApp(tester, signedIn: false);
    await _shot('01_sign_in');
  });

  testWidgets('02-03 home', (tester) async {
    await _pumpApp(tester);
    await _shot('02_home');
    await tester.drag(find.byType(CustomScrollView).first, const Offset(0, -900));
    await _settle(tester);
    await _shot('03_home_rails');
  });

  testWidgets('04-06 detail', (tester) async {
    final c = await _pumpApp(tester);
    await _go(tester, c, '/title/sintel');
    await _shot('04_detail_locked');
    await _go(tester, c, '/title/big-buck-bunny');
    await _shot('05_detail_free');
    await tester.drag(find.byType(CustomScrollView).first, const Offset(0, -700));
    await _settle(tester);
    await _shot('06_detail_reviews');
  });

  testWidgets('07 plans', (tester) async {
    final c = await _pumpApp(tester);
    await _go(tester, c, '/plans');
    await _shot('07_plans');
  });

  testWidgets('08 search, 09 person', (tester) async {
    final c = await _pumpApp(tester);
    await _go(tester, c, '/search');
    await _shot('08_search');
    await _go(tester, c, '/person/jan-morgenstern');
    await _shot('09_person');
  });

  testWidgets('10 live, 11 downloads, 12 profile', (tester) async {
    final c = await _pumpApp(tester, plan: Plan.premium);
    await _go(tester, c, '/live');
    await _shot('10_live');
    await _go(tester, c, '/downloads');
    await _shot('11_downloads');
    await _go(tester, c, '/me');
    await _shot('12_profile');
  });

  testWidgets('13 parental', (tester) async {
    final parental = const ParentalSettings(maxRating: AgeRating.ua7).withPin('4821');
    final c = await _pumpApp(tester, parental: parental);
    await _go(tester, c, '/parental');
    await _shot('13_parental');
    await _go(tester, c, '/');
    await tester.drag(find.byType(CustomScrollView).first, const Offset(0, -900));
    await _settle(tester);
    await _shot('14_home_parental_locks');
  });

  testWidgets('15 tablet home', (tester) async {
    await _pumpApp(tester, plan: Plan.superPlan, size: const Size(1280, 800));
    await _shot('15_tablet_home');
  });

  testWidgets('16 ad break', (tester) async {
    tester.view.physicalSize = const Size(915, 412) * 2;
    tester.view.devicePixelRatio = 2;
    addTearDown(tester.view.reset);
    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.dark(),
        home: Scaffold(
          body: AdBreak(onFinished: () {}, onUpgrade: () {}),
        ),
      ),
    );
    await tester.pump(const Duration(seconds: 6));
    await _shot('16_ad_break');
    await tester.pump(const Duration(seconds: 5));
  });
}
