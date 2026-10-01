import 'dart:convert';
import 'dart:math';

import 'package:crypto/crypto.dart';

import '../../catalog/domain/age_rating.dart';

class ParentalSettings {
  const ParentalSettings({this.enabled = false, this.pinHash, this.salt, this.maxRating = AgeRating.ua13});

  final bool enabled;
  final String? pinHash;
  final String? salt;

  /// The highest rating that plays without asking for the PIN.
  final AgeRating maxRating;

  bool get hasPin => pinHash != null && salt != null;

  bool restricts(AgeRating rating) => enabled && rating.isAbove(maxRating);

  bool verify(String pin) => hasPin && PinHasher.hash(pin, salt!) == pinHash;

  ParentalSettings copyWith({bool? enabled, AgeRating? maxRating}) => ParentalSettings(
    enabled: enabled ?? this.enabled,
    pinHash: pinHash,
    salt: salt,
    maxRating: maxRating ?? this.maxRating,
  );

  ParentalSettings withPin(String pin) {
    final salt = PinHasher.newSalt();
    return ParentalSettings(enabled: true, pinHash: PinHasher.hash(pin, salt), salt: salt, maxRating: maxRating);
  }

  Map<String, dynamic> toMap() => {'enabled': enabled, 'pinHash': pinHash, 'salt': salt, 'maxRating': maxRating.name};

  factory ParentalSettings.fromMap(Map<String, dynamic>? map) => map == null
      ? const ParentalSettings()
      : ParentalSettings(
          enabled: map['enabled'] as bool? ?? false,
          pinHash: map['pinHash'] as String?,
          salt: map['salt'] as String?,
          maxRating: AgeRating.parse(map['maxRating'] as String? ?? 'ua13'),
        );
}

/// The PIN is never stored, only a salted SHA-256 of it. Note that a 4-digit
/// PIN has just 10,000 options, so the hash only keeps it out of plain
/// sight. The real protection is [PinAttempts] locking the PIN pad after
/// repeated wrong guesses.
abstract final class PinHasher {
  static String hash(String pin, String salt) => sha256.convert(utf8.encode('$salt:$pin')).toString();

  static String newSalt() {
    final rng = Random.secure();
    return base64Url.encode(List<int>.generate(16, (_) => rng.nextInt(256)));
  }

  static bool isValidPin(String pin) => RegExp(r'^\d{4}$').hasMatch(pin);
}

/// Locks the PIN pad for 30s after 5 wrong attempts.
class PinAttempts {
  PinAttempts({DateTime Function()? clock}) : _clock = clock ?? DateTime.now;

  static const maxAttempts = 5;
  static const lockout = Duration(seconds: 30);

  final DateTime Function() _clock;
  int _failures = 0;
  DateTime? _lockedUntil;

  Duration? get remainingLock {
    final until = _lockedUntil;
    if (until == null) return null;
    final left = until.difference(_clock());
    if (left <= Duration.zero) {
      _lockedUntil = null;
      _failures = 0;
      return null;
    }
    return left;
  }

  bool get isLocked => remainingLock != null;

  int get attemptsLeft => maxAttempts - _failures;

  /// Returns true if the PIN was accepted.
  bool attempt(bool correct) {
    if (isLocked) return false;
    if (correct) {
      _failures = 0;
      return true;
    }
    _failures++;
    if (_failures >= maxAttempts) _lockedUntil = _clock().add(lockout);
    return false;
  }
}
