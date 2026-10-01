import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../../core/theme/app_theme.dart';
import '../domain/parental_settings.dart';

/// A 4-digit keypad. It calls [onComplete] once all 4 digits are entered.
/// If that returns false, the dots shake and clear.
class PinPad extends StatefulWidget {
  const PinPad({super.key, required this.onComplete, this.attempts});

  final FutureOr<bool> Function(String pin) onComplete;

  /// When given, shows attempts left and the lockout countdown.
  final PinAttempts? attempts;

  @override
  State<PinPad> createState() => _PinPadState();
}

class _PinPadState extends State<PinPad> with SingleTickerProviderStateMixin {
  String _pin = '';
  String? _error;
  Timer? _ticker;
  late final _shake = AnimationController(vsync: this, duration: const Duration(milliseconds: 380));

  @override
  void initState() {
    super.initState();
    _startTickerIfLocked();
  }

  @override
  void dispose() {
    _ticker?.cancel();
    _shake.dispose();
    super.dispose();
  }

  void _startTickerIfLocked() {
    if (widget.attempts?.isLocked != true) return;
    _ticker?.cancel();
    _ticker = Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted) return t.cancel();
      setState(() {});
      if (widget.attempts?.isLocked != true) t.cancel();
    });
  }

  Future<void> _tap(String digit) async {
    if (widget.attempts?.isLocked == true || _pin.length == 4) return;
    HapticFeedback.selectionClick();
    setState(() {
      _pin += digit;
      _error = null;
    });
    if (_pin.length < 4) return;
    final ok = await widget.onComplete(_pin);
    if (!mounted || ok) return;
    HapticFeedback.heavyImpact();
    await _shake.forward(from: 0);
    setState(() {
      _pin = '';
      final a = widget.attempts;
      _error = a == null
          ? "PINs don't match"
          : a.isLocked
          ? 'Too many attempts'
          : 'Wrong PIN · ${a.attemptsLeft} ${a.attemptsLeft == 1 ? 'try' : 'tries'} left';
    });
    _startTickerIfLocked();
  }

  void _backspace() {
    if (_pin.isEmpty) return;
    setState(() => _pin = _pin.substring(0, _pin.length - 1));
  }

  @override
  Widget build(BuildContext context) {
    final lock = widget.attempts?.remainingLock;
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        AnimatedBuilder(
          animation: _shake,
          builder: (context, child) {
            final t = _shake.value;
            final dx = t == 0 ? 0.0 : 10 * (1 - t) * ((t * 20).floor().isEven ? 1 : -1);
            return Transform.translate(offset: Offset(dx, 0), child: child);
          },
          child: Semantics(
            label: '${_pin.length} of 4 digits entered',
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                for (var i = 0; i < 4; i++)
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 120),
                    margin: const EdgeInsets.symmetric(horizontal: 9),
                    width: 16,
                    height: 16,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: i < _pin.length ? AppColors.primary : Colors.transparent,
                      border: Border.all(color: i < _pin.length ? AppColors.primary : Colors.white38, width: 2),
                    ),
                  ),
              ],
            ),
          ),
        ),
        SizedBox(
          height: 36,
          child: Center(
            child: Text(
              lock != null ? 'Locked · try again in ${lock.inSeconds + 1}s' : (_error ?? ''),
              style: const TextStyle(color: AppColors.live, fontWeight: FontWeight.w600),
            ),
          ),
        ),
        for (final row in const [
          ['1', '2', '3'],
          ['4', '5', '6'],
          ['7', '8', '9'],
          ['', '0', '⌫'],
        ])
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              for (final key in row)
                Padding(
                  padding: const EdgeInsets.all(6),
                  child: SizedBox(
                    width: 68,
                    height: 56,
                    child: key.isEmpty
                        ? null
                        : TextButton(
                            style: TextButton.styleFrom(
                              backgroundColor: key == '⌫' ? Colors.transparent : AppColors.surfaceHighest,
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            ),
                            onPressed: lock != null ? null : () => key == '⌫' ? _backspace() : _tap(key),
                            child: key == '⌫'
                                ? const Icon(Icons.backspace_outlined, semanticLabel: 'Delete')
                                : Text(key, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700)),
                          ),
                  ),
                ),
            ],
          ),
      ],
    );
  }
}

/// Asks for the PIN in a bottom sheet. Resolves to true once it's correct.
Future<bool> askForPin(
  BuildContext context, {
  required String title,
  required String subtitle,
  required PinAttempts attempts,
  required bool Function(String pin) verify,
}) async {
  final ok = await showModalBottomSheet<bool>(
    context: context,
    isScrollControlled: true,
    builder: (sheetContext) => SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.shield_moon_rounded, size: 36, color: AppColors.primary),
            const SizedBox(height: 12),
            Text(title, style: Theme.of(sheetContext).textTheme.titleLarge, textAlign: TextAlign.center),
            const SizedBox(height: 4),
            Text(
              subtitle,
              style: const TextStyle(color: AppColors.textMuted),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            PinPad(
              attempts: attempts,
              onComplete: (pin) {
                final correct = verify(pin);
                if (correct) Navigator.of(sheetContext).pop(true);
                return correct;
              },
            ),
          ],
        ),
      ),
    ),
  );
  return ok ?? false;
}
