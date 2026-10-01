import 'dart:convert';
import 'dart:io';

import 'package:hotstar_clone/core/utils/formatters.dart';
import 'package:hotstar_clone/core/utils/validators.dart';
import 'package:hotstar_clone/features/catalog/domain/content.dart';
import 'package:hotstar_clone/features/catalog/domain/recommender.dart';
import 'package:hotstar_clone/features/catalog/presentation/search_screen.dart';
import 'package:hotstar_clone/features/player/application/subtitle_loader.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:video_player/video_player.dart';

void main() {
  late Catalog catalog;

  setUpAll(() {
    final raw = File('assets/data/catalog.json').readAsStringSync();
    catalog = Catalog.fromJson(jsonDecode(raw) as Map<String, dynamic>);
  });

  group('catalogue data', () {
    test('parses every title and live channel', () {
      expect(catalog.titles, hasLength(5));
      expect(catalog.live.map((l) => l.kind), containsAll([LiveKind.live, LiveKind.watchParty]));
    });

    test('every artwork file referenced exists', () {
      for (final t in catalog.titles) {
        expect(File(t.poster).existsSync(), isTrue, reason: t.poster);
        expect(File(t.backdrop).existsSync(), isTrue, reason: t.backdrop);
      }
    });

    test('every credit points at a known person', () {
      for (final t in catalog.titles) {
        for (final c in t.credits) {
          expect(catalog.people, contains(c.personId), reason: '${t.id} → ${c.personId}');
        }
      }
    });

    test('filmography finds all of a person’s titles and roles', () {
      final work = catalog.filmography('jan-morgenstern');
      expect(work.map((w) => w.$1.id), unorderedEquals(['sintel', 'big-buck-bunny', 'elephants-dream']));
      final ian = catalog.filmography('ian-hubert').single;
      expect(ian.$2.map((c) => c.role), ['Director', 'Writer']);
    });
  });

  group('recommendations', () {
    test('never recommends the title itself', () {
      final sintel = catalog.byId('sintel')!;
      expect(similarTo(sintel, catalog.titles).map((c) => c.id), isNot(contains('sintel')));
    });

    test('animated fantasy leans towards other animation', () {
      final sintel = catalog.byId('sintel')!;
      final top2 = similarTo(sintel, catalog.titles).take(2).map((c) => c.id);
      expect(top2, containsAll(['elephants-dream', 'big-buck-bunny']));
      expect(similarTo(sintel, catalog.titles).last.id, 'natgeo-4k');
    });
  });

  group('search', () {
    test('matches titles, genres and cast', () {
      expect(searchCatalog(catalog, 'halina').map((t) => t.id), ['sintel']);
      expect(searchCatalog(catalog, 'SCI-FI').map((t) => t.id), containsAll(['tears-of-steel', 'elephants-dream']));
      expect(searchCatalog(catalog, 'robots amsterdam').single.id, 'tears-of-steel');
    });

    test('genre filter narrows results', () {
      final r = searchCatalog(catalog, '', genre: 'Documentary');
      expect(r.single.id, 'natgeo-4k');
    });
  });

  group('subtitles', () {
    test('strips BOM, CRLF and <i> tags, then parses as SubRip', () {
      const raw =
          '﻿1\r\n00:00:01,000 --> 00:00:03,500\r\n<i>You’re Scales?</i>\r\n\r\n'
          '2\r\n00:00:04,000 --> 00:00:05,000\r\nYes.\r\n';
      final captions = SubRipCaptionFile(SubtitleLoader.normalise(raw)).captions;
      expect(captions, hasLength(2));
      expect(captions.first.text, 'You’re Scales?');
      expect(captions.first.start, const Duration(seconds: 1));
    });

    test('falls back to Latin-1 for non-UTF-8 files', () {
      expect(SubtitleLoader.decode([0x43, 0x61, 0x66, 0xE9]), 'Café');
    });
  });

  group('formatters & validators', () {
    test('runtime and clock', () {
      expect(formatRuntime(const Duration(seconds: 734)), '12m');
      expect(formatRuntime(const Duration(minutes: 125)), '2h 5m');
      expect(formatClock(const Duration(seconds: 734)), '12:14');
      expect(formatClock(const Duration(hours: 1, seconds: 9)), '1:00:09');
    });

    test('bytes and expiry', () {
      expect(formatBytes(65 * 1024 * 1024), '65.0 MB');
      expect(formatTimeLeft(const Duration(days: 29, hours: 3)), 'Expires in 29 days');
      expect(formatTimeLeft(const Duration(days: 28, hours: 23, minutes: 59)), 'Expires in 29 days');
      expect(formatTimeLeftShort(const Duration(days: 28, hours: 23)), '29d left');
      expect(formatTimeLeft(const Duration(hours: 5)), 'Expires in 5 h');
    });

    test('email and password rules', () {
      expect(Validators.email('anshuman@atrey.dev'), isNull);
      expect(Validators.email('not-an-email'), isNotNull);
      expect(Validators.password('short1'), isNotNull);
      expect(Validators.password('longpassword'), isNotNull);
      expect(Validators.password('longpassw0rd'), isNull);
    });

    test('review and chat limits', () {
      expect(Validators.reviewText('too short', min: 10, max: 500), isNotNull);
      expect(Validators.reviewText('Loved the dragon.', min: 10, max: 500), isNull);
      expect(Validators.chatMessage('   ', max: 200), isNotNull);
      expect(Validators.chatMessage('x' * 201, max: 200), isNotNull);
    });
  });
}
