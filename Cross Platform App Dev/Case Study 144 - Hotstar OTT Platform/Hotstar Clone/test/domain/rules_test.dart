import 'package:hotstar_clone/features/catalog/domain/age_rating.dart';
import 'package:hotstar_clone/features/downloads/domain/download_record.dart';
import 'package:hotstar_clone/features/live/domain/watch_party.dart';
import 'package:hotstar_clone/features/parental/domain/parental_settings.dart';
import 'package:hotstar_clone/features/subscription/domain/access_policy.dart';
import 'package:hotstar_clone/features/subscription/domain/plan.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Plan & AccessPolicy', () {
    test('tiers are ordered and include lower tiers', () {
      expect(Plan.premium.includes(Plan.superPlan), isTrue);
      expect(Plan.mobile.includes(Plan.superPlan), isFalse);
      expect(Plan.values.map((p) => p.pricePerYear), [0, 499, 899, 1499]);
    });

    test('quality caps match the case study (Premium = 4K)', () {
      expect(Plan.values.map((p) => p.qualityLabel), ['480p', '720p', '1080p', '4K']);
    });

    test('a lower plan needs an upgrade', () {
      final a = AccessPolicy.canWatch(plan: Plan.free, required: Plan.superPlan, device: DeviceClass.phone);
      expect(a, isA<NeedsUpgrade>().having((x) => x.required, 'required', Plan.superPlan));
    });

    test('Mobile plan is phones only', () {
      expect(
        AccessPolicy.canWatch(plan: Plan.mobile, required: Plan.free, device: DeviceClass.largeScreen),
        isA<DeviceNotSupported>(),
      );
      expect(
        AccessPolicy.canWatch(plan: Plan.superPlan, required: Plan.free, device: DeviceClass.largeScreen),
        isA<Allowed>(),
      );
    });

    test('downloads need a paid plan that covers the title', () {
      expect(AccessPolicy.canDownload(plan: Plan.free, required: Plan.free), isFalse);
      expect(AccessPolicy.canDownload(plan: Plan.mobile, required: Plan.mobile), isTrue);
      expect(AccessPolicy.canDownload(plan: Plan.mobile, required: Plan.superPlan), isFalse);
    });

    test('cheapest plan for a height', () {
      expect(AccessPolicy.planForHeight(720), Plan.mobile);
      expect(AccessPolicy.planForHeight(750), Plan.superPlan);
      expect(AccessPolicy.planForHeight(2048), Plan.premium);
    });

    test('device class uses the 600dp breakpoint', () {
      expect(DeviceClass.fromShortestSide(411), DeviceClass.phone);
      expect(DeviceClass.fromShortestSide(600), DeviceClass.largeScreen);
    });
  });

  group('Parental controls', () {
    test('PIN is stored as a salted hash and verifies', () {
      final s = const ParentalSettings().withPin('4821');
      expect(s.pinHash, isNot(contains('4821')));
      expect(s.verify('4821'), isTrue);
      expect(s.verify('4822'), isFalse);
    });

    test('same PIN, different salt, different hash', () {
      final a = const ParentalSettings().withPin('1111');
      final b = const ParentalSettings().withPin('1111');
      expect(a.pinHash, isNot(b.pinHash));
    });

    test('only restricts ratings above the limit, and only when enabled', () {
      const s = ParentalSettings(enabled: true, pinHash: 'x', salt: 'y', maxRating: AgeRating.ua7);
      expect(s.restricts(AgeRating.u), isFalse);
      expect(s.restricts(AgeRating.ua7), isFalse);
      expect(s.restricts(AgeRating.ua13), isTrue);
      expect(s.copyWith(enabled: false).restricts(AgeRating.a), isFalse);
    });

    test('PIN format is exactly 4 digits', () {
      expect(PinHasher.isValidPin('0420'), isTrue);
      expect(PinHasher.isValidPin('42'), isFalse);
      expect(PinHasher.isValidPin('12a4'), isFalse);
    });

    test('locks for 30 s after 5 wrong attempts, then resets', () {
      var now = DateTime(2026, 10, 1, 12);
      final attempts = PinAttempts(clock: () => now);
      for (var i = 0; i < 4; i++) {
        expect(attempts.attempt(false), isFalse);
      }
      expect(attempts.isLocked, isFalse);
      expect(attempts.attemptsLeft, 1);
      attempts.attempt(false);
      expect(attempts.isLocked, isTrue);
      expect(attempts.attempt(true), isFalse, reason: 'even the right PIN is refused while locked');
      now = now.add(const Duration(seconds: 31));
      expect(attempts.isLocked, isFalse);
      expect(attempts.attempt(true), isTrue);
    });

    test('serialises round trip', () {
      final s = const ParentalSettings(maxRating: AgeRating.ua16).withPin('9087');
      final back = ParentalSettings.fromMap(s.toMap());
      expect(back.verify('9087'), isTrue);
      expect(back.maxRating, AgeRating.ua16);
      expect(back.enabled, isTrue);
    });
  });

  group('Download expiry', () {
    final done = DateTime(2026, 10, 1);
    DownloadRecord record({DateTime? played}) => DownloadRecord(
      contentId: 'x',
      title: 'X',
      quality: '720p',
      filePath: '/tmp/x.mp4',
      status: DownloadStatus.completed,
      receivedBytes: 10,
      totalBytes: 10,
      startedAt: done,
      completedAt: done,
      firstPlayedAt: played,
    );

    test('unwatched downloads last 30 days', () {
      expect(ExpiryPolicy.expiresAt(record()), done.add(const Duration(days: 30)));
      expect(ExpiryPolicy.isExpired(record(), done.add(const Duration(days: 29))), isFalse);
      expect(ExpiryPolicy.isExpired(record(), done.add(const Duration(days: 30))), isTrue);
    });

    test('48 hours after the first play, whichever comes first', () {
      final played = done.add(const Duration(days: 2));
      expect(ExpiryPolicy.expiresAt(record(played: played)), played.add(const Duration(hours: 48)));
      final late = done.add(const Duration(days: 29, hours: 12));
      expect(ExpiryPolicy.expiresAt(record(played: late)), done.add(const Duration(days: 30)));
    });

    test('winding the clock back does not extend a download', () {
      var system = DateTime(2026, 11, 5);
      int? stored;
      final clock = TamperProofClock(lastSeenMs: null, persist: (ms) => stored = ms, system: () => system);
      expect(clock.now(), system);
      system = DateTime(2026, 10, 2); // user sets the date back a month
      expect(clock.now(), DateTime(2026, 11, 5));
      expect(stored, DateTime(2026, 11, 5).millisecondsSinceEpoch);
    });

    test('record survives a Hive round trip', () {
      final r = record(played: DateTime(2026, 10, 3));
      final back = DownloadRecord.fromMap(r.toMap());
      expect(back.firstPlayedAt, r.firstPlayedAt);
      expect(back.status, DownloadStatus.completed);
    });
  });

  group('Watch party sync', () {
    const loop = Duration(seconds: 635);

    test('every device computes the same playhead from the clock', () {
      final t = DateTime.utc(2026, 10, 1, 20, 0, 7);
      expect(WatchParty.playhead(t, loop), WatchParty.playhead(t.toLocal(), loop));
      final later = t.add(const Duration(seconds: 5));
      expect(WatchParty.playhead(later, loop) - WatchParty.playhead(t, loop), const Duration(seconds: 5));
    });

    test('playhead wraps around the loop', () {
      final t = WatchParty.anchor.add(loop * 3 + const Duration(seconds: 12));
      expect(WatchParty.playhead(t, loop), const Duration(seconds: 12));
    });

    test('drift check tolerates small offsets and handles the wrap', () {
      expect(WatchParty.isDrifted(const Duration(seconds: 100), const Duration(seconds: 102), loop), isFalse);
      expect(WatchParty.isDrifted(const Duration(seconds: 100), const Duration(seconds: 110), loop), isTrue);
      expect(WatchParty.isDrifted(const Duration(seconds: 634), const Duration(seconds: 1), loop), isFalse);
    });
  });
}
