import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../account/data/account_repository.dart';
import '../../catalog/domain/age_rating.dart';
import '../domain/parental_settings.dart';

/// Titles unlocked with the PIN during this app session. The set clears
/// when the app restarts or the rating limit changes.
class ParentalGate extends Notifier<Set<String>> {
  final attempts = PinAttempts();

  @override
  Set<String> build() {
    ref.watch(parentalSettingsProvider.select((s) => (s.enabled, s.maxRating)));
    return const {};
  }

  /// Checks [pin] and, if it's right, unlocks [contentId] for this session.
  bool unlock(String contentId, String pin) {
    final ok = attempts.attempt(ref.read(parentalSettingsProvider).verify(pin));
    if (ok) state = {...state, contentId};
    return ok;
  }

  bool verify(String pin) => attempts.attempt(ref.read(parentalSettingsProvider).verify(pin));
}

final parentalGateProvider = NotifierProvider<ParentalGate, Set<String>>(ParentalGate.new);

/// Rebuilds when either the settings or the unlocked set change.
final isParentalLockedProvider = Provider.family<bool, (String, AgeRating)>((ref, key) {
  final settings = ref.watch(parentalSettingsProvider);
  final unlocked = ref.watch(parentalGateProvider);
  return settings.restricts(key.$2) && !unlocked.contains(key.$1);
});
