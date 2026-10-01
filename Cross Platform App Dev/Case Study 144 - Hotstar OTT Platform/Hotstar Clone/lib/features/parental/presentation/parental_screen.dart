import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/badges.dart';
import '../../account/data/account_repository.dart';
import '../../auth/data/auth_repository.dart';
import '../../catalog/domain/age_rating.dart';
import '../application/parental_gate.dart';
import '../domain/parental_settings.dart';
import 'pin_pad.dart';

class ParentalScreen extends ConsumerStatefulWidget {
  const ParentalScreen({super.key});

  @override
  ConsumerState<ParentalScreen> createState() => _ParentalScreenState();
}

class _ParentalScreenState extends ConsumerState<ParentalScreen> {
  /// Enter the PIN once per visit to change settings.
  bool _verified = false;

  Future<void> _save(ParentalSettings s) async {
    final uid = ref.read(currentUserProvider)?.uid;
    if (uid != null) await ref.read(accountRepositoryProvider).setParental(uid, s);
  }

  Future<bool> _requirePin() async {
    final settings = ref.read(parentalSettingsProvider);
    if (!settings.hasPin || _verified) return true;
    final gate = ref.read(parentalGateProvider.notifier);
    final ok = await askForPin(
      context,
      title: 'Enter your PIN',
      subtitle: 'Needed to change parental controls',
      attempts: gate.attempts,
      verify: gate.verify,
    );
    if (ok) setState(() => _verified = true);
    return ok;
  }

  /// New PIN, then confirm it. Resolves to the PIN, or null if cancelled.
  Future<String?> _createPin() async {
    String? first;
    String? confirmed;
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (sheetContext) => StatefulBuilder(
        builder: (sheetContext, setSheet) => SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  first == null ? 'Choose a 4-digit PIN' : 'Enter it again to confirm',
                  style: Theme.of(sheetContext).textTheme.titleLarge,
                ),
                const SizedBox(height: 4),
                const Text(
                  "Avoid easy ones like 1234 or your birth year.",
                  style: TextStyle(color: AppColors.textMuted),
                ),
                const SizedBox(height: 20),
                PinPad(
                  key: ValueKey(first == null),
                  onComplete: (pin) {
                    if (!PinHasher.isValidPin(pin)) return false;
                    if (first == null) {
                      setSheet(() => first = pin);
                      return true;
                    }
                    if (pin != first) return false;
                    confirmed = pin;
                    Navigator.of(sheetContext).pop();
                    return true;
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
    return confirmed;
  }

  Future<void> _setUpOrChangePin() async {
    if (!await _requirePin()) return;
    final pin = await _createPin();
    if (pin == null) return;
    await _save(ref.read(parentalSettingsProvider).withPin(pin));
    setState(() => _verified = true);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Parental PIN saved')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final settings = ref.watch(parentalSettingsProvider);
    final text = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(title: const Text('Parental controls')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 32),
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(16)),
            child: Row(
              children: [
                const Icon(Icons.shield_moon_rounded, size: 34, color: AppColors.primary),
                const SizedBox(width: 14),
                Expanded(
                  child: Text(
                    'Titles rated above your limit are locked behind a PIN on every device you sign in on. '
                    'Ratings follow India’s OTT age classes (U, U/A 7+, 13+, 16+, A).',
                    style: text.bodyMedium?.copyWith(color: Colors.white70),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          if (!settings.hasPin)
            FilledButton.icon(
              onPressed: _setUpOrChangePin,
              icon: const Icon(Icons.pin_outlined),
              label: const Text('Set up a PIN'),
            )
          else ...[
            SwitchListTile(
              value: settings.enabled,
              title: const Text('Parental controls', style: TextStyle(fontWeight: FontWeight.w700)),
              subtitle: Text(settings.enabled ? 'On' : 'Off'),
              onChanged: (on) async {
                if (await _requirePin()) await _save(settings.copyWith(enabled: on));
              },
            ),
            const SizedBox(height: 8),
            Text('Allow without PIN up to', style: text.titleMedium),
            const SizedBox(height: 8),
            RadioGroup<AgeRating>(
              groupValue: settings.maxRating,
              onChanged: (v) async {
                if (v != null && await _requirePin()) await _save(settings.copyWith(maxRating: v));
              },
              child: Column(
                children: [
                  for (final r in AgeRating.values.where((r) => r != AgeRating.a))
                    RadioListTile<AgeRating>(
                      value: r,
                      enabled: settings.enabled,
                      title: Row(children: [AgeRatingBadge(r), const SizedBox(width: 10), Text(r.label)]),
                      subtitle: Text(r.description),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: _setUpOrChangePin,
              icon: const Icon(Icons.password_rounded),
              label: const Text('Change PIN'),
            ),
          ],
        ],
      ),
    );
  }
}
